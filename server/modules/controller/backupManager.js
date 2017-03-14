const backupCons = require('modules/constants/backup');
const backupConfigUtil = require('modules/utility/backupConfig');
const log = require('modules/utility/logger');

class BackupManager {

    constructor(id, targetDB, localDB, backupConfig) {
        this.backupDB = targetDB;
        this.localDB = localDB;
        this.backupConfig = backupConfig;
        this.backupDBName = backupConfig.db;
        this.backupCollections = backupConfig.collections;
        this.startTime = backupConfig.time.start_time;
        this.interval = backupConfig.time.interval;
        this.maxNumber = backupConfig.constraints.maximum_number;
        this.duration = backupConfig.constraints.duration;
        this.id = id;
        this.activites = new Set();
    }

    start() {
        log.info('Started the backup logic for ' + this.id);

        const now = new Date();

        let firstTimeout = this.startTime? (Date.parse(this.startTime) - now.valueOf()): 0;

        let firstBackup = setTimeout(() => {
            // start first backup
            this.backUp();

            // create a routine backup
            let backUpRoutine = setInterval(
                () => {
                    this.backUp.bind(this)
                }, this.interval);

            this.activites.add(backUpRoutine);
        }, firstTimeout);

        this.activites.add(firstBackup);
    }

    backUp() {
        const now = new Date();
        const nextBackUpTime = new Date(now.valueOf() + this.interval);
        const backupTargetDBName = this.getTargetBackUpDBName(now);
        log.info('target Db Name is ' + backupTargetDBName);

        return new Promise((resolve, reject) => {
             this.backupDB.connect()
                 .then(() => {
                     this.localDB.getBackUpConfig(this.id)
                         .then(backupConfig => {
                             backupConfigUtil.setBackupStatus(backupConfig, backupCons.status.RUNNING);
                             backupConfigUtil.addBackupLog(backupConfig, now, `Start to run backup for ${this.backupDBName}`);
                             backupConfigUtil.setNextBackupTime(backupConfig, nextBackUpTime);

                             this.localDB.updateBackUpConfig(backupConfig)
                                 .then(() => {
                                     this.getBackupCollections()
                                         .then((backupCollections) => {
                                             this.backupDB
                                                 .readFromCollections(this.backupDBName, backupCollections)
                                                 .then(collectionsDocs => {
                                                     this.localDB.writeToCollections(backupTargetDBName, collectionsDocs)
                                                         .then(() => {
                                                             this.backupOnSuccess(backupTargetDBName)
                                                                 .then(() => resolve())
                                                                 .catch(err => reject(err))
                                                         })
                                                         .catch(err => {
                                                             this.backupOnFailure(backupTargetDBName)
                                                                 .finally(() => {
                                                                     reject(err);
                                                                 })
                                                         });
                                                 })
                                                 .catch((err) => reject(err));
                                         })
                                         .catch(err => {
                                             log.error(`Failed to get backup collections`);
                                             reject(err);
                                         })
                                 })
                                 .catch(err => {
                                     log.error(`Failed to update the backupConfig for ${ this.id }`);
                                     reject(err);
                                 });
                         })
                         .catch(err => {
                             log.error(`Failed to get backup config from local DB for ${ err.message }`);
                             console.log(err);
                             reject(err);
                         });
                 })
                 .catch(err => {
                     log.error(`Failed to get backup config from db`);
                     reject(err)
                 })
                 .finally(this.backupDB.close)
        });
    }

    stopAllActivities() {
        this.activites.forEach(activity => clearTimeout(activity))
    }

