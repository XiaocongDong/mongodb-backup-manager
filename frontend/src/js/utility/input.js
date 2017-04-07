const input = {
    integerRegEx: new RegExp(/^[0-9]*$/),

    isInteger: (data) => input.integerRegEx.exec(data) !== null,

    dataScope: {
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
        },
        maxBackupNumber: {
            min: 1
        }
    },

    isEmpty: input => {
        if(input === undefined || input === null) {
            return true;
        }

        if(typeof input == "string" || Array.isArray(input)) {
            return input.length == 0;
        }

        if(typeof input == "object") {
            return Object.keys(input).length === 0;
        }
    },

    isDisabled: input => {
        return input === null;
    },

    checkScope: (key, value) => {
        const { min, max } = input.dataScope[key];

        if(min != undefined && value < min) {
            return `${ key } must >= ${ min }`;
        }

        if(max != undefined && value > max) {
            return `${ key } must <= ${ max }`;
        }

        return null;
    },

    checkTime: (key, value) => {
        if(!input.isEmpty(value)) {
            if (!input.isInteger(value)) {
                return `${ key } must be integer`;
            } else {
                return input.checkScope(key, value);
            }
        }
    },

    validateKeys: (keys, errors, data) => {
        let validated = true;
        keys.map(key => {
            const error = input.validateKey(key, data[key]);

            errors[key] = error;
            if(!input.isEmpty(error)) {
                validated = false;
            }

        });
        return validated;
    },

    getTimeError: (time, emptyErrorMessage) => {
        const error = {};

        if(input.isDisabled(time)) {
            return error;
        }

        if(input.isEmpty(time)) {
            error.time = emptyErrorMessage;
        }else{
            for(let k in time) {
                const err = input.checkTime(k, time[k]);
                (err) && (error[k] = err);
            }
        }
        return error;
    },

    validateKey: (key, value) => {
        let error = null;
        switch (key) {
            case "server":
                if(input.isEmpty(value)) {
                    error = "server name must be specified";
                }
                break;
            case "port":
                if(input.isEmpty(value)) {
                    error = "port must be specified";
                }
                if(!input.isInteger(value)) {
                    error = 'port must be a number';
                }
                break;
            case "username":
                break;
            case "password":
                break;
            case "authDB":
                if(input.isEmpty(value)) {
                    error = "server name must be specified";
                }
                break;
            case "db":
                if(input.isEmpty(value)) {
                    error = "backup db must be specified";
                }
                break;
            case "collections":
                if(input.isEmpty(value) && !input.isDisabled(value)) {
                    error = "please specify backup collections or select backup all the db";
                }
                break;
            case "startTime":
                if(input.isEmpty(value) && !input.isDisabled(value)) {
                    error = "please specify backup startTime or select backup now";
                }

                if(!input.isEmpty(value)) {
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
            case "duration":
                error = input.getTimeError(value);
                break;
            case "maxBackupNumber":
                if(input.isDisabled(value)) {
                    break;
                }

                if(input.isEmpty(value)) {
                    error = "please specify the maximum number of the backup copy dbs or disable this option";
                    break;
                }

                if(!input.isInteger(value)) {
                    error = "maxBackup number must be an integer";
                    break;
                }

                error = input.checkScope(key, value);
                break;
            default:
                break
        }
        return error;
    }
};

export default input;