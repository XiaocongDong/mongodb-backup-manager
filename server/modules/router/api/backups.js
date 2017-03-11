const express = require('express');

const backups = express.Router();

backups.post('/create', (req, res, next) => {
    res.send("Created a new backup manager");
});

module.exports = backups;