const MongoDB = require('modules/databases/mongoDB');
const databaseConfig = require('modules/config').database;


class LocalDB extends MongoDB {

    constructor({server, port, username, password, authDB='admin'}) {
        super({ server, port, username, password, authDB });
        this.backupConfigDBName = databaseConfig.backup_config_db || 'backup_config';
        this.configCollectionName = "configurations";
        this.logsCollectionName = "logs";
        this.copyDBsCollectionName = "copyDatabases";
    }

    getBackupConfigs() {
        return this.readFromCollection(this.backupConfigDBName, this.configCollectionName, { });
    }

    getBackupConfig(backupID) {
        return this.readFromCollection(this.backupConfigDBName, this.configCollectionName, {id: backupID })
    }

    getAllCopyDBs() {
        return this.readFromCollection(this.backupConfigDBName, this.copyDBsCollectionName, { });
    }

    getBackupCopyDBsWithId(backupID) {
        return this.readFromCollection(this.backupConfigDBName, this.copyDBsCollectionName, { id: backupID } );
    }

    getBackupLogs(backupID) {
        return this.readFromCollection(this.backupConfigDBName, this.logsCollectionName, { id: backupID });
    }

    updateBackupConfig(backUpConfig) {
        return this.updateDocInCollection(this.backupConfigDBName, this.configCollectionName, backUpConfig, { id: backUpConfig.id })
    }

    updateCopyDB(copyDB) {
        return this.updateDocInCollection(this.backupConfigDBName, this.copyDBsCollectionName, copyDB, { id: copyDB.id, name: copyDB.name })
    }

    addCopyDB(copyDB) {
        return this.writeToCollection(this.backupConfigDBName, this.copyDBsCollectionName, [copyDB])
    }

    addLog(log) {
        return this.writeToCollection(this.backupConfigDBName, this.logsCollectionName, [log]);
    }

    deleteCopyDBByIDAndName(id, name){
        return this.deleteDocs(this.backupConfigDBName, this.copyDBsCollectionName, { id, name });
    }

    deleteBackupConfig(id) {
        return this.deleteDocs(this.backupConfigDBName, this.configCollectionName, { id })
    }

    clearLogsByID(id) {
        return this.deleteDocs(this.backupConfigDBName, this.logsCollectionName, { id })
    }

}

module.exports = LocalDB;