const express = require('express');
const api = require('modules/router/api');
const logger = require('modules/middleware/logger');

const router = express.Router();

router.use('/', logger);
router.use('/api', api);

module.exports = router;
