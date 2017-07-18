const start = (managerConfig) => {
    // set configuraion
    const conf = require('modules/config');
    conf.setConfig(managerConfig);
    const config = conf.config;

    const path = require('path');
    const express = require('express');
    const io = require('socket.io');
    const http = require('http');
    const router = require('modules/router');

    const object = require('modules/utility/object');
    const LocalDB = require('modules/databases/localDB');
    const backupController = require('modules/controller/backup');
    const tokenManager = require('modules/auth/token');
    const taskPool = require('modules/task/taskPool');

    const app = express();
    const httpServer = http.createServer(app);
    const serverSocket = io(httpServer);

    object.deployPromiseFinally();

    serverSocket.on('connection', () => {
    });
    //Routers
    app.use('/', router);

    const localDB = object.selfish(new LocalDB(config.database));

    localDB.connect()
       .then(() => {
           httpServer.listen(config.server.port, (err, result) => {
               if(err) {
                   console.error(`Failed to start the server for ${ err.message }`)
               }else {
                   console.log(`*`.repeat(60))
                   console.log(`MongoDB Backup Manager now is listening at ${ config.server.port }!`);
                   console.log(`*`.repeat(60))

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
}

module.exports = {
    start: start
}
