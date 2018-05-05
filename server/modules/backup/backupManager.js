const constants = require('modules/constants');
const log = require('modules/utility/logger');
const config = require('modules/config').config;
const MongoDB = require('modules/databases/mongoDB');
const object = require('modules/utility/object');
const backupUtil = require('modules/utility/backup');
const task = require('modules/task/task');
const taskPool = require('modules/task/taskPool');
const actions = require('modules/constants/')

class BackupManager {

    constructor(localDB, backupConfig, serverSocket) {
        this.backupDB = object.selfish(new MongoDB(backupConfig));
        this.localDB = localDB;
        this.serverSocket = serverSocket;
        this.backupConfig = backupConfig;
        this.currentBackupCollections = null;
    }

    get backupStatus() {
        return this.backupConfig.status;
    }

    get nextBackupTime() {
        return this.backupConfig.nextBackupTime;
    }

    start() {
        if (!this.checkBackupAvailable()) {
            return;
        }

        const nextBackupTime = backupUtil.getNextBackupTime(this.backupConfig);
        this.updateBackupConfigToDB(
                    {
                        nextBackupTime: nextBackupTime? nextBackupTime.toLocaleString(): null ,
                        status: constants.backup.status.WAITING
                    }
                );
            
        const backupTask = task.newTask(this.backupConfig.id, 
                                        nextBackupTime.valueOf(), 
                                        constants.task.BACKUP, 
                                        {interval: this.backupConfig.interval});
            
        taskPool.addTask(backupTask);        
    }

    resume() {
        // go back to the status before stop
        return this.updateBackupConfigToDB(
            {
                status: this.backupConfig.statusBeforeStop,
                nextBackupTime: this.backupConfig.nextBackupTimeBeforeStop
            })
            .then(() => this.restart())
    }

    restart() {
        if(this.backupStatus == constants.backup.status.STOP) {
            return;
        }

        this.start();
        this.deleteExtraCopyDBs();
        this.deleteOverdueCopyDBs();
    }

    checkBackupAvailable() {
        if(this.backupStatus == constants.backup.status.STOP) {
            return false
        }

        return true;
    }

    stop() {
        return Promise.resolve()
            .then(() => {
                if(this.backupStatus == constants.backup.status.RUNNING) {
                    throw new Error('Failed to stop backup schedule, because backup is still running');
                }
            }) 
            .then(() => this.backupDB.close())
            .then(() => {
                return this.updateBackupConfigToDB(
                    {
                        status:constants.backup.status.STOP,
                        nextBackupTime: null,
                        nextBackupTimeBeforeStop: this.backupConfig.nextBackupTime,
                        statusBeforeStop: this.backupConfig.status
                    }
                );
            })
            .then(() => {
                this.removeAllTasksFromTaskPool();
                return this.addLog(`Stop all the backup tasks`);
            })
            .catch(err => {
                this.addLog(`Failed to stop backup for ${ err.message }`, 'error');
                throw err;
            })
    }

    backup() {
        const now = new Date();
        const backupTargetDBName = this.getTargetBackUpDBName(now);
        const prevBackupStatus = this.backupConfig.status;


        return Promise.resolve()
            .then(() => {
                if(prevBackupStatus == constants.backup.status.RUNNING) {
                    throw new Error(`backup is running`);
                }

                return this.addLog(`Start to backup ${ this.backupConfig.db }`);
            })
            .then( this.backupDB.connect )
            .then(() => {
                return this.updateBackupConfigToDB({status: constants.backup.status.RUNNING});
            })
            .then(() => {
                return this.getBackupCollections();
            })
            .then(backupCollections => {
                log.debug(`Successfully get backup collections ${ backupCollections } from ${ this.backupConfig.db }`);

                this.currentBackupCollections = backupCollections;
                return this.backupDB.readFromCollections(this.backupConfig.db, backupCollections)
            })
            .then(collectionsDocs => {
                this.backupDB.close()
                    .then(() => log.debug(`Closed ${ this.backupDB.url }`))
                    .catch(err => log.error(`Failed to close ${ this.backupDB.url } for ${ err.message }`));
                return this.localDB.writeToCollections(backupTargetDBName, collectionsDocs)
            })
            .then(() => {
                return this.backupOnWriteSuccess(prevBackupStatus, backupTargetDBName)
            })
            .catch(err => {
                this.backupOnFailure(prevBackupStatus, err, backupTargetDBName)
                throw err;
            })
    }

