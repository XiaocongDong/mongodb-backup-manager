require('app-module-path').addPath(__dirname);

const path = require('path');
const express = require('express');
const io = require('socket.io');
const http = require('http');


const router = require('modules/router');
const config = require('modules/config');
const object = require('modules/utility/object');
const LocalDB = require('modules/controller/localDB');
const controller = require('modules/controller/controller');
const log = require('modules/utility/logger');

object.deployPromiseFinally();

const app = express();
const server = http.createServer(app);
const serverSocket = io(server);
serverSocket.on('connection', () => {
   console.log('connected');
});
//Routers
app.use('/', router);

const localDB = object.selfish(new LocalDB(config.database));

localDB.connect()
       .then(() => {
           controller.setLocalDB(localDB);
           controller.setServerSocket(serverSocket);
           server.listen(config.server.port, (err, result) => {
               if(err) {
                   log.error(`Failed to start the server for ${ err.message }`)
               }else {
                   log.info(`Listening at ${config.server.port}`);
                   controller.restart();
               }
           });
       })
       .catch(err => {
           console.log(err.message);
           localDB.close();
           process.exit(1);
       });


