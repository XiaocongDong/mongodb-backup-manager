const express = require('express');
const MongoDB = require('modules/controller/mongoDB');
const object = require('modules/utility/object');
const databases = express.Router();


databases.get('/collections', (req, res, next) => {
    const mongoParams = req.query;
    const mongoDB = object.selfish(new MongoDB(mongoParams));
    mongoDB.connect()
           .then(mongoDB.getAvailableBackupCollections)
           .then(dbCollections => res.json(dbCollections))
           .catch(err => res.json(err.message))
           .finally(mongoDB.close)
});

module.exports = databases;
