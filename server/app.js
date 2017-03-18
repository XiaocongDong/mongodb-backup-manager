require('app-module-path').addPath(__dirname);

const express = require('express');
const router = require('modules/router');
const config = require('modules/config');
const object = require('modules/utility/object');
const LocalDB = require('modules/controller/localDB');
const controller = require('modules/controller/controller');
const log = require('modules/utility/logger');


object.deployPromiseFinally();

const app = express();


//Routers
app.use('/', router);

const localDB = object.selfish(new LocalDB(config.database));

localDB.connect()
       .then(() => {
           controller.setLocalDB(localDB);
           app.listen(config.server.port, (err, result) => {
               if(err) {
                   log.error(`Failed to start the server for ${ err.message }`)
               }else {
                   log.info(`Listening at ${config.server.port}`);
               }
           });
       })
       .catch(err => {
           console.log(err.message);
           localDB.close();
           process.exit(1);
       });


