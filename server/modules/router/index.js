const express = require('express');
const api = require('modules/router/api');
const bodyParser = require('body-parser');
const logger = require('modules/middleware/logger');
const responseHandler = require('modules/middleware/response_handler');

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use('/', logger);
router.use('/api', api);
router.use('/', responseHandler);

module.exports = router;
