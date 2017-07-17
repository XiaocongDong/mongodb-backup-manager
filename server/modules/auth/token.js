const config = require('modules/config').config;
const request = require('modules/helper/request');

const tokenManager = {
    
    localDB: null,

    setDB: localDB => {
        tokenManager.localDB = localDB;
    },

    newToken : req => {
        let token = {};

        token.crt = new Date().valueOf();
        token.exp_time = token.crt + config.auth.token_exp_time;
        token.token = tokenManager._generateToken();
        token.ip = request.getIp(req);
        token.user_agent = request.getUserAgent(req);
        token.valid = true;

        return token;
    },  

    _generateToken: () => {
        let token = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for(let i = 0; i < 64; ++i) {
            token += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return token;
    },

    setTokenToDB: token => {
        return tokenManager.localDB.setToken(token);
    },

    getTokensFromDB: (query) => {
        return tokenManager.localDB.getToken(query)
    },

    invalidateTokens: (query) => {
        return tokenManager.localDB.updateTokens({'$set': {valid: false}}, query);
    }
};

module.exports = tokenManager;