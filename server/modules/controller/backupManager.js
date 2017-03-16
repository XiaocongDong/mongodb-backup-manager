const backupCons = require('modules/constants/backup');
const log = require('modules/utility/logger');

class BackupManager {

    constructor(targetDB, localDB, backupConfig) {
        this.backupDB = targetDB;
        this.localDB = localDB;
        this.backupConfig = backupConfig;
        this.currentBackupCollections = null;
        this.nextBackUpTime = backupConfig.startTime;
        this.activites = new Set();
        this.backupStatus = backupCons.status.WAITING;
    }

    start() {
        log.info('Started the backup logic for ' + this.id);

        const now = new Date();

        let firstTimeout = this.startTime? (Date.parse(this.backupConfig.startTime) - now.valueOf()): 0;

        let firstBackup = () => {
            this.backUp();
            let backUpRoutine = () => {
                    this.nextBackUpTime = new Date(now.valueOf() + this.backupConfig.interval);
                    this.backUp.call(this);
                };

            this.activites.add(setInterval(backUpRoutine, this.backupConfig.interval));
            this.nextBackUpTime = new Date(now.valueOf() + this.backupConfig.interval);
        };

        this.activites.add(setTimeout(firstBackup, firstTimeout));
    }

    backUp() {
        const now = new Date();
        const backupTargetDBName = this.getTargetBackUpDBName(now);
        log.info('Backup copy DB Name is ' + backupTargetDBName);
        
        return this.backupDB
                    .connect()
                    .then(() => {
                        this.backupStatus = backupCons.status.RUNNING;
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
    }

    stopAllActivities() {
        this.activites.forEach(activity => clearTimeout(activity))
    }

    backupOnWriteSuccess(backupCopyDBName) {
        return new Promise((resolve, reject) => {
            this.backupStatus = backupCons.status.WAITING;
            const now = new Date();
            const dbDuration = this.backupConfig.backupDuration;
            const deleteTime = dbDuration ? new Date(now.valueOf() + dbDuration) : '';
            const newCopyDB = {
                "id": this.backupConfig.id,
                "originalDatabase": {
                    "server": this.backupConfig.server,
                    "database": this.backupConfig.db
                },
                "name": backupCopyDBName,
                "collections": this.currentBackupCollections,
                "createdTime": now.toISOString(),
                "deletedTime": deleteTime.toISOString()
            };
            const newLog = {
                time: now.valueOf(),
                content: `Backup ${ this.backupConfig.db } to ${ backupCopyDBName } successfully`
            };
            const lastBackupTime = now.toISOString();

            this.addLog(newLog);
            this.updateBackupConfig({ lastBackupTime });

            this.localDB.addCopyDB(newCopyDB)
                .then(() => {
                    if( this.backupConfig.backupDuration ) {
                        const deleteDBTask = () => {
                            this.deleteDB(backupCopyDBName);
                        };
                        this.activites.add(setTimeout(deleteDBTask, this.backupConfig.backupDuration));
                    }

                    log.info(`${ backupCopyDBName } will be deleted at ${ deleteTime }`);
                    resolve()
                })
                .catch(err => {
                    this.localDB.deleteDatabase(backupCopyDBName)
                        .then(() => {
                            const errorMessage = `Backup failed for ${ err.message }, clean copy successfully`;
                            log.info(errorMessage);
                            reject(new Error(errorMessage));
                        })
                        .catch(err => {
                            const errorMessage = `Backup failed for ${ err.message }, failed to lean copy`;
                            log.info(errorMessage);
                            reject(new Error(errorMessage));
                        })
                });
        })
    }

    backupOnFailure(err, backupCopyDBName) {
        const now = new Date();
        const newLog = {
            time: now.valueOf(),
            content: `Failed to Backup ${ this.backupConfig.database } to ${ backupCopyDBName } for ${ err.message }`
        };
        const lastBackupTime = now.toISOString();

        this.addLog(newLog);
        this.updateBackupConfig({ lastBackupTime });

        this.localDB.deleteDatabase(backupCopyDBName)
            .then(() => {
                log.info(`Successfully delete ${ backupCopyDBName }`);
            })
            .catch(() => {
                log.error(`Failed to delete ${ backupCopyDBName }`);
            });
    }

    deleteDB(dbName) {
        return new Promise((resolve, reject) => {
            log.info(`Started to delete ${ dbName }`);
            const now = new Date();

            this.localDB.deleteDatabase(dbName)
                .then(() => {
                    const newLog = {
                        time: now.valueOf(),
                        content: `Deleted Backup ${ dbName }`
                    };
                    this.addLog(newLog);
                    return this.localDB.deleteCopyDBByIDAndName(this.backupConfig.id, dbName)
                })
                .then(() => {
                    log.info(`Deleted ${ dbName }`);
                    resolve();
                })
                .catch(err => {
                    log.error(`Failed to delete ${ dbName } for ${ err.message }`);
                    reject();
                })
        })
    }

    getTargetBackUpDBName(date) {
        return `${ this.backupConfig.id }-${ date.valueOf() }`
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

    addLog(log) {
        this.localDB.addLog(log)
            .then(() => {
                log.info(`Added log ${ this.backupConfig.id }`);
            })
            .catch(err => {
                log.error(`Failed to add log for ${ this.backupConfig.id } for ${ err.message }`);
            });
    }

    updateBackupConfig(updates) {
        this.localDB.getBackupConfig(this.backupConfig.id)
            .then(backupConfig => {
                if(backupConfig.length == 0) {
                    throw new Error(`Backup config for ${ this.backupConfig.id } doesn't exist`);
                }
                backupConfig = backupConfig[0];
                Object.assign(backupConfig, updates);
                return this.localDB.updateBackUpConfig(backupConfig)
            });
    }
}

module.exports = BackupManager;
