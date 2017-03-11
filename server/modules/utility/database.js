const database = {

    getMongoUri: (username, password, server, port, authDB='admin') => {
        return `mongodb://${ (username && password)? (username + ':' + password + '@')
            : '' }${ server + ':' + port + '/' + authDB}`;
    }
};

// const uri = database.getMongoUri(undefined, undefined, 'localhost', 27017)
// console.log(uri)
module.exports = database