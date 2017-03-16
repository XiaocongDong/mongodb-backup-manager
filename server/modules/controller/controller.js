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

    NewBackup(backupConfig) {
        return new Promise((resolve, reject) => {
            backupConfig.id = backupConfigUtil.getBackUpID(backupConfig);

            if (this.backUpsHash.has(backupConfig.id)) {
                return reject(response.error(`Created backup failed: ${ backupConfig.id } has existed`))
            }

            const { server, port, username, password, authDB, db, collections } = backupConfig;
            const backupDB = new MongoDB(server, port, username, password,authDB);

            backupDB.connect()
                .then(() => {
                    return backupDB.getAvailableBackupCollections()
                })
                .then(dbsCollections => {
                    const dbCollections = dbsCollections.filter(dbCollection => {
                        return dbCollection.db == db;
                    });

                    if (dbCollections.length === 0) {
                        throw new Error(`${ db } doesn't exist in ${ server }`);
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

                    const result = {};
                    const status = backupManager.status;
                    const nextBackupTime = backupManager.nextBackUpTime;

                    result.backupID = backupConfig.id;
                    result.status = status;

                    if(status == constants.backup.status.WAITING && nextBackupTime) {
                        result.nextBackUpTime = nextBackupTime;
                    }

                    this.backUpsHash.set(backupConfig.id, backupManager);

                    resolve(result);
                })
                .catch(err => {
                    log.error(err.message);
                    reject(err)
                });
        });
    }

    getBackupStatus(backupID) {
        if(!this.backUpsHash.has(backupID)) {
            return response.error(`backup ID ${ backupID } doesn't exist`);
        }

        const backupManager = this.backUpsHash.get(backupID);
        const status = backupManager.backupStatus;
        const nextBackupTime = backupManager.nextBackUpTime;
        const result = { status };

        if(status == backupCons.status.WAITING && nextBackupTime) {
            result.next_backup_time = nextBackupTime.toISOString();
        }

        return response.success(result)
    }

    deleteDB(backupID, dbName) {
        return new Promise((resolve, reject) => {
            if(!this.backUpsHash.has(backupID)) {
                return reject(new Error(`backupID ${ backupID } doesn't exist`));
            }

            this.backUpsHash.get(backupID)
                .deleteDB(dbName)
                .then(() => resolve())
                .catch(err => reject(err));
        })
    }
}

// make sure there is only one controller in the application
const CONTROLLER_KEY = Symbol.for('controller');

if(!global[CONTROLLER_KEY]) {
    global[CONTROLLER_KEY] = object.selfish(new Controller);
}

module.exports = global[CONTROLLER_KEY];
