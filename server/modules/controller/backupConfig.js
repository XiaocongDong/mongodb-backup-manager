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
            status: RUNNING/WAITING,
            next_backup_time: YY/MM/DD/HH/MM/SS,
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

class BackupConfig{

    constructor(backupConfigDocs) {
        this._backupConfig = backupConfigDocs;
        this.id = this.getBackUpID();
        this._backupConfig.id = this.id;
        this.server = this._backupConfig.database.server;
        this.port = this._backupConfig.database.port;
        this.username = this._backupConfig.database.username;
        this.password = this._backupConfig.database.password;
        this.authDB = this._backupConfig.database.auth_db;
        this.backupDB = this._backupConfig.backup_config.db;
        this.backupCollections = this._backupConfig.backup_config.collections;
        this.startTime = this._backupConfig.backup_config_db.start_time;
        this.interval = this._backupConfig.backup_config.interval;
        this.constraints = this._backupConfig.backup_config.constraints;
        if(!this._backupConfig.hasOwnProperty('backup_status')) {
            this._backupConfig.backup_status = {
                'status': constants.backup.status.WAITING,
                'dbs': [],
                'logs': []
            };
        }
        if(!this._backupConfig.hasOwnProperty('restore_status')) {
            this._backupConfig.restore_status = {
                'logs': []
            };
        }
    }

    setBackupStatus(status) {
        this._backupConfig.backup_status.status = status;
    }

    addBackupDB(name, createTime, deleteTime) {
        this._backupConfig.backup_status.dbs.push({
            name,
            create_time: createTime.toDateString(),
            delete_time: ((deleteTime)? deleteTime.toDateString(): '')
        });
    }

    removeBackupDB(name) {
        let dbs = this._backupConfig.backup_status.dbs;
        this._backupConfig.backup_status.dbs = dbs.filter( db => {
            return db.name != name;
        })
    }

    addBackupLog(time, message) {
        this._backupConfig.backup_status.logs.push({
            timestamp: time.toDateString(),
            message
        });
    }

    addRestoreLog(date, message) {
        this._backupConfig.restore_status.logs.push({
            timestamp: date.toDateString(),
            message
        });
    }

    setNextBackupTime(nextBackupTime) {
        this._backupConfig.backup_status.next_backup_time = nextBackupTime.toDateString();
    }

    get backupConfig() {
        return this._backupConfig;
    }

    getBackUpID() {
        const { server, username, auth_db } = this._backupConfig;
        const db = this._backupConfig.backup_config.db;
        return `${( server) ? (username + '@' + auth_db + '-') : ''}${ server + '-' }${ db }`
    }

}
