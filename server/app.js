const path = require('path');
const express = require('express');
const io = require('socket.io');
const http = require('http');

const router = require('modules/router');
const config = require('modules/config');
const object = require('modules/utility/object');
const LocalDB = require('modules/databases/localDB');
const backupController = require('modules/controller/backup');
const tokenManager = require('modules/auth/token');
const log = require('modules/utility/logger');
const taskPool = require('modules/task/taskPool');

const app = express();
const server = http.createServer(app);
const serverSocket = io(server);

object.deployPromiseFinally();

serverSocket.on('connection', () => {
});
//Routers
app.use('/', router);

const localDB = object.selfish(new LocalDB(config.database));

localDB.connect()
       .then(() => {
           server.listen(config.server.port, (err, result) => {
               if(err) {
                   log.error(`Failed to start the server for ${ err.message }`)
               }else {
                   log.info(`Listening at ${config.server.port}`);
                   
                   backupController.setLocalDB(localDB);
                   backupController.setServerSocket(serverSocket);
                   taskPool.setController(backupController);

                   tokenManager.setDB(localDB);

                   backupController.restart();
                   taskPool.start(config.server.interval);
               }
           });
       })
       .catch(err => {
           localDB.close();
           process.exit(1);
       });