    restore(fromDB, collections) {
        return this.backupDB
                    .connect()
                    .then(() => this.localDB.readFromCollections(fromDB, collections))
                    .then(collsDocs => {
                        return this.backupDB.deleteCollections(this.backupConfig.db, collections)
                                   .then(() => this.backupDB.writeToCollections(this.backupConfig.db, collsDocs))
                    })
                    .then(() => {
                        return this.addLog(`Retored ${ collections.join(' and ') } from ${ fromDB } to the ${ this.backupConfig.id } successfully`);
                    })
                    .catch(err => {
                        this.addLog(`Failed to restore ${ collections.join(' and ') } from ${ fromDB } to ${ this.backupConfig.id } for ${ err.message }`);
                        throw err;
                    })
                    .finally(() => {
                        this.backupDB.close()
                    })

    }

    getNextStatus(prevStatus) {
        let nextStatus = prevStatus;

        if(prevStatus == constants.backup.status.WAITING && !this.backupConfig.interval) {
            nextStatus = constants.backup.status.PENDING;
        }

        return nextStatus;
    }

    removeAllTasksFromTaskPool() {
        taskPool.removeTasksWithBackupId(this.backupConfig.id);
    }

    backupOnWriteSuccess(prevStatus, backupCopyDBName) {
        const now = new Date();
        const dbDuration = this.backupConfig.duration;
        const deleteTime = dbDuration ? new Date(now.valueOf() + dbDuration) : null;

        return this.addBackupCopyDB(backupCopyDBName, now, deleteTime)          
            .then(() => {
                return this.addLog(`Backup ${ this.backupConfig.db } to ${ backupCopyDBName } successfully`);
            })
            .then(() => {
                return this.deleteExtraCopyDBs();
            })
            .then(() => {                
                if( deleteTime ) {
                    const deleteTask = task.newTask(this.backupConfig.id,
                                                    deleteTime.valueOf(),
                                                    constants.task.DELETE_DB,
                                                    {dbName: backupCopyDBName});
                    taskPool.addTask(deleteTask);

                    log.debug(`${ backupCopyDBName } will be deleted at ${ deleteTime.toLocaleString() }`);
                }

                return this.updateBackupConfigAfterBackup(prevStatus, constants.backup.result.SUCCEED);
            })
            .catch(err => {
                throw err;
            });
    }

    backupOnFailure(prevStatus, err, backupCopyDBName) {
        this.addLog(`Backup ${ this.backupConfig.db } failed for ${ err.message }`, "error");
        return this.updateBackupConfigAfterBackup(prevStatus, constants.backup.result.FAILED)
                   .finally(() => {
                        this.deleteCopyDB(backupCopyDBName);
                   })
    }

    updateBackupConfigAfterBackup(prevStatus, backupResult) {
        const statistics = this.backupConfig.statistics;
        statistics.total += 1;

        if(backupResult === constants.backup.result.SUCCEED) {
            statistics.success += 1;
        }else {
            statistics.failures += 1;
        }

        const lastBackupResult = backupResult;
        const nextStatus = this.getNextStatus(prevStatus);
        const lastBackupTime = new Date().toLocaleString();

        const updates = {
            lastBackupResult,
            statistics,
            status: nextStatus,
            lastBackupTime
        };

        return this.updateBackupConfigToDB(updates);
    }

    getTargetBackUpDBName(date) {
        return `${ this.backupConfig.db }-${ date.valueOf() }`
    }

