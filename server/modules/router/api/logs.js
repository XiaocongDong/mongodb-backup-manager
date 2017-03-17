const express = require('express');

const controller = require('modules/controller/controller');

const logs = express.Router();

logs.get('/', (req, res, next) => {
    const backupID = req.query.id;

    controller.getAllBackupLogs(backupID, next);
});

module.exports = logs;

