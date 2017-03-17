const express = require('express');

const response = require('modules/helper/response');
const controller = require('modules/controller/controller');
const backups = express.Router();

backups.post('/create', (req, res, next) => {
    const backupConfig = req.body;
    controller.NewBackup(backupConfig, next)
});

backups.get('/status', (req, res, next) => {
    const backupID = req.query.id;
    controller.getBackupStatus(backupID, next);
});

backups.delete('/:backupID/databases/:dbName', (req, res, next) => {
    const backupID = req.params.backupID;
    const dbName = req.params.dbName;

    controller.deleteDB(backupID, dbName, next)
});

module.exports = backups;