const token = require('modules/auth/token');
const userHelper = require('modules/helper/user');
const response = require('modules/helper/response');
const tokenManager = require('modules/auth/token');


const userController = {

    localDB: null,

    validateUser: (user, req, res, next) => {
        console.log(user);
        if(userHelper.isAdmin(user)) {
            let t = token.newToken(req);

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

        }
    }
}   

module.exports = userController;