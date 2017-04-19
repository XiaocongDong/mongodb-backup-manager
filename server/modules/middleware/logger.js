const logger = (req, resp, next) => {
    console.log('Request from', req.originalUrl);
    next();
};

module.exports = logger;