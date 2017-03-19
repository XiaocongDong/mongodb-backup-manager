const express = require('express');

const response = require('modules/helper/response');
const controller = require('modules/controller/controller');

const collections = express.Router();

collections.delete('/', (req, res, next) => {
    const data = req.body;

    const { id, dbName, collections } = data;
    if(id) {
        controller.deleteCollectionsInBackupDB(id, collections, next);
    }else{
        controller.deleteCollectionsInLocalDB(dbName, collections, next);
    }
});

collections.get('/', (req, res, next) => {
    const data = req.query;

    controller.getCollectionsInBackupDB(data.id, next)
});

collections.get('/data', (req, res, next) => {
    const data = req.query;

    const { id, dbName, collectionName } = data;

    if(id) {
        controller.getCollectionDataFromBackupDB(id, collectionName, next);
    }else {
        controller.getCollectionDataFromLocalDB(dbName, collectionName, next);
    }
});

module.exports = collections;

