const express = require('express');
const backups = require('./backups.js');
const database = require('./databases.js');

const api = express.Router();

api.use('/backups', backups);
api.use('/databases', database);

module.exports = api;

