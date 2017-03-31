const inputValidator = {
    integerRegEx: new RegExp(/^[0-9]*$/),

    isInteger: (data) => inputValidator.integerRegEx.exec(data) !== null,

    isEmpty: input => input.length == 0,

    checkScope: (value, min, max) => {

        if(min != undefined && value < min) {
            return -1;
        }

        if(max != undefined && value > max) {
            return 1;
        }

        return 0;
    }
};

export default inputValidator;