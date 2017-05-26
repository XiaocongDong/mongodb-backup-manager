const log = require('modules/utility/logger');

const logger = (req, resp, next) => {
    log.debug(`Request from ${ req.originalUrl }`);
    next();
};

module.exports = logger;