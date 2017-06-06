const express = require('express');
const auth = require('./auth');
const operation = require('./operation');

const user = express.Router();

user.use('/auth', auth);
user.use('/operation', operation);

module.exports = user;