const fs = require('fs');
const path = require('path');

let config = fs.readFileSync(path.join(__dirname, "../backup.config.json"), "utf-8");
config = JSON.parse(config);

module.exports = config;
