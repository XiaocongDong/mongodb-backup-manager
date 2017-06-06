const express = require('express');
const response = require('modules/helper/response');
const backupController = require('modules/controller/backup');
const collections = express.Router();

collections.delete('/', (req, res, next) => {
    const data = req.body;
    const { id, db, collections } = data;

    backupController.deleteCollections(id, db, collections, next);
});

collections.get('/', (req, res, next) => {
    const data = req.query;
    const { id, db } = data;

    backupController.getCollections(id, db, next)
});

collections.get('/data', (req, res, next) => {
    const data = req.query;
    const { id, db, collection } = data;

    backupController.getDataFromCollection(id, db, collection, next)
});

module.exports = collections;

