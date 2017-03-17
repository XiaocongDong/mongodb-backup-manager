const express = require('express');
const backups = require('./backups.js');
const database = require('./databases.js');
const logs = require('./logs');

const api = express.Router();

api.use('/backups', backups);
api.use('/databases', database);
api.use('/logs', logs);

module.exports = api;

