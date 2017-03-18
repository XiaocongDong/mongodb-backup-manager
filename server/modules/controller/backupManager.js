const backupCons = require('modules/constants/backup');
const log = require('modules/utility/logger');
const config = require('modules/config');
const MongoDB = require('modules/controller/mongoDB');
const object = require('modules/utility/object');


class BackupManager {

    constructor(targetDB, localDB, backupConfig) {
        this.backupDB = targetDB;
        this.localDB = localDB;
        this.backupConfig = backupConfig;
        this.currentBackupCollections = null;
        this.nextBackUpTime = backupConfig.startTime;
        this.activites = new Set();
        this.backupStatus = backupCons.status.PENDING;
        this.backupDB = object.selfish(new MongoDB(backupConfig));
        this.start();
    }

    start() {
        let { startTime, interval } = this.backupConfig;
        if(!startTime && !interval) {
            return;
        }

        this.addLog(`Started backup manager`);
        this.backupStatus = backupCons.status.WAITING;
        let firstTimeout = this.getFirstTimeout(startTime);
        let firstBackup = () => {
            this.backup();

            if(interval) {
                const now = new Date();
                let backUpRoutine = () => {
                    this.nextBackUpTime = new Date(now.valueOf() + interval);
                    this.backup.call(this);
                };
                this.nextBackUpTime = new Date(now.valueOf() + interval);
                this.activites.add(setInterval(backUpRoutine, interval));
            }

        };

        this.activites.add(setTimeout(firstBackup, firstTimeout));
    }

    getFirstTimeout(startTime) {
        const now = new Date();
        startTime = Date.parse(startTime);
        let firstTimeout = 0;
        if(startTime) {
            // if the original startTime has past, change it to today
            if(startTime < now) {
                startTime = new Date(now.getFullYear(), now.getMonth(), now.getDay(),
                startTime.getHours(), startTime.getMinutes(), startTime.getSeconds, startTime.getMilliseconds());
                if(startTime < now ) {
                    // next Day
                    startTime = new Date(startTime.valueOf() + 24*60*60*1000);
                }
            }
            firstTimeout = startTime - now
        }
        return firstTimeout;
    }

    stop() {
        this.addLog(`Stop all the backup activities`);
        this.backupStatus = backupCons.status.STOP;
        this.nextBackUpTime = null;
        this.currentBackupCollections = null;
        // this may stop the backup collections;
        this.backupDB.close();
        this.stopAllActivities();
    }

    backup() {
        this.addLog(`Start to backup`);
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
                    .finally(() => {
                        this.backupStatus = this.backupConfig.interval?backupCons.status.WAITING:
                            backupCons.status.PENDING;
                    })
    }

    stopAllActivities() {
        this.activites.forEach(activity => clearTimeout(activity))
        this.activites.clear();
    }

    backupOnWriteSuccess(backupCopyDBName) {
        const now = new Date();
        const dbDuration = this.backupConfig.backupDuration;
        const deleteTime = dbDuration ? new Date(now.valueOf() + dbDuration) : '';

        return this.addBackupCopyDB(backupCopyDBName, now, deleteTime)
            .then(() => {
                const lastBackupTime = now.toLocaleString();
                this.addLog(`Backup ${ this.backupConfig.db } to ${ backupCopyDBName } successfully`);
                this.updateBackupConfigToDB(lastBackupTime);

                if( dbDuration ) {
                    const deleteDBTask = () => {
                        this.deleteDB(backupCopyDBName);
                    };
                    this.activites.add(setTimeout(deleteDBTask, dbDuration));
                    log.debug(`${ backupCopyDBName } will be deleted at ${ deleteTime.toLocaleString() }`);
                }
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
        this.updateBackupConfigToDB(lastBackupTime);
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
        // when update the backupConfig first
        // need to stop all the current activities
        this.stop();
        return this.updateBackupConfig(updates)
            .then(() => {
                log.debug(this.backupConfig);
                this.addLog(`Updated backup config with ${ JSON.stringify(this.backupConfig) }`)
                this.backupDB.setConnectionParams(this.backupConfig);
                this.start();
            })
            .catch(err => {
                log.error(`Failed to update backup config for ${ this.backupConfig.id }`);
                throw err;
            })
    }

    updateBackupConfigToDB(updates) {
        Object.assign(this.backupConfig, updates);
        return this.localDB.updateBackupConfig(this.backupConfig);
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
