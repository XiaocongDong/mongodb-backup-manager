const express = require('express');
const path = require('path');

const publicPath = express.static(path.join(__dirname, '../dist'));
const indexFile = path.join(__dirname, '../dist/index.html');

module.exports = {
    publicPath,
    indexFile
};