const fs = require('fs');
const path = require('path');
const stripJsonComments = require('strip-json-comments');

const config = {

    configFile: path.join(__dirname, "../backup.config.json"),

    config: null,

    setConfigFile: (configFile) => {
        (configFile) && (config.configFile = configFile);
    },

    readConfig: () => {
        let conf = fs.readFileSync(config.configFile, "utf-8");
        conf = JSON.parse(stripJsonComments(conf));

        config.config = conf;
    }
}



module.exports = config;
