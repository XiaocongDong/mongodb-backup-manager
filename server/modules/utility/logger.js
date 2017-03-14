const Logger = require('basic-logger');
// configure level one time, it will be set to every instance of the logger
Logger.setLevel('debug'); // only warnings and errors will be shown

const customConfig = {
    showTimestamp: true
};

const log = new Logger(customConfig) ;


module.exports = log;
