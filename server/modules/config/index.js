const fs = require('fs');
const path = require('path');
const stripJsonComments = require('strip-json-comments');

const defaultConfig = {
    auth: {
        username : "admin",
        password: "admin", 
        token_exp_time: 3600000
    },
    database: {
        server: "localhost",
        port: 27017, 
        backup_config_db: "backup", 
        database_backup_roles: ["readWrite", "dbOwner"], 
        all_database_backup_roles: ["readWriteAnyDatabase"] 
    },
    server: {
        port: 8082, 
        interval: 2000, 
        logLevel: "info" 
    }
}

const config = {

    requirements: {
        auth: {
            mandatory: [
                {
                    key: "username",
                    type: String
                },
                {
                    key: "password",
                    type: String
                },
                {
                    key: "token_exp_time",
                    type: Number
                }
            ],
            optional: []
        },
        database: {
            mandatory: [
                {
                    key: "server",
                    type: String,
                },
                {
                    key: "port",
                    type: Number,
                },
                {
                    key: "backup_config_db",
                    type: String
                },
                {
                    key: "database_backup_roles",
                    type: Array
                },
                {
                    key: "all_database_backup_roles",
                    type: Array
                }
            ],
            optional: [
                {
                    key: "username",
                    type: String,
                },
                {
                    key: "password",
                    type: String,
                },
                {
                    key: "authDB",
                    type: String,
                }
            ]
        },
        server: {
            mandatory: [
                {
                    key: "port",
                    type: Number,
                },
                {
                    key: "interval",
                    type: Number,
                },
                {
                    key: "logLevel",
                    type: String,
                }
            ]
        }
    },

    cmds: {
        auth: [
            
        ],
        database: [
            {
                cmd: "dbServer",
                key: "server"
            },
            {
                cmd: "dbPort",
                key: "port"
            },
            {
                cmd: "username",
                key: "username"
            },
            {
                cmd: "password",
                key: "password"
            },
            {
                cmd: "authDB",
                key: "authDB"
            }
        ],
        server: [
            {
                cmd: "serverPort",
                key: "port"
            },
            {
                cmd: "interval",
                key: "interval"
            },
            {
                cmd: "log",
                key: "logLevel"
            }
        ]
    },

    config: {},

    setConfig: (managerConfig) => {
        let configFile = managerConfig.config;

        if(configFile != null) {
            // read the config from customized config file
            if(!fs.existsSync(configFile)) {
                throw new Error(`Import Error: ${ configFile } doesn't exist in the system`);
            }else {
                config.config = config.readConfig(configFile);
            }
        }else {
            // read config from cmd
            for(let sec in config.cmds) {
                let cmds = config.cmds[sec];

                for(let cmd of cmds) {
                    if(managerConfig.hasOwnProperty(cmd.cmd)) {
                        defaultConfig[sec][cmd.key] = managerConfig[cmd.cmd]
                    }
                }
            }

            config.config = defaultConfig;
        }
        // validate the config with requirements
        for(let sec in config.requirements) {
            if(!config.config.hasOwnProperty(sec)) {
                throw new Error(`Configuration Error: no ${ sec } is sepcified`)
            }

            let requirement = config.requirements[sec];

            let { mandatory } = requirement;

            for(let mKey of mandatory) {
                if(!config.config[sec].hasOwnProperty(mKey.key)) {
                    throw new Error(`Configuration Error: ${ sec } error: no ${ mKey.key } is specified`)
                }

                let value = config.config[sec][mKey.key];

                if(value.constructor !== mKey.type) {
                    throw new Error(`Configuration Error: ${ sec } error: ${ mKey.key } must be a ${ mKey.type.name }`);
                }
               
            }
        }
    },

    readConfig: (configFile) => {
        let conf = fs.readFileSync(configFile, "utf-8");
        return JSON.parse(stripJsonComments(conf));
    }
}



module.exports = config;
