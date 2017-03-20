const express = require('express');
const response = require('modules/helper/response');
const controller = require('modules/controller/controller');
const collections = express.Router();

collections.delete('/', (req, res, next) => {
    const data = req.body;
    const { id, db, collections } = data;

    controller.deleteCollections(id, db, collections, next);
});

collections.get('/', (req, res, next) => {
    const data = req.query;
    const { id, db } = data;

    controller.getCollections(id, db, next)
});

collections.get('/data', (req, res, next) => {
    const data = req.query;
    const { id, db, collection } = data;

    controller.getDataFromCollection(id, db, collection, next)
});

module.exports = collections;

