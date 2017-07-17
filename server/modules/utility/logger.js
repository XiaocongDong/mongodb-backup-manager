const Logger = require('basic-logger');
const config = require('modules/config').config;

// configure level one time, it will be set to every instance of the logger
Logger.setLevel(config.server.logLevel); // only warnings and errors will be shown

const customConfig = {
    showTimestamp: true
};

const log = new Logger(customConfig) ;


module.exports = log;
