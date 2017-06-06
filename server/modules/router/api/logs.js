const express = require('express');

const backupController = require('modules/controller/backup');

const logs = express.Router();

logs.get('/', (req, res, next) => {
    const backupID = req.query.id;

    backupController.getAllBackupLogs(backupID, next);
});

module.exports = logs;

