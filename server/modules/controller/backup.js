const BackupManager = require('modules/backup/backupManager');
const object = require('modules/utility/object');
const constants = require('modules/constants');
const response = require('modules/helper/response');
const backupUtil = require('modules/utility/backup');
const MongoDB = require('modules/databases/mongoDB');
const log = require('modules/utility/logger');


class Controller {

    constructor() {
        this.localDB = null;
        this.serverSocket = null;
        this.backUpsHash = new Map();
    }

    setLocalDB(localDB) {
        this.localDB = localDB;
    }

    setServerSocket(serverSocket) {
        this.serverSocket = serverSocket;
    }

    getBackupManager(backupId) {
        return this.backUpsHash.get(backupId);
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
                let dbCollections = dbsCollections.filter(dbCollection => {
                    return dbCollection.db == db;
                });

                if (dbCollections.length === 0) {
                    throw new Error(`${ db } doesn't exist in ${ server } or ${ username }@${ authDB } can't backup it`);
                }

                dbCollections = dbCollections[0];

                if(collections) {
                    const invalidCollections = collections.filter(collection => {
                        return !dbCollections.collections.includes(collection);
                    });

                    if (invalidCollections.length > 0) {
                        throw new Error(`backup collections ${ invalidCollections } don't exist`);
                    }
                }

                backupUtil.updateBackupData(backupConfig);
                return this.localDB.updateBackupConfig(backupConfig)
            })
            .then(() => {
                log.info(`Created backup config for ${ backupConfig.id }`);
                const backupManager = object.selfish(new BackupManager(this.localDB, backupConfig, this.serverSocket));

                backupManager.start();
                this.backUpsHash.set(backupConfig.id, backupManager);
                this.getBackupStatus(backupConfig.id, next);
            })
            .catch(err => {
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

        //TODO check backup status here, RUNNING backup can not be run!!!

        backupManager.backup()
            .then(() => {
                const nextBackupTime = backupManager.nextBackupTime;
                const result = {
                    status: constants.backup.result.SUCCEED,
                };
                (nextBackupTime) && (result.nextBackupTime = nextBackupTime);
                next(response.success(result))
            })
            .catch(err => {
                const nextBackupTime = backupManager.nextBackupTime;
                const result = {
                    status: constants.backup.result.FAILED,
                    reason: err.message
                };
                (nextBackupTime) && (result.nextBackupTime = nextBackupTime);
                next(response.error(result))
            })
    }

    restore(backupID, dbName, collections, next) {
        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`Can't not restore for nonexistent backup id ${ backupID }`));
        }

        const backupManager = this.backUpsHash.get(backupID);

        backupManager.restore(dbName, collections)
            .then(() => {
                next(response.success(`Successfully restore ${ backupID } from ${ dbName }`))
            })
            .catch(err => {
                console.error(err);
                next(response.error(`Failed to restore ${ backupID } from ${ dbName } for ${ err.message }`))
            })
    }

    updateBackupConfig(backupID, updates, next) {
        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`Can't not update a nonexistent backup`, 404))
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
        if(backupManager.backupStatus != constants.backup.status.STOP) {
            return next(response.error(`Failed to resume backup for ${ backupID } for current status is ${ backupManager.backupStatus}`))
        }

        backupManager.resume()
            .then(() => {
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
        const nextBackupTime = backupManager.nextBackupTime;
        const result = { status, id: backupID };

        if(status == constants.backup.status.WAITING && nextBackupTime) {
            result.nextBackupTime = nextBackupTime.toLocaleString();
        }

        return next(response.success(result));
    }

    deleteBackup(backupID, next) {
        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`backupID ${ backupID } doesn't exist`, 404));
        }

        const backupManager = this.backUpsHash.get(backupID);
        if(backupManager.backupStatus == constants.backup.status.RUNNING) {
            return next(response.error(`Failed to delete running backup`));
        }

        backupManager.clear()
            .then(() => {
                this.backUpsHash.delete(backupID);
                next(response.success(`Successfully deleted ${ backupID }`))
            })
            .catch(err => {
                next(response.error(err,message))
            })
    }

    deleteDB(backupID, dbName, next) {
        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`backupID ${ backupID } doesn't exist`, 404));
        }

        this.backUpsHash.get(backupID)
            .deleteCopyDB(dbName)
            .then(() => next(response.success(`Successfully deleted ${ dbName }`)))
            .catch(err => next(response.error(error.message)));
    }

    deleteCollections(backupID, dbName, collections, next) {

        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`backupID ${ backupID } doesn't exist`));
        }

        this.backUpsHash.get(backupID)
            .deleteCollections(dbName, collections)
            .then(() => {
                next(response.success(`Deleted ${ collections } of ${ dbName } in ${ backupID }`))
            })
            .catch(err => {
                next(response.error(`Failed to deleted ${ collections } in ${ dbName } for ${ err.message }`));
            })
    }

    getAvailableDBsCollections(mongoParams, next) {
        const { server, port, username, password, authDB } = mongoParams;
        const mongoDB = object.selfish(new MongoDB({server, port, username, password, authDB}));

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

    getCollections(backupID, dbName, next) {
        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`backupID ${ backupID } doesn't exist`, 404));
        }

        this.backUpsHash.get(backupID)
            .getCollections(dbName)
            .then(collections => {
                next(response.success(collections));
            })
            .catch(err => {
                next(response.error(`${ err.message }`));
            })
    }

    getDataFromCollection(backupID, dbName, collectionName, next) {
        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`backupID ${ backupID } doesn't exist`, 404));
        }

        this.backUpsHash.get(backupID)
            .getDataFromCollection(dbName, collectionName, {})
            .then(docs => {
                next(response.success(docs))
            })
            .catch(err => {
                next(response.error(`Failed to read data from ${ collectionName } of ${ dbName } for ${ err.message }`));
            })
    }

    getAllBackupConfigs(next) {
        this.localDB.getBackupConfigs()
            .then(backupConfigs => {
                next(response.success(backupConfigs))
            })
            .catch(err => {
                next(response.error(`Failed to get all the backup configs for ${ err.message }`))
            })
    }

    getBackupConfig(backupId, next) {
        this.localDB.getBackupConfig(backupId)
            .then(backupConfigs => {
                if(backupConfigs.length == 0) {
                    return next(response.success(null));
                }

                next(response.success(backupConfigs[0]));
            })
            .catch(err => {
                next(response.error(`Failed to get ${ backupId } backup config for ${ err.message }`));
            })
    }

    getBackupCopyDBs(backupID, next) {
        this.localDB.getBackupCopyDBsWithId(backupID)
            .then(backupCopyDBs => {
                next(response.success(backupCopyDBs));
            })
            .catch(err => {
                next(response.error(err.message));
            })
    }

    getAllBackupCopyDBs(next) {
        this.localDB.getAllCopyDBs()
            .then(copyDBs => {
                next(response.success(copyDBs))
            })
            .catch(err => {
                next(response.error(`Failed to get all copy dbs for ${ err.message }`));
            })
    }

    getAllOriginalDBs(next) {
        Promise.all([...this.backUpsHash.keys()].map(key => this.backUpsHash.get(key).getOriginalDB()))
            .then(dbs=> next(response.success(dbs)))
            .catch(err => next(response.error(err.message)))
    }

    getOriginalDB(backupID, next) {
        if(!this.backUpsHash.has(backupID)) {
            return next(response.error(`backupID ${ backupID } doesn't exist`, 404));
        }

        this.backUpsHash.get(backupID)
            .getOriginalDB()
            .then(db => next(response.success(db)))
            .catch(err => next(response.error(err.message)))

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
                    const backupManager = object.selfish(new BackupManager(this.localDB, backupConfig, this.serverSocket));
                    log.debug(`Added ${ backupConfig.id } to the backup controller`);
                    this.backUpsHash.set(backupConfig.id, backupManager);
                    backupManager.restart();
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
