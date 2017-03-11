require('app-module-path').addPath(__dirname);

const express = require('express');
const router = require('modules/router');
const config = require('modules/config');
const object = require('modules/utility/object');

object.deployPromiseFinally();

const app = express();


//Routers
app.use('/', router);


app.listen(config.server.port, () => {
    console.log(`listening at ${config.server.port}`);
});
