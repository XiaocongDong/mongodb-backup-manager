const BackupManager = require('modules/controller/backupManager');
const object = require('modules/utility/object');
const constants = require('modules/constants');
const response = require('modules/helper/response');
const backupUtil = require('modules/utility/backup');
const MongoDB = require('modules/controller/mongoDB');
const log = require('modules/utility/logger');
const backupCons = require('modules/constants/backup');


class Controller {

    constructor() {
        this.localDB = null;
        this.backUpsHash = new Map();
    }

    setLocalDB(localDB) {
        this.localDB = localDB;
    }

    newBackup(backupConfig, next) {
        backupConfig.id = backupUtil.getBackupID(backupConfig);

        if (this.backUpsHash.has(backupConfig.id)) {
            return next(response.error(`Created backup failed: ${ backupConfig.id } has existed`, 409))
        }

        const backupDB = object.selfish(new MongoDB(backupConfig));
        const { server, username, authDB, db, collections } = backupConfig;

        backupDB.connect()
            .catch(err => {
                next(response.error(`Failed to connected to ${ backupConfig.server }`));
                throw err
            })
            .then(() => {
                return backupDB.getAvailableBackupCollections()
            })
            .then(dbsCollections => {
                const dbCollections = dbsCollections.filter(dbCollection => {
                    return dbCollection.db == db;
                });

                if (dbCollections.length === 0) {
                    throw new Error(`${ db } doesn't exist in ${ server } or ${ username }@${ authDB } can't backup it`);
                }

                if(collections) {
                    const invalidCollections = collections.filter(collection => {
                        return !dbCollections.collections.includes(collection);
                    });

                    if (invalidCollections.length > 0) {
                        throw new Error(`backup collections ${ invalidCollections } don't exist`);
                    }
                }

                return this.localDB.updateBackupConfig(backupConfig)
            })
            .then(() => {
                log.info(`Created backup config for ${ backupConfig.id }`);
                backupConfig.status = backupCons.status.PENDING;
                const backupManager = object.selfish(new BackupManager(this.localDB, backupConfig));
                this.backUpsHash.set(backupConfig.id, backupManager);
                this.getBackupStatus(backupConfig.id, next);
            })
            .catch(err => {
                console.log(err);
                next(response.error(err.message));
            })
            .finally(() => {
                backupDB.close();
            });
    }

    runBackup(backupID, next) {
        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`Can't not update a nonexistent backup`))
        }

        const backupManager = this.backUpsHash.get(backupID);

        backupManager.backup()
            .then(() => {
                const nextBackupTime = backupManager.nextBackUpTime;
                const result = {
                    status: backupCons.result.SUCCEED,
                };
                (nextBackupTime) && (result.nextBackUpTime = nextBackupTime);
                next(response.success(result))
            })
            .catch(err => {
                const nextBackupTime = backupManager.nextBackUpTime;
                const result = {
                    status: backupCons.result.FAILED,
                    reason: err.message
                };
                (nextBackupTime) && (result.nextBackUpTime = nextBackupTime);
                next(response.error(result))
            })
    }

    updateBackupConfig(backupID, updates, next) {
        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`Can't not update a nonexistent backup`))
        }

        const backupManager = this.backUpsHash.get(backupID);

        backupManager.updateBackupConfig(updates)
            .then(() => {
                next(response.success(`Updated backup config for ${ backupID }`));
            })
            .catch(err => {
                next(response.error(`Failed to update backup config for ${ err.message }`));
            })
    }

    stop(backupID, next) {
        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`${ backupID } doesn't exist`, 404));
        }

        const backupManager = this.backUpsHash.get(backupID);
        backupManager.stop()
            .then(() => {
                next(response.success(`Stopped ${ backupID }`));
            })
            .catch(err => {
                next(response.error(`Failed to stop ${ backupID } for ${ err.message }`));
            })
    }

    resume(backupID, next) {
        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`${ backupID } doesn't exist`, 404));
        }

        const backupManager = this.backUpsHash.get(backupID);
        if(backupManager.backupStatus != backupCons.status.STOP) {
            return next(response.error(`Failed to resume backup for ${ backupID } for current status is ${ backupManager.backupStatus}`))
        }
        backupManager.updateBackupStatus(backupCons.status.PENDING)
            .then(() => {
                backupManager.start();
                next(response.success(`Resumed backup for ${ backupID } successfully`));
            })
            .catch(err => {
                next(response.error(`Failed to resume backup for ${ err.message }`));
            })
    }

    getBackupStatus(backupID, next) {
        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`${ backupID } doesn't exist`, 404));
        }

        const backupManager = this.backUpsHash.get(backupID);
        const status = backupManager.backupStatus;
        const nextBackupTime = backupManager.nextBackUpTime;
        const result = { status, id: backupID };

        if(status == backupCons.status.WAITING && nextBackupTime) {
            result.nextBackUpTime = nextBackupTime.toLocaleString();
        }

        return next(response.success(result));
    }

    deleteDB(backupID, dbName, next) {
        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`backupID ${ backupID } doesn't exist`));
        }

        this.backUpsHash.get(backupID)
            .deleteDB(dbName)
            .then(() => next(response.success(`Successfully deleted ${ dbName }`)))
            .catch(err => next(response.error(error.message)));
    }

    getAvailableDBsCollections(mongoParams, next) {
        const { server, port, username, password, authDB } = mongoParams;
        const mongoDB = object.selfish(new MongoDB(server, port, username, password, authDB));

        mongoDB.connect()
            .catch(err => {
                next(response.error(err.message, 401));
                throw err;
            })
            .then(mongoDB.getAvailableBackupCollections)
            .then(dbCollections => {
                mongoDB.close();
                next(response.success(dbCollections))
            })
            .catch(err => {
                mongoDB.close();
                next(response.error(err.message, 400));
                throw err;
            })
    }

    getAllBackupCopyDBs(backupID, next) {
        this.localDB.getBackupCopyDatabases(backupID)
            .then(backupCopyDBs => {
                next(response.success(backupCopyDBs));
            })
            .catch(err => {
                next(response.error(err.message));
            })
    }

    getAllBackupLogs(backupID, next) {
        this.localDB.getBackupLogs(backupID)
            .then(logs => next(response.success(logs)))
            .catch(err => next(response.error(err.message)))
    }

    // when the whole backup system restart, need to read all the
    // backup config from the local mongoDB and restart the previous
    // backups
    restart() {
        this.localDB.getBackupConfigs()
            .then(backupConfigs => {
                if(backupConfigs.length == 0){
                    return;
                }
                backupConfigs.map(backupConfig => {
                    log.info(`Restarted ${ backupConfig.id } from ${ this.localDB.server } ${ this.localDB.configCollectionName }`);
                    const backupManager = object.selfish(new BackupManager(this.localDB, backupConfig));
                    this.backUpsHash.set(backupConfig.id, backupManager);
                    backupManager.deleteExtraCopyDBs();
                    backupManager.deleteOverdueCopyDBs();
                })
            })
    }
}

// make sure there is only one controller in the application
const CONTROLLER_KEY = Symbol.for('controller');

if(!global[CONTROLLER_KEY]) {
    global[CONTROLLER_KEY] = object.selfish(new Controller);
}

module.exports = global[CONTROLLER_KEY];
