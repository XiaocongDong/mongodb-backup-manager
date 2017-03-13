const database = {

    getMongoUri: (username, password, server, port, authDB='admin') => {
        return `mongodb://${ (username && password)? (username + ':' + password + '@')
            : '' }${ server + ':' + port + '/' + authDB}`;
    },

};

// const uri = database.getMongoUri(undefined, undefined, 'localhost', 27017)
// console.log(uri)
// console.log(database.getBackUpID({
//     database: {
//         server: 'localhost',
//         port: '27017',
//         // username: 'admin',
//         password: 'admin',
//         auth_db: 'admin'
//     },
//     backup_config: {
//         db: 'crcdashboard',
//         collections: [
//             'contact',
//             'organizations',
//             'proposals'
//         ]
//     }
// }));

module.exports = database