const database = {

    getMongoUri: (username, password, server, port, authDB='admin') => {
        return `mongodb://${ (username && password)? (username + ':' + password + '@')
            : '' }${ server + ':' + port + '/' + authDB}`;
    },

};

module.exports = database;