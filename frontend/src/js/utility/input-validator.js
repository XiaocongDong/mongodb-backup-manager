const inputValidator = {
    integerRegEx: new RegExp(/^[0-9]*$/),

    isInteger: (data) => inputValidator.integerRegEx.exec(data) !== null,

    timeScope: {
        days: {
            min: 0
        },
        hours: {
            min: 0,
            max: 24
        },
        minutes: {
            min: 0,
            max: 60
        },
        seconds: {
            min: 0,
            max: 60
        }
    },

    isEmpty: input => {
        if(input === undefined || input === null) {
            return true;
        }

        if(typeof input == "string" || Array.isArray(input)) {
            return input.length == 0;
        }
    },

    isDisabled: input => {
        return input === null;
    },

    checkScope: (key, value, min, max) => {

        if(min != undefined && value < min) {
            return `${ key } must >= ${ min }`;
        }

        if(max != undefined && value > max) {
            return `${ key } must <= ${ max }`;
        }

        return null;
    },

    checkTime: (key, value) => {
        if(!inputValidator.isEmpty(value)) {
            if (!inputValidator.isInteger(value)) {
                return `${ key } must be integer`;
            } else {
                const { min, max } = inputValidator.timeScope[key];
                return inputValidator.checkScope(key, value, min, max);
            }
        }
    },

    validate: (key, value) => {
        let error = null;
        switch (key) {
            case "server":
                if(inputValidator.isEmpty(value)) {
                    error = "server name must be specified";
                }
                break;
            case "port":
                if(inputValidator.isEmpty(value)) {
                    error = "port must be specified";
                }
                if(!inputValidator.isInteger(value)) {
                    error = 'port must be a number';
                }
                break;
            case "username":
                break;
            case "password":
                break;
            case "authDB":
                if(inputValidator.isEmpty(value)) {
                    error = "server name must be specified";
                }
                break;
            case "db":
                if(inputValidator.isEmpty(value)) {
                    error = "backup db must be specified";
                }
                break;
            case "collections":
                if(inputValidator.isEmpty(value) && !inputValidator.isDisabled(value)) {
                    error = "please specify backup collections or select backup all the db";
                }
                break;
            case "startTime":
                if(inputValidator.isEmpty(value) && !inputValidator.isDisabled(value)) {
                    error = "please specify backup startTime or select backup now";
                }

                if(!inputValidator.isEmpty(value)) {
                    const date = Date.parse(value);
                    const now = new Date().valueOf();
                    if(isNaN(date)) {
                        error = "invalid time";
                    }else{
                        if(now > date) {
                            error = "start time must be later than current time";
                        }
                    }
                }

                break;
            case "interval":
                if(inputValidator.isDisabled(value)){
                    error = {
                        days: null,
                        hours: null,
                        minutes: null,
                        seconds: null
                    };
                    break;
                }

                if(inputValidator.isEmpty(value)) {
                    error ={
                        error: "please specify backup interval time or select backup once"
                    };
                }else{
                    error = {};
                    for(let k in value) {
                        error[k] = inputValidator.checkTime(k, value[k]);
                    }
                }
                break;
            case "duration":
                if(inputValidator.isDisabled(value)) {
                    error = {
                        days: null,
                        hours: null,
                        minutes: null,
                        seconds: null
                    };
                    break;
                }
                if(inputValidator.isEmpty(value)) {
                    error = {
                        error: "please specify the duration time of backup copy db or disable this option"
                    };
                }else{
                    error = {};
                    for(let k in value) {
                        error[k] = inputValidator.checkTime(k, value[k]);
                    }
                }
                break;
            case "maxBackupNumber":
                console.log(value);
                if(inputValidator.isEmpty(value) && !inputValidator.isDisabled(value)) {
                    error = "please specify the maximum number of the backup copy dbs or disable this option";
                    console.log("err");
                }
                break;
            default:
                break
        }
        return error;
    }
};

export default inputValidator;