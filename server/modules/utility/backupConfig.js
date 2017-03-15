/*
   backupConfig in db sample:
   {
        id: ${username}@${auth_db}-${ server }-${ backup_db },
        database: {
            server: 'localhost',
            port: '27017',
            username: 'admin',
            password: 'admin',
            auth_db: 'admin'
        },
        backup_config: {
            db: 'test',
            collections: [
                'life',
                'work',
                'love'
            ]
            time: {
                start_time: YY/MM/DD/HH/MM/SS,
                interval: 3434
            },
            constraints: {
                maximum_number: 7,
                duration: 23232;
            }
        },
        backup_status {
            //information about the back up
            dbs: [
                {
                    name: ${backup_id} + ${ timestamp },
                    created_time: time of the database created,
                    delete_time: time of the database will be deleted
                }
            ]
            logs: [
                {
                    time: timestamp of the log,
                    content: backup database failed for database connection lost
                }
            ]
        },
        restore_status {
            //information about the restore
            logs: [
                {
                    time: timestamp of the log,
                    content: restore database failed for database connection lost
                }
            ]
        }
    }

 */
const constants = require('modules/constants');

const backupConfigUtil = {

    // setBackupStatus: (backupConfig, status) => {
    //     backupConfig.backup_status.status = status;
    // },

    addBackupDB: (backupConfig, name, createTime, deleteTime) => {
        backupConfig.backup_status.dbs.push({
            name,
            create_time: createTime.toISOString(),
            delete_time: ((deleteTime)? deleteTime.toISOString(): '')
        });
    },

    removeBackupDB: (backupConfig, name) => {
        let dbs = backupConfig.backup_status.dbs;
        backupConfig.backup_status.dbs = dbs.filter( db => {
            return db.name != name;
        })
    },

    addBackupLog: (backupConfig, time, message) => {
        backupConfig.backup_status.logs.push({
            timestamp: time.toDateString(),
            message
        });
    },

    addRestoreLog: (backupConfig, date, message) => {
        backupConfig.restore_status.logs.push({
            timestamp: date.toDateString(),
            message
        });
    },


    getBackUpID: (backupConfig) => {
        // const { server, username, auth_db } = backupConfig.database;
        // const db = backupConfig.backup_config.db;
        // return `${( server) ? (username + '@' + auth_db + '-') : ''}${ server + '-' }${ db }`
        return backupConfig.backup_config.db;
    },

    initializeBackupConfig: (backupConfig) => {
        backupConfig.id = backupConfigUtil.getBackUpID(backupConfig);
        if(!backupConfig.hasOwnProperty('backup_status')) {
            backupConfig.backup_status = {
                'dbs': [],
                'logs': []
            };
        }
        if(!backupConfig.hasOwnProperty('restore_status')) {
            backupConfig.restore_status = {
                'logs': []
            };
        }
        return backupConfig;
    }
};

module.exports = backupConfigUtil;

// let doc = {
//     "database": {
//         "server": "localhost",
//         "port": "27017",
//         "username": "xiaocdon",
//         "password": "137800",
//         "auth_db": "crcdashboard"
//     },
//     "backup_config": {
//         "db": "crcdashboard",
//         "collections": [
//             "contact",
//             "organizations",
//             "proposals"
//         ],
//         "time": {
//             "interval": 120000
//         },
//         "constraints": {
//             "maximum_number": 7,
//             "duration": 30000000
//         }
//     }
// }
// let backupConfigUtil = new BackupConfig(doc);
// console.log(backupConfigUtil.backupConfigUtil)