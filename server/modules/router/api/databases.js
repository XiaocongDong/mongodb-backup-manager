const express = require('express');

const response = require('modules/helper/response');
const controller = require('modules/controller/controller');

const databases = express.Router();


databases.get('/collections', (req, res, next) => {
    const mongoParams = req.query;

    controller.getAvailableDBsCollections(mongoParams, next)
});

databases.get('/', (req, res, next) => {
    const backupID = req.query.id;

    controller.getAllBackupCopyDBs(backupID, next);
});
module.exports = databases;
