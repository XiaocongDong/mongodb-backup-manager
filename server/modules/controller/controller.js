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

    setBackUpDB(localDB) {
        this.localDB = localDB;
    }

    NewBackup(newBackupConfig) {
        return new Promise((resolve, reject) => {
            const backupConfig = backupConfigUtil.initializeBackupConfig(newBackupConfig);

            if (this.backUpsHash.has(backupConfig.id)) {
                return reject(response.error('created backup failed: back up has existed'))
            }

            const {server, port, username, password, auth_db} = backupConfig.database;
            const backupDB = new MongoDB(server, port, username, password, auth_db);

            backupDB.connect()
                .then(() => {
                    this.localDB.updateBackUpConfig(backupConfig)
                        .then(() => {
                            const backUpManager = object.selfish(
                                new BackupManager(backupConfig.id, backupDB, this.localDB, backupConfig.backup_config));
                            this.backUpsHash.set(backupConfig.id, backUpManager);
                            backUpManager.start();

                            let result = {
                                backup_id: backupConfig.id
                            };

                            resolve(response.success(result));
                        })
                        .catch(err => {
                            log.info(err.message);
                            reject(response.error(err.message))
                        });
                })
                .catch(err => {
                    reject(reject(response.error(err.message)));
                });
        })
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
