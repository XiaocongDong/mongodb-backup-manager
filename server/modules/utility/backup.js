/*
    backup configuration:

    {
         id: crcdashboard@localhost,
         server: localhost,
         port: 27017,
         username: admin,
         password: admin,
         authDB: admin,
         db: crc,
         collections: [], // if not specified will backup all the collections
         startTime: the time of backup started, if not specified, started right now
         interval: millisecond interval for backup
         maxBackupNumber: 7// integer
         duration: millisecond of how long will the backup expire
    }

    backup_id: db_name@server

    backup databases

    {
          id: crcdashboard@localhost,
          originalDatabase: {
              server: localhost,
              database: crcdashboard
         }
          name: crcdashboard@localhost-timestamp,
          collections: [], the collection in the backup

          created_time: the time of the backup created
          deleted_time: the time of the backup will be deleted, calculated by duration time,
    }

    logs

    {
         id: crcdashboard@localhost,
         logs:[
             timestamp: the timestamp of the logging infomation,
             content: created backup configuration, deleted backup configuration, stop backup, backup successfully, backup failed: error message,                                  deleted database successfully, retore database successfully
         ]
    }
 */
const constants = require('modules/constants');

const backupUtil = {

    optionalKeys: ['collections', 'startTime', 'interval', 'maxBackupNumber', 'duration'],

    getBackupID: (backupConfig) => {
        return `${ backupConfig.db }@${ backupConfig.server }`;
    },

    getNextBackupTime: (backupConfig) => {
        let { startTime, nextBackupTime } = backupConfig;

        const now = new Date();

        // try to get nextBackup time from nextBackupTime first
        if(nextBackupTime) {
            const nextBackupDateTime = new Date(nextBackupTime);
            if(nextBackupDateTime > now) {
                return nextBackupDateTime
            }
        }

        if(startTime) {
            startTime = new Date(startTime);

            // if the original startTime has past, change it to today
            if(startTime < now) {
                startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
                    startTime.getHours(), startTime.getMinutes(), startTime.getSeconds(), startTime.getMilliseconds());

                if(startTime < now ) {
                    // next Day
                    startTime = new Date(startTime.valueOf() + 24*60*60*1000);
                }
            }
        }

        if(!startTime) {
            startTime = now;
        }

        return startTime;
    },

    updateBackupData(backupConfig) {
        if(backupConfig.backupTotal == null) {
            backupConfig.status = constants.backup.status.PENDING;
            backupConfig.statistics = {
                total: 0,
                success: 0,
                failures: 0
            };

            backupConfig.createdTime = new Date().toLocaleString();
        }
    },

    updateBackupConfigFromUpdates(backupConfig, updates) {
        Object.assign(backupConfig, updates);
        // remove the optional key from backupConfig if necessary
        backupUtil.optionalKeys.forEach(key => {
            if(!(key in updates) && (key in backupConfig)) {
                delete backupConfig[key];
            }
        })
    }
};

module.exports = backupUtil;
