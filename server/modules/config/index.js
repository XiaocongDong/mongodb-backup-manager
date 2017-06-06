const server = require('./server.js');
const database = require('./database');
const auth = require('./auth');

const config = {
    server,
    database,
    auth
};

module.exports = config;
