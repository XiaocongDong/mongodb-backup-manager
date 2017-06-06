const token = require('modules/auth/token');
const userHelper = require('modules/helper/user');
const response = require('modules/helper/response');


const user = {

    localDB: null,

    validateUser: (user, req, res, next) => {
        if(userHelper.isAdmin(user)) {
            let t = token.newToken(req);

            user.localDB.setToken(t)
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
        }
    },

    setLocalDB: localDB => {
        user.localDB = localDB;
    }

}   

module.exports = user;