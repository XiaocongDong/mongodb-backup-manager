const express = require('express');

const response = require('modules/helper/response');
const backupController = require('modules/controller/backup');
const backups = express.Router();

backups.post('/create', (req, res, next) => {
    const backupConfig = req.body;
    backupController.newBackup(backupConfig, next)
});

backups.get('/status', (req, res, next) => {
    const backupID = req.query.id;
    backupController.getBackupStatus(backupID, next);
});

backups.get('/configs', (req, res, next) => {
    backupController.getAllBackupConfigs(next);
});

backups.get('/config', (req, res, next) => {
    const backupID = req.query.id;
    backupController.getBackupConfig(backupID, next);
});

backups.post('/run', (req, res, next) => {
    const data = req.body;
    backupController.runBackup(data.id, next);
});

backups.patch('/update', (req, res, next) => {
    const backupID = req.body.id;
    const updates = req.body.updates;

    backupController.updateBackupConfig(backupID, updates, next);
});

backups.post('/stop', (req, res, next) => {
    const backupID = req.body.id;
    
    backupController.stop(backupID, next)
});

backups.post('/resume', (req, res, next) => {
    const backupID = req.body.id;

    backupController.resume(backupID, next);
});

backups.post('/restore', (req, res, next) => {
    const {id, db, collections} = req.body;
    backupController.restore(id, db, collections, next);
});

backups.delete('/delete', (req, res, next) => {
    const { id } = req.query;

    backupController.deleteBackup(id, next)
});

backups.delete('/:backupID/databases/:dbName', (req, res, next) => {
    const backupID = req.params.backupID;
    const dbName = req.params.dbName;

    backupController.deleteCopyDB(backupID, dbName, next)
});

module.exports = backups;