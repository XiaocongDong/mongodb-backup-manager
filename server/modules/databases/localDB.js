const MongoDB = require('modules/databases/mongoDB');
const databaseConfig = require('modules/config').config.database;


class LocalDB extends MongoDB {

    constructor({server, port, username, password, authDB='admin'}) {
        super({ server, port, username, password, authDB });
        this.backupConfigDBName = databaseConfig.backup_config_db || 'backup_config';
        this.configCollectionName = "configurations";
        this.logsCollectionName = "logs";
        this.copyDBsCollectionName = "copyDatabases";
        this.tokenCollectionName = "tokens";
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
        return this.updateDocsInCollection(this.backupConfigDBName, this.configCollectionName, backUpConfig, { id: backUpConfig.id })
    }

    updateCopyDB(copyDB) {
        return this.updateDocsInCollection(this.backupConfigDBName, this.copyDBsCollectionName, copyDB, { id: copyDB.id, name: copyDB.name })
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

    setToken(token) {
        return this.writeToCollection(this.backupConfigDBName, this.tokenCollectionName, [token]);
    }

    getToken(query) {
        return this.readFromCollection(this.backupConfigDBName, this.tokenCollectionName, query);
    }

    updateTokens(update, query) {
        return this.updateDocsInCollection(this.backupConfigDBName, this.tokenCollectionName, update, query, true);
    }
}

module.exports = LocalDB;