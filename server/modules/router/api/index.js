const express = require('express');
const backups = require('./backups');
const database = require('./databases');
const collections = require('./collections');
const logs = require('./logs');

const api = express.Router();

api.use('/backups', backups);
api.use('/databases', database);
api.use('/collections', collections);
api.use('/logs', logs);

module.exports = api;

