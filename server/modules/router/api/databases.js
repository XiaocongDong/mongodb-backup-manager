const express = require('express');
const MongoDB = require('modules/controller/database/mongoDB');
const object = require('modules/utility/object');
const databases = express.Router();


databases.get('/collections', (req, res, next) => {
    const {username, password, server, port, authDB='admin'} = req.query;
    const mongoDB = object.selfish(new MongoDB(server, port, username, password, authDB));
    mongoDB.connect()
           .then(mongoDB.getAvailableBackupCollections)
           .then(dbCollections => res.json(dbCollections))
           .catch(err => res.json(err.message))
           .finally(mongoDB.close)
});

module.exports = databases;
