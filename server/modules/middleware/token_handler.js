const response = require('modules/helper/response');
const request = require('modules/helper/request');
const tokenManager = require('modules/auth/token');


const tokenHandler = {
    
    validate: (req, res, next) => {
        const url = req.originalUrl;

        console.log(url);

        if(url === '/' ||
           url == '/user/auth/login' ||
           url.indexOf('dist') >= 0) {
           // don't need to authenticate the request for frontend and sign in
           next();
           return; 
        }

        const token = req.cookies.token;

        if(token == null) {
            response.send(res, response.error('authentication failed', 401));
            return;
        }

        const ip = request.getIp(req);
        const user_agent = request.getUserAgent(req);
        const now = new Date().valueOf();
        
        tokenManager.getTokensFromDB(token, ip, user_agent, now)
                    .then(tokens => {
                        console.log(tokens);
                        if(tokens.length == 0) {
                            response.send(res, response.error('authentication failed', 401));
                            return;
                        }

                        // token authenticated
                        next();
                    })
                    .catch(error => {
                        console.error(error);
                        response.send(res, response.error('authentication failed', 401));
                    })
    },

    refresh: (req, res, next) => {

    }
}

module.exports = tokenHandler;