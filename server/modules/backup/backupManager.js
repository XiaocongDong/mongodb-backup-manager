const constants = require('modules/constants');
const log = require('modules/utility/logger');
const config = require('modules/config');
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
        try {
            if (!this.checkBackupAvailable()) {
                return;
            }

            this.addLog(`Started ${ this.backupConfig.id } backupManager`);

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
        }catch(e) {
            console.log(e);
        }
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
        return this.backupDB.close()
            .then(() => {
                return this.updateBackupConfigToDB(
                    {
                        status:constants.backup.status.STOP,
                        nextBackupTime: null
                    }
                );
            })
            .then(() => {
                this.removeAllTasksFromTaskPool();
                this.addLog(`Stop all the backup tasks`);
            })
            .catch(err => {
                this.addLog(`Failed to stop backup for ${ err.message }`, 'error');
                throw err;
            })
    }

    backup() {
        const now = new Date();
        const backupTargetDBName = this.getTargetBackUpDBName(now);
        const previousBackupStatus = this.backupStatus;


        return Promise.resolve()
            .then(() => {
                if(previousBackupStatus == constants.backup.status.RUNNING) {
                    throw new Error(`backup is running`);
                }

                this.addLog(`Start to backup ${ this.backupConfig.db }`);
                return this.backupDB.connect()
            })
            .then(() => {
                this.updateBackupConfigToDB({status: constants.backup.status.RUNNING});
                return this.getBackupCollections();
            })
            .then(backupCollections => {
                log.info(`Successfully get backup collections ${ backupCollections } from ${ this.backupConfig.db }`);

                this.currentBackupCollections = backupCollections;
                return this.backupDB.readFromCollections(this.backupConfig.db, backupCollections)
            })
            .then(collectionsDocs => {
                this.backupDB.close()
                    .then(() => log.info(`Closed ${ this.backupDB.url }`))
                    .catch(err => log.error(`Failed to close ${ this.backupDB.url } for ${ err.message }`));
                return this.localDB.writeToCollections(backupTargetDBName, collectionsDocs)
            })
            .then(() => {
                return this.backupOnWriteSuccess(backupTargetDBName)
            })
            .catch(err => {
                this.backupOnFailure(err, backupTargetDBName);
                throw err;
            })
            .finally(() => {
                let nextStatus = previousBackupStatus;

                if(previousBackupStatus == constants.backup.status.WAITING && !this.backupConfig.interval) {
                    nextStatus = constants.backup.status.PENDING;
                }
                const lastBackupTime = new Date().toLocaleString();
                this.updateBackupConfigToDB({ lastBackupTime, status: nextStatus });
            });
    }

    restore(fromDB, collections) {
        return this.backupDB
                    .connect()
                    .then(() => this.localDB.readFromCollections(fromDB, collections))
                    .then(collsDocs => {
                        return this.backupDB.deleteCollections(this.backupConfig.db, collections)
                                   .then(() => this.backupDB.writeToCollections(this.backupConfig.db, collsDocs))
                    })
                    .finally(() => {
                        this.backupDB.close()
                    })

    }

    removeAllTasksFromTaskPool() {
        taskPool.removeTasksWithBackupId(this.backupConfig.id);
    }

    backupOnWriteSuccess(backupCopyDBName) {
        const now = new Date();
        const dbDuration = this.backupConfig.duration;
        const deleteTime = dbDuration ? new Date(now.valueOf() + dbDuration) : null;

        return this.addBackupCopyDB(backupCopyDBName, now, deleteTime)
            .then(() => {
                this.addLog(`Backup ${ this.backupConfig.db } to ${ backupCopyDBName } successfully`);
                const statistics = this.backupConfig.statistics;
                statistics.total += 1;
                statistics.success += 1;
                const lastBackupResult = constants.backup.result.SUCCEED;

                const updates = {
                    lastBackupResult,
                    statistics,
                };

                this.updateBackupConfigToDB(updates);
                
                if( deleteTime ) {
                    const deleteTask = task.newTask(this.backupConfig.id,
                                                    deleteTime.valueOf(),
                                                    constants.task.DELETE_DB,
                                                    {dbName: backupCopyDBName});
                    taskPool.addTask(deleteTask);

                    log.debug(`${ backupCopyDBName } will be deleted at ${ deleteTime.toLocaleString() }`);
                }

                this.deleteExtraCopyDBs();
            })
            .catch(err => {
                throw err;
            });
    }

    backupOnFailure(err, backupCopyDBName) {
        const statistics = this.backupConfig.statistics;
        statistics.total += 1;
        statistics.failures += 1;
        const lastBackupResult = constants.backup.result.FAILED;

        const updates = {
            lastBackupResult,
            statistics
        };
        this.addLog(`Backup ${ this.backupConfig.db } failed for ${ err.message }`, "error");
        this.updateBackupConfigToDB(updates);
        this.localDB.deleteDatabase(backupCopyDBName)
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
            time: new Date().toLocaleString(),
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
        return Promise.resolve()
            .then(() => {
                return this.stop();
            })
            .then(() => {
                return this.updateBackupConfigToDB(updates)
            })
            .then(() => {
                this.addLog(`Updated backup config with ${ JSON.stringify(this.backupConfig) }`)
                this.backupDB.setConnectionParams(this.backupConfig);
                this.updateBackupConfigToDB({status: constants.backup.status.PENDING});
                this.start();
            })
            .catch(err => {
                this.addLog(`Failed to update backup config for ${ this.backupConfig.id } for ${ err.message }`, 'error');
                throw err;
            });
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
                deletedTime: deletedTime.toLocaleString()
        };
        return this.localDB.addCopyDB(newBackupCopyDB)
            .finally(() => {
                this.serverSocket.emit('copyDBs', this.backupConfig.id);
            });
    }

    deleteCopyDB(dbName) {
        // TODO need to fix the order of delete, db first then log?
        log.info(`Started to delete ${ dbName }`);
        return this.localDB.deleteCopyDBByIDAndName(this.backupConfig.id, dbName)
            .then(() => {
                return this.localDB.deleteDatabase(dbName);
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
                    this.addLog(`Deleted ${ collections } of ${ dbName }`);
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

    clear(log=true, copyDBs=false) {
        // clear logic, clear log, dbs,
        const id = this.backupConfig.id;

        return this.stop()
            .then(() => {
                if(!log && !copyDBs) {
                    return Promise.resolve();
                }
                const clearTasks = [];
                (log) && (clearTasks.push(this.localDB.clearLogsByID(id)));

                if(copyDBs) {
                    const clearDBsTasks = Promise.resolve()
                        .then(() => this.localDB.getAllCopyDBs(id))
                        .then(dbs => {
                            const dbNames = dbs.map(db => db.name);
                            this.deleteCopyDBs(dbNames)
                        });

                    clearTasks.push(clearDBsTasks)
                }

                return Promise.all(clearTasks);
            })
            .then(() => this.localDB.deleteBackupConfig(id))
            .finally(() => {
                this.serverSocket.emit('backupConfigs', id)
            })
    }
}

module.exports = BackupManager;
