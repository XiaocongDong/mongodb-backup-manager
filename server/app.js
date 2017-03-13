require('app-module-path').addPath(__dirname);

const express = require('express');
const router = require('modules/router');
const config = require('modules/config');
const object = require('modules/utility/object');
const MongoDB = require('modules/controller/mongoDB');
const controller = require('modules/controller/controller');

object.deployPromiseFinally();

const app = express();


//Routers
app.use('/', router);

const {server, port, username, password, auth_db} = config.database;

const localDB = object.selfish(new MongoDB(server, port, username, password, auth_db));

localDB.connect()
       .then(
           localDB.createBackupConfigCollection
       )
       .then(() => {
           controller.setBackUpDB(localDB);
           app.listen(config.server.port, () => {
               console.log(`listening at ${config.server.port}`);
           });
       })
       .catch(err => {
           console.log(err.message);
           localDB.close();
           process.exit(1);
       });


