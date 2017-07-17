const fs = require('fs');
const path = require('path');
const stripJsonComments = require('strip-json-comments');

let config = fs.readFileSync(path.join(__dirname, "../backup.config.json"), "utf-8");
config = JSON.parse(stripJsonComments(config));

module.exports = config;
