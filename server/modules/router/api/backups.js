const express = require('express');

const response = require('modules/helper/response');
const controller = require('modules/controller/controller');
const backups = express.Router();

backups.post('/create', (req, res, next) => {
    const backupConfig = req.body;
    controller.NewBackup(backupConfig)
        .then(result => {
            response.send(res, response.success(result));
        })
        .catch(err => {
            response.send(res, response.error(err.message));
        })
});

backups.get('/status', (req, res, next) => {
    const backupID = req.query.id;
    const status = controller.getBackupStatus(backupID);

    if(!status) {
        response.send(res, response.error(`backupID ${ backupID } doesn't exist`));
    }else {
        response.send(res, response.success(status));
    }
});

backups.delete('/:backupID/databases/:dbName', (req, res, next) => {
    const backupID = req.params.backupID;
    const dbName = req.params.dbName;

    controller.deleteDB(backupID, dbName)
        .then(() => response.send(res, response.success(`Success fully deleted ${ dbName }`)))
        .catch( err => response.send(res, response.error(`Failed to deleted ${ dbName } for ${ err.message }`)));
});

module.exports = backups;