    getBackupCollections() {
        return new Promise((resolve, reject) => {
            if(this.backupConfig.collections) {
                return resolve(this.backupConfig.collections);
            }

            this.backupDB.getCollectionNamesWithDB(this.backupConfig.db)
                .then(collections => {
                    resolve(collections);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    getOriginalDB() {
        return this.backupDB.connect()
            .then(() => this.backupDB.getCollectionNamesWithDB(this.backupConfig.db))
            .then(collections => {
                return {
                    id: this.backupConfig.id,
                    db: this.backupConfig.db,
                    collections
                }
            })
            .finally(() => {
                this.backupDB.close();
            })
    }

    getCollections(dbName) {
        if(dbName != this.backupConfig.db) {
            return this.localDB.getCollectionNamesWithDB(dbName)
                .then(collections => {
                    return {db: dbName, collections};
                })
        }

        return this.backupDB.connect()
            .then(() => {
                return this.backupDB.getCollectionNamesWithDB(this.backupConfig.db);
            })
            .then(collections => {
                return {id: this.backupConfig.id, db: dbName, collections};
            })
            .finally(() => {
                this.backupDB.close();
            })
    }

    getDataFromCollection(dbName, collectionName, filter) {
        if(dbName != this.backupConfig.db) {
            return this.localDB.readFromCollection(dbName, collectionName, filter)
        }

        return this.backupDB.connect()
            .then(() => {
                return this.backupDB.readFromCollection(dbName, collectionName, filter);
            })
            .finally(() => {
                this.backupDB.close();
            })
    }

    addLog(content, level="info") {
        const newLog = {
            id: this.backupConfig.id,
            level: level,
            time: new Date().valueOf(),
            content: content
        };
        this.localDB.addLog(newLog)
            .then(() => {
                log.debug(`Added log ${ this.backupConfig.id }`);
            })
            .catch(err => {
                log.error(`Failed to add log for ${ this.backupConfig.id } for ${ err.message }`);
                throw err;
            })
            .finally(() => {
                let eventName = this.backupConfig.id + '-logs';
                this.serverSocket.emit(eventName)
            });
    }

    updateBackupConfig(updates) {
        // when update the backupConfig first
        // need to stop all the current activities
        const { id, duration } = this.backupConfig;
        backupUtil.updateBackupConfigFromUpdates(this.backupConfig, updates);

        return Promise.resolve()
            .then(() => {
                return this.stop();
            })
            .then(() => {
                // use the update method provied by the localDB
                // for this kind of update
                return this.localDB.updateBackupConfig(this.backupConfig)
            })
            .then(() => {
                this.serverSocket.emit('backupConfigs', id)
            })
            .then(() => {
                this.backupDB.setConnectionParams(this.backupConfig);
                return this.updateBackupConfigToDB({status: constants.backup.status.PENDING});
            })
            .then(() => {
                if(updates.hasOwnProperty('duration') && 
                   updates.duration !== duration) {
                        return this.localDB.getBackupCopyDBsWithId(id);
                }else {
                    return;
                }
            })
            .then(dbs =>{
                if(dbs == null) {
                    return;
                }

                dbs.forEach(db => {
                    db.deletedTime =  updates.duration? new Date(new Date(db.createdTime).valueOf() + updates.duration).toLocaleString() : null;
                });

                return Promise.all(dbs.map(db => {
                    return this.localDB.updateCopyDB(db);
                }))
            })
            .then(() => {
                // notifiy the client side that copy dbs has been changed
                this.serverSocket.emit('copyDBs', id);
            })
            .then(() => {
                return this.restart();
            })
    }

    updateBackupConfigToDB(updates) {
        Object.assign(this.backupConfig, updates);
        return this.localDB.updateBackupConfig(this.backupConfig)
                    .finally(() => {
                        this.serverSocket.emit('backupConfigs', this.backupConfig.id);
                    });
    }

    addBackupCopyDB(copyDBName, createdTime, deletedTime) {
        const newBackupCopyDB = {
            id: this.backupConfig.id,
            originalDatabase: {
                server: this.backupConfig.server,
                database: this.backupConfig.db
            },
            name: copyDBName,
                collections: this.currentBackupCollections,
                createdTime: createdTime.toLocaleString(),
                deletedTime: deletedTime && deletedTime.toLocaleString()
        };
        return this.localDB.addCopyDB(newBackupCopyDB)
            .finally(() => {
                this.serverSocket.emit('copyDBs', this.backupConfig.id);
            });
    }

    deleteCopyDB(dbName) {
        log.debug(`Started to delete ${ dbName }`);
        return this.localDB.deleteCopyDBByIDAndName(this.backupConfig.id, dbName)
            .then(() => {
                return this.localDB.deleteDatabase(dbName);
            })
            .then(() => {
                const now = new Date();
                return this.addLog(`Deleted ${ dbName } at ${ now.toLocaleString() }`)
            })
            .catch(err => {
                this.addLog(`Failed to delete ${ dbName } for ${ err.message }`, "error");
                throw err;
            })
            .finally(() => {
                this.serverSocket.emit('copyDBs', this.backupConfig.id);
            });
    }

    deleteCopyDBs(dbs) {
        // best effort delete dbs
        log.debug(`Started to delete ${ dbs }`);
        if(dbs.length == 0) {
            return Promise.resolve();
        }
        return Promise.all(dbs.map(db => {
            return this.deleteCopyDB(db)
        }))
    }

    deleteCollections(dbName, collections) {
        if(dbName != this.backupConfig.db) {
            return this.localDB.deleteCollections(dbName, collections)
                .then(() => {
                    return this.addLog(`Deleted ${ collections } of ${ dbName }`);
                })
                .catch(err => {
                    this.addLog(`Failed to delete ${ collections } of ${ dbName } for ${ err.message } `, 'error');
                    throw err;
                })
        }

        return this.backupDB.connect()
            .then(() => {
                return this.backupDB
                    .deleteCollections(this.backupConfig.db, collections)
            })
            .finally(() => {
                this.backupDB.close();
            });
    }

    deleteExtraCopyDBs() {
        return new Promise((resolve, reject) => {
            const { maxBackupNumber } = this.backupConfig;

            if(!maxBackupNumber) {
                return resolve();
            }

            this.localDB.getBackupCopyDBsWithId(this.backupConfig.id)
                .then(backupCopyDBs => {
                    const copyDBsNumber = backupCopyDBs.length;
                    if(copyDBsNumber <= maxBackupNumber) {
                        return resolve();
                    }
                    log.debug(`Start to deleted ${ copyDBsNumber - maxBackupNumber } extra DBs`);
                    backupCopyDBs = object.sortByTime(backupCopyDBs, "createdTime", true);
                    const extraCopyDBs = backupCopyDBs.slice(maxBackupNumber, copyDBsNumber);
                    return Promise.all(extraCopyDBs.map(copyDB => {
                        return this.deleteCopyDB(copyDB['name']);
                    }))
                })
                .then(() => {
                    resolve();
                })
                .catch(err => {
                    this.addLog(`Failed to deleted extra backup copies for ${ err.message }`, 'error');
                    reject(err);
                })
        })
    }

    deleteOverdueCopyDBs() {
        return Promise.resolve()
            .then(() => {
                return this.localDB.getBackupCopyDBsWithId(this.backupConfig.id);
            })
            .then(backupCopyDBs => {
                return Promise.all(backupCopyDBs.map(copyDB => {
                    const deletedTime = copyDB['deletedTime'];
                    const dbName = copyDB['name'];
                    if(deletedTime) {
                        const deleteTask = task.newTask(this.backupConfig.id,
                                                        deletedTime,
                                                        constants.task.DELETE_DB,
                                                        {dbName});
                        taskPool.addTask(deleteTask);
                        log.debug(`${ dbName } will be deleted at ${ deletedTime }`);
                    }
                    return Promise.resolve();
                }))
            })
            .catch(err => {
                log.error(`Failed to deleted all the overdue databases for ${ this.backupConfig.id } for ${ err.message }`);
                throw err;
            })
    }

    clear() {
        // clear logic, clear log, dbs,
        const id = this.backupConfig.id;

        return this.stop()
            .then(() => this.localDB.getBackupCopyDBsWithId(id))
            .then(dbs =>  this.deleteCopyDBs(dbs.map(db => db.name)))
            .then(() => this.localDB.clearLogsByID(id))
            .then(() => this.localDB.deleteBackupConfig(id))
            .finally(() => {
                this.serverSocket.emit('backupConfigs', this.backupConfig.id)
            })
    }
}

module.exports = BackupManager;