    backupOnSuccess(backupTargetDBName) {
        return new Promise((resolve, reject) => {
            /**
             * update backup config with successful info
             */
            const now = new Date();
            const dbDuration = this.duration;
            const deleteTime = dbDuration ? new Date(now.valueOf() + dbDuration) : '';

            this.localDB.getBackUpConfig(this.id)
                .then(backupConfig => {
                    backupConfigUtil.setBackupStatus(backupConfig, backupCons.status.WAITING);
                    backupConfigUtil.addBackupDB(backupConfig, backupTargetDBName, now, deleteTime);
                    backupConfigUtil.addBackupLog(backupConfig, now, `backup ${ this.backupConfig.backupDB } successfully`);

                    this.localDB.updateBackUpConfig(backupConfig)
                        .then(() => {
                            log.info(`backup ${ this.backupConfig.backupDB } successfully`);

                            // set timer to delete the database when it expired
                            setTimeout(() => {
                                this.localDB.deleteDatabase(backupTargetDBName);
                            }, dbDuration);

                            log.info(`${ backupTargetDBName } will be deleted at ${ deleteTime }`);

                            resolve()
                        })
                        .catch((updateErr) => {
                            /**
                             * when the status can' be updated, the backup failed, delete copy database
                             */
                            this.localDB.deleteDatabase(backupTargetDBName)
                                .then(() => {
                                    log.info(`Update Backup config failed for ${ err.message }, clean copy successfully`);
                                    reject(updateErr);
                                })
                                .catch(err => {
                                    log.error(`Update Backup config failed for ${ err.message }, clean copy failed`);
                                    reject(updateErr);
                                })
                        })
                })
                .catch(err => {
                    log.error(`Failed to get backup config for ${ this.id } from ${ this.localDB.server }`)
                    console.log(err);
                    reject(err);
                });
        });
    }

    backupOnFailure(backupTargetDBName) {
        return new Promise((resolve, reject) => {
            const now = new Date();

            this.localDB.getBackUpConfig(this.id)
                .then(backupConfig => {
                    backupConfigUtil.setBackupStatus(backupConfig, backupCons.status.WAITING);
                    backupConfigUtil.addBackupLog(backupConfig, now, `backup ${ this.backupDBName } failed`);
                    this.localDB.updateBackUpConfig(backupConfig)
                        .then(() => {
                            log.info(`backup ${ this.backupDBName } failed, successfully update backupConfig`);
                            resolve();
                        })
                        .catch((err) => {
                            log.error(`backup ${ this.backupDBName } failed, failed to update backup Config for ${ err.message }`);
                            reject(err);
                        })
                        .finally(() => {
                            this.localDB.deleteDatabase(backupTargetDBName)
                                .then(() => {
                                    log.info(`Successfully delete ${ backupTargetDBName }`);
                                })
                                .catch(() => {
                                    log.error(`Failed to delete ${ backupTargetDBName }`);
                                })
                        });
                })
        })
    }

    deleteDB(dbName) {
        return new Promise((resolve, reject) => {
            const now = new Date();
            this.localDB.removeBackupDB(dbName)
                .then(() => {
                    this.localDB.getBackUpConfig(this.id)
                        .then(backupConfig => {
                            backupConfigUtil.removeBackupDB(backupConfig, dbName);
                            backupConfigUtil.addBackupLog(backupConfig, now, `Successfully deleted ${dbName}`);
                            this.localDB.updateBackUpConfig(backupConfig)
                                .then(() => {
                                    log.info(`Successfully deleted ${dbName}`);
                                    resolve();
                                })
                                .catch(err => {
                                    log.error(`Successfully deleted ${dbName}, but failed to delete it in the backup config`);
                                    reject(err);
                                })
                        })
                        .catch(err => {
                            log.error(`Successfully ${ dbName }, failed to get backup Config from local DB`);
                            reject(err);
                        })
                })
                .catch(err => {
                    log.error(`Failed to deleted ${dbName} for ${err.message}`);
                    reject(err);
                })
        })
    }

    getTargetBackUpDBName(date) {
        return `${ this.id }-${ date.valueOf() }`
    }

    getBackupCollections() {
        return new Promise((resolve, reject) => {
            if(this.backupCollections) {
                return resolve(this.backupCollections);
            }

            this.backupDB.connect()
                .then(() => {
                    this.backupDB.getCollectionNamesWithDB(this.backupDB)
                        .then(collections => {
                            resolve(collections);
                        })
                        .catch(err => {
                            reject(err);
                        })
                })
                .catch(err => reject(err));
        })
    }
}

module.exports = BackupManager;
