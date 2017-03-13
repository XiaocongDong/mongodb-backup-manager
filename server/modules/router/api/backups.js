const express = require('express');

const response = require('modules/helper/response');
const controller = require('modules/controller/controller');
const backups = express.Router();

backups.post('/create', (req, res, next) => {
    let backupConfig = req.body;
    controller.NewBackup(backupConfig)
        .then(result => {
            response.send(res, result);
        })
        .catch(err => {
            response.send(res, err);
        })
});

module.exports = backups;