#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const pkg = require( path.join(__dirname, 'package.json') );
const server = require('./dist/server');
const program = require('commander');

program.version(pkg.version)
       .option('-c --config <config>', 'config file for mongodb backup manager')
       .option('-p --serverPort <serverPort>', 'mongodb backup manager port number', parseInt)
       .option('-i --interval <interval>', 'interval for task pool scanning', parseInt)
       .option('--dbServer <dbServer>', 'local database server address')
       .option('--dbPort <dbPort>', 'local database server port number', parseInt)
       .option('--username <username>', 'username for local database')
       .option('--password <password>', 'password for local database')
       .option('--authDB <authDB>', 'authentication DB for local database')
       .option('--log <logLevel>', 'log level for the system')
       .parse(process.argv);

let options = ["config", "serverPort", "interval", "dbServer", "dbPort", "username", "password", "authDB", "log"]
let managerConfig = {};

for(let opt of options) {
    let o = program[opt];

    if(o != null) {
        managerConfig[opt] = o;
    }
}

server.start(managerConfig);