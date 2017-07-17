const response = require('modules/helper/response');
const request = require('modules/helper/request');
const tokenManager = require('modules/auth/token');
const authError = require('modules/error/auth');
const log = require('modules/utility/logger');


const tokenHandler = {
    
    validate: (req, res, next) => {
        if(!tokenHandler.neededAuthenticated(req)) {
            return next();
        }

        const token = req.cookies.token;

        if(token == null) {
            response.send(res, response.error(authError.AUTH_ERROR, authError.CODE));
            return;
        }

        const ip = request.getIp(req);
        const user_agent = request.getUserAgent(req);
        const now = new Date().valueOf();
        
        tokenManager.getTokensFromDB(
                        {
                            token, 
                            ip, 
                            user_agent, 
                            valid: true,
                            exp_time: {'$gt': now}
                        }
                    )
                    .then(tokens => {
                        if(tokens.length == 0) {
                            
                            throw undefined;
                        }

                        // token authenticated
                        next();
                    })
                    .catch(error => {
                        response.send(res, response.error(authError.AUTH_ERROR, authError.CODE));
                    })
    },

    neededAuthenticated: req => {
        const url = req.originalUrl;

        if(url === '/' ||
           url == '/user/auth/login' ||
           url.indexOf('dist') >= 0) {
           // don't need to authenticate the request for frontend and sign in
           return false; 
        }
        return true;
    }
}

module.exports = tokenHandler;