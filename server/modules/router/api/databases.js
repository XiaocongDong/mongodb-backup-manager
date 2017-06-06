const express = require('express');
const response = require('modules/helper/response');
const backupController = require('modules/controller/backup');
const databases = express.Router();


databases.get('/availableDBs', (req, res, next) => {
    const mongoParams = req.query;
    backupController.getAvailableDBsCollections(mongoParams, next)
});

databases.get('/copyDBs', (req, res, next) => {
    const backupID = req.query.id;

    backupController.getBackupCopyDBs(backupID, next);
});

databases.get('/originalDB', (req, res, next) => {
    const backupID = req.query.id;

    backupController.getOriginalDB(backupID, next);
});

databases.get('/allOriginalDBs', (req, res, next) => {
    backupController.getAllOriginalDBs(next);
});

databases.get('/allCopyDBs', (req, res, next) => {
    backupController.getAllBackupCopyDBs(next);
});

databases.delete('/', (req, res, next) => {
    const { id, db } = req.query;

    backupController.deleteDB(id, db, next)
});

module.exports = databases;
