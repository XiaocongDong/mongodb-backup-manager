const backupCons = require('modules/constants/backup');
const log = require('modules/utility/logger');
const config = require('modules/config');


class BackupManager {

    constructor(targetDB, localDB, backupConfig) {
        this.backupDB = targetDB;
        this.localDB = localDB;
        this.backupConfig = backupConfig;
        this.currentBackupCollections = null;
        this.nextBackUpTime = backupConfig.startTime;
        this.activites = new Set();
        this.backupStatus = backupCons.status.PENDING;
        (this.backupConfig.startTime) && this.start(this.backupConfig.startTime,
                                                    this.backupConfig.interval)
    }

    start(startTime, interval) {
        if(!startTime) {
            return this.backUp();
        }
        this.backupStatus = backupCons.status.WAITING;
        let firstTimeout = Date.parse(startTime) - new Date().valueOf();
        let firstBackup = () => {
            this.backUp();

            if(interval) {
                const now = new Date();
                let backUpRoutine = () => {
                    this.nextBackUpTime = new Date(now.valueOf() + interval);
                    this.backUp.call(this);
                };
                this.nextBackUpTime = new Date(now.valueOf() + interval);
                this.activites.add(setInterval(backUpRoutine, interval));
            }

        };

        this.activites.add(setTimeout(firstBackup, firstTimeout));
    }

    stop() {
        this.backupStatus = backupCons.status.STOP;
        this.backupDB.close();
        this.stopAllActivities();
    }

    backUp() {
        this.backupStatus = backupCons.status.RUNNING;

        const now = new Date();
        const backupTargetDBName = this.getTargetBackUpDBName(now);
        log.debug('Backup copy DB Name is ' + backupTargetDBName);
        
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
        this.backupStatus = backupCons.status.WAITING;
        const now = new Date();
        const dbDuration = this.backupConfig.backupDuration;
        const deleteTime = dbDuration ? new Date(now.valueOf() + dbDuration) : '';

        return this.addBackupCopyDB(backupCopyDBName, now, deleteTime)
            .then(() => {
                const lastBackupTime = now.toLocaleString();
                this.addLog(`Backup ${ this.backupConfig.db } to ${ backupCopyDBName } successfully`);
                this.updateBackupConfig({ lastBackupTime });

                if( dbDuration ) {
                    const deleteDBTask = () => {
                        this.deleteDB(backupCopyDBName);
                    };
                    this.activites.add(setTimeout(deleteDBTask, dbDuration));
                }
                log.debug(`${ backupCopyDBName } will be deleted at ${ deleteTime.toLocaleString() }`);
                console.log(`Successful`)
            })
            .catch(err => {
                throw err;
            });
    }

    backupOnFailure(err, backupCopyDBName) {
        this.backupStatus = backupCons.status.WAITING;
        const now = new Date();
        const lastBackupTime = now.toLocaleString();

        this.addLog(`Backup ${ this.backupConfig.db } failed for ${ err.message }`);
        this.updateBackupConfig({ lastBackupTime });
        this.localDB.deleteDatabase(backupCopyDBName)
    }

    deleteDB(dbName) {
        log.info(`Started to delete ${ dbName }`);

        return this.localDB.deleteCopyDBByIDAndName(this.backupConfig.id, dbName)
            .then(() => {
                this.addLog(`deleted ${ dbName } record for ${ this.backupConfig.id } in backup copyDB collections`);
                return this.localDB.deleteDatabase(dbName);
            })
            .then(() => {
                this.addLog(`deleted ${ dbName } completely`)
            })
            .catch(err => {
                log.error(`Failed to delete ${ dbName } for ${ err.message }`);
                throw err;
            });
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

    addLog(content) {
        const newLog = {
            id: this.backupConfig.id,
            time: new Date().toLocaleString(),
            content: content
        };
        this.localDB.addLog(newLog)
            .then(() => {
                log.debug(`Added log ${ this.backupConfig.id }`);
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
        return this.localDB.addCopyDB(newBackupCopyDB);
    }
}

module.exports = BackupManager;
