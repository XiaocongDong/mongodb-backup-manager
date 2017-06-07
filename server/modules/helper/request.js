const request = {

    getIp: req => {
        // get user ip adress from the request object
        return req.ip || 
               req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress;
    },

    getUserAgent: req => {
        return req.headers['user-agent'];
    }
}

module.exports = request;