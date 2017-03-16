const MongoDB = require('modules/controller/mongoDB');
const databaseConfig = require('modules/config').database;


class LocalDB extends MongoDB {

    constructor(server, port, username, password, auth_db='admin') {
        super(server, port, username, password, auth_db);
        this.backupConfigDBName = databaseConfig.backup_config_db || 'backup_config';
        this.configCollectionName = "configurations";
        this.logsCollectionName = "logs";
        this.copyDBsCollectionName = "copyDatabases";
    }

    getBackupConfig(backUpID) {
        return this.readFromCollection(this.backupConfigDBName, this.configCollectionName, { id: backUpID });
    }

    getBackupCopyDatabases(backupID) {
        return this.readFromCollection(this.backupConfigDBName, this.copyDBsCollectionName, { id: backupID } );
    }

    getBackupLogs(backupID) {
        return this.readFromCollection(this.backupConfigDBName, this.logsCollectionName, { id: backupID });
    }

    updateBackUpConfig(backUpConfig) {
        return this.updateDocInCollection(this.backupConfigDBName, this.configCollectionName, backUpConfig)
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

    clearLogsByID(id) {
        return this.deleteDocs(this.backupConfigDBName, this.logsCollectionName, {})
    }

}

module.exports = LocalDB;