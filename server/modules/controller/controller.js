const BackupManager = require('modules/controller/backupManager');
const object = require('modules/utility/object');
const constants = require('modules/constants');
const response = require('modules/helper/response');
const backupConfigUtil = require('modules/utility/backupConfig');
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

    NewBackup(backupConfig, next) {
        backupConfig.id = backupConfigUtil.getBackUpID(backupConfig);

        if (this.backUpsHash.has(backupConfig.id)) {
            return next(response.error(`Created backup failed: ${ backupConfig.id } has existed`, 409))
        }

        const { server, port, username, password, authDB, db, collections } = backupConfig;
        const backupDB = object.selfish(new MongoDB(server, port, username, password,authDB));

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

                return this.localDB.updateBackUpConfig(backupConfig)
            })
            .then(() => {
                log.info(`Updated backup config for ${ backupConfig.id }`);
                const backupManager = object.selfish(new BackupManager(backupDB, this.localDB, backupConfig));

                backupManager.start();

                this.backUpsHash.set(backupConfig.id, backupManager);

                this.getBackupStatus(backupConfig.id, next);
            })
            .catch(err => {
                next(response.error(err.message));
            });
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
}

// make sure there is only one controller in the application
const CONTROLLER_KEY = Symbol.for('controller');

if(!global[CONTROLLER_KEY]) {
    global[CONTROLLER_KEY] = object.selfish(new Controller);
}

module.exports = global[CONTROLLER_KEY];
