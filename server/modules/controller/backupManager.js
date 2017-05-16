const backupCons = require('modules/constants/backup');
const log = require('modules/utility/logger');
const config = require('modules/config');
const MongoDB = require('modules/controller/mongoDB');
const object = require('modules/utility/object');
const backupUtil = require('modules/utility/backup');


class BackupManager {

    constructor(localDB, backupConfig, serverSocket) {
        this.backupDB = object.selfish(new MongoDB(backupConfig));
        this.localDB = localDB;
        this.serverSocket = serverSocket;
        this.backupConfig = backupConfig;
        this.currentBackupCollections = null;
        this.activites = new Set();
        this.start();
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

            this.addLog(`Started ${ this.backupConfig.id }`);

            const nextBackupTime = backupUtil.getNextBackupTime(this.backupConfig);
            console.log(nextBackupTime);

            this.updateBackupConfigToDB(
                    {
                        nextBackupTime: nextBackupTime? nextBackupTime.toLocaleString(): null ,
                        status: backupCons.status.WAITING
                    }
                );

            const interval = this.backupConfig.interval;
            const firstTimeout = nextBackupTime? nextBackupTime - new Date(): 0;

            let firstBackup = () => {
                this.backup();

                if (interval) {
                    let backUpRoutine = () => {
                        if(this.backupStatus == backupCons.status.RUNNING) {
                            return;
                        }
                        // update next backup time before each backup
                        const now = new Date();
                        const nextBackupTime = new Date(now.valueOf() + interval).toLocaleString();
                        this.updateBackupConfigToDB({ nextBackupTime });
                        this.backup.call(this);
                    };
                    // before next backup, update next backup time
                    const nextBackupTime = new Date(new Date().valueOf() + interval).toLocaleString();
                    this.updateBackupConfigToDB({ nextBackupTime });
                    this.activites.add(setInterval(backUpRoutine, interval));
                }else{
                    this.updateBackupConfigToDB({ nextBackupTime: null });
                }

            };
            console.log("firstTime out", firstTimeout);
            this.activites.add(setTimeout(firstBackup, firstTimeout));
        }catch(e) {
            console.log(e);
        }
    }

    checkBackupAvailable() {
        if(this.backupStatus == backupCons.status.STOP) {
            return false
        }

        return true;
    }

    stop() {
        return this.backupDB.close()
            .then(() => {
                return this.updateBackupStatus(backupCons.status.STOP);
            })
            .then(() => {
                this.stopAllActivities();
                this.addLog(`Stop all the backup activities`);
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
        const lastBackupTime = new Date().toLocaleString();
        this.updateBackupConfigToDB({ lastBackupTime });

        return Promise.resolve()
            .then(() => {
                if(previousBackupStatus == backupCons.status.RUNNING) {
                    throw new Error(`Failed to start backup for backup is running`);
                }
                this.addLog(`Start to backup ${ this.backupConfig.db }`);
                return this.backupDB.connect()
            })
            .then(() => {
                this.updateBackupStatus(backupCons.status.RUNNING);
                return this.getBackupCollections();
            })
            .then(backupCollections => {
                log.info(`Successfully get backup collections ${ backupCollections }`);
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

                if(previousBackupStatus == backupCons.status.WAITING && !this.backupConfig.interval) {
                    nextStatus = backupCons.status.PENDING;
                }

                this.updateBackupStatus(nextStatus);
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

    stopAllActivities() {
        this.activites.forEach(activity => clearTimeout(activity));
        this.activites.clear();
    }

    backupOnWriteSuccess(backupCopyDBName) {
        const now = new Date();
        const dbDuration = this.backupConfig.duration;
        const deleteTime = dbDuration ? new Date(now.valueOf() + dbDuration) : '';

        return this.addBackupCopyDB(backupCopyDBName, now, deleteTime)
            .then(() => {
                this.addLog(`Backup ${ this.backupConfig.db } to ${ backupCopyDBName } successfully`);
                const statistics = this.backupConfig.statistics;
                statistics.total += 1;
                statistics.success += 1;
                const lastBackupResult = backupCons.result.SUCCEED;

                const updates = {
                    lastBackupResult,
                    statistics,
                };
                this.updateBackupConfigToDB(updates);

                if( dbDuration ) {
                    const deleteDBTask = () => {
                        this.deleteCopyDB(backupCopyDBName);
                    };
                    this.activites.add(setTimeout(deleteDBTask, dbDuration));
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
        const lastBackupResult = backupCons.result.FAILED;

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
                this.updateBackupStatus(backupCons.status.PENDING);
                this.start();
            })
            .catch(err => {
                this.addLog(`Failed to update backup config for ${ this.backupConfig.id } for ${ err.message }`, 'error');
                throw err;
            });
    }

    updateBackupStatus(status) {
        this.addLog(`Backup status changed from ${ this.backupStatus } to ${ status }`);
        return this.updateBackupConfigToDB({ status });
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
                        const deletedDate = new Date(deletedTime);
                        const now = new Date();
                        if(deletedDate <= now) {
                            this.addLog(`${ dbName } is overdue`);
                            return this.deleteCopyDB(dbName);
                        }else {
                            const deleteDBTask = () => {
                                this.deleteCopyDB(dbName)
                            };
                            this.activites.add(setTimeout(deleteDBTask, deletedDate - now));
                            log.debug(`${ dbName } will be deleted at ${ deletedDate.toLocaleString()}`);
                        }
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
