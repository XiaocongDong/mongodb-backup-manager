const response = require('modules/helper/response');

const responseHandler = (data, req, res, next) => {
    //console.log(data);
    response.send(res, data);
};

module.exports = responseHandler;