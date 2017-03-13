const BackupManager = require('modules/controller/backupManager');
const object = require('modules/utility/object');
const constants = require('modules/constants');
const response = require('modules/helper/response');
const BackupConfig = require('modules/controller/backupConfig');

class Controller {

    constructor() {
        this.localDB = null;
        this.backUpsHash = new Map();
    }

    setBackUpDB(localDB) {
        this.localDB = localDB;
    }

    NewBackup(backupConfig) {
        return new Promise((resolve, reject) => {
            const backupConfig = object.selfish(new BackupConfig(backupConfig));

            if (this.backUpsHash.has(backupConfig.id)) {
                return reject(response.error('created backup failed: back up has existed'))
            }

            this.localDB.updateBackUpConfig(backupConfig.backupConfig)
                .then(() => {
                    const backupDB = new MongoDB(backupConfig.server, backupConfig.port,
                        backupConfig.username, backupConfig.password,
                        backupConfig.authDB);

                    backupDB.connect()
                        .then(() => {
                            const backUpManager = object.selfish(new BackupManager(backupDB, this.localDB, backupConfig));
                            this.backUpsHash.set(backupConfig.id, backUpManager);
                            backUpManager.start();

                            let result = {
                                backup_id: backupConfig.id
                            };

                            resolve(response.success(result));
                        })
                        .catch(err => {
                            console.error(`Failed to connect to ${backupDB.url}`);
                            reject(reject(response.error(err.message)));
                        });

                })
                .catch(err => reject(response.error(err.message)))

        })
    }
}

// make sure there is only one controller in the application
const CONTROLLER_KEY = Symbol.for('controller');

if(!global[CONTROLLER_KEY]) {
    global[CONTROLLER_KEY] = object.selfish(new Controller);
}

module.exports = global[CONTROLLER_KEY];
