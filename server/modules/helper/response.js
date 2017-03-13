const response = {
    error: (body = 'Error occurred.', code = 400) => {
        if(typeof body === 'object') {
            return {
                body: body,
                code: code
            };
        } else {
            return {
                body: {
                    message: body
                },
                code: code
            };
        }
    },
    success: (body = '', code = 200) => {
        if(typeof body === 'object') {
            return {
                body: body,
                code: code
            };
        } else if(!body) {
            return { code: code };
        } else {
            return {
                body: {
                    message: body
                },
                code: code
            };
        }
    },
    send: (res, data) => {
        res.status(data.code).send(data.body);
    }
};

module.exports = response;
