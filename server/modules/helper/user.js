const config = require('modules/config').config;

const user = {
    
    isAdmin: (user) => {
        // check if the user is admin
        return user.username == config.auth.username &&
               user.password == config.auth.password
    }

}

module.exports = user;