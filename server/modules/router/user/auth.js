const express = require('express');
const auth = express.Router();
const userController = require('modules/controller/user');


auth.post('/login', (req, res, next) => {
    const user = req.body;
    
    userController.validateUser(user, req, res, next);
})

auth.post('/logout', (req, res, next) => {
    const token = req.cookies.token;

    userController.logoutUser(token, req, res, next);
})

module.exports = auth;
