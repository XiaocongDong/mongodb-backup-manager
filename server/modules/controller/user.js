const userHelper = require('modules/helper/user');
const response = require('modules/helper/response');
const tokenManager = require('modules/auth/token');
const request = require('modules/helper/request');
const authError = require('modules/error/auth');


const userController = {

    localDB: null,

    validateUser: (user, req, res, next) => {
        if(userHelper.isAdmin(user)) {
            let t = tokenManager.newToken(req);

            tokenManager.setTokenToDB(t)
                .then(
                    () => {
                        // set cookie
                        res.cookie('token', t.token);
                        // TODO return the role of admin user
                        next(response.success(t))
                    },
                    error => {
                        next(response.error(error.message));
                    }
                )
        }else {
            next(response.error(authError.AUTH_ERROR, authError.CODE));
        }
    },

    logoutUser: (token, req, res, next) => {
        const ip = request.getIp(req);
        const user_agent = request.getUserAgent(req);

        tokenManager.getTokensFromDB({
            token,
            ip,
            user_agent,
            valid: true
        })
        .then(tokens => {
            if(tokens.length === 0) {
                next(response.error(authError.AUTH_ERROR, authError.code));
                return;
            }

            return tokenManager
                         .invalidateTokens({
                             token,
                             ip,
                             user_agent,
                             valid: true
                         })
                         .then(() => {
                             res.cookie('token', null);
                         })
        })
        .then(() => {
            next(response.success());
        })
        .catch(err => {
            next(response.error(authError.AUTH_ERROR, authError.CODE));
        })
    }
}   

module.exports = userController;