const config = require('modules/config');
const request = require('modules/request');

const token = {
    
    newToken : () => {
        let token = {};

        token.crt = new Date().valueOf();
        token.exp_time = token.crt + config.auth.token_exp_time;
        token.token = token.getToken();
        token.ip = request.getIp(req);
        token.user_agent = request.getUserAgent(req);

        return token;
    },  

    getToken: () => {
        let token = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for(let i = 0; i < 64; ++i) {
            token += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return id;
    }
};

export default token;