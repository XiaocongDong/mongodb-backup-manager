const express = require('express');

const response = require('modules/helper/response');
const controller = require('modules/controller/controller');
const backups = express.Router();

backups.post('/create', (req, res, next) => {
    const backupConfig = req.body;
    controller.newBackup(backupConfig, next)
});

backups.get('/status', (req, res, next) => {
    const backupID = req.query.id;
    controller.getBackupStatus(backupID, next);
});

backups.get('/configs', (req, res, next) => {
    controller.getAllBackupConfigs(next);
});

backups.get('/config', (req, res, next) => {
    const backupID = req.query.id;
    controller.getBackupConfig(backupID, next);
});

backups.post('/run', (req, res, next) => {
    const data = req.body;
    controller.runBackup(data.id, next);
});

backups.patch('/update', (req, res, next) => {
    const backupID = req.body.id;
    const updates = req.body.updates;

    controller.updateBackupConfig(backupID, updates, next);
});

backups.post('/stop', (req, res, next) => {
    const backupID = req.body.id;
    console.log(req.body);

    controller.stop(backupID, next)
});

backups.post('/resume', (req, res, next) => {
    const backupID = req.body.id;

    controller.resume(backupID, next);
});

backups.post('/restore', (req, res, next) => {
    const {id, db, collections} = req.body;
    controller.restore(id, db, collections, next);
});

backups.delete('/delete', (req, res, next) => {
    const { id, clearLog, clearDBs } = req.query;

    controller.deleteBackup(id,clearLog, clearDBs, next)
});

backups.delete('/:backupID/databases/:dbName', (req, res, next) => {
    const backupID = req.params.backupID;
    const dbName = req.params.dbName;

    controller.deleteCopyDB(backupID, dbName, next)
});

module.exports = backups;