#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const pkg = require( path.join(__dirname, 'package.json') );
const server = require('./dist/server');
const program = require('commander');

program.version(pkg.version)
       .option('-c, --config <config>', 'config file for mongodb backup manager')
       .parse(process.argv);

let configPath = program.config;

if(configPath != null && !fs.existsSync(configPath)) {
    throw new Error(`Import Error: ${ configPath } doesn't exist in the system`);
}

server.start(configPath);