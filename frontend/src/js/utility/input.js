const input = {
    integerRegEx: new RegExp(/^[0-9]*$/),

    isInteger: (data) => input.integerRegEx.exec(data) !== null,

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
        if(!input.isEmpty(value)) {
            if (!input.isInteger(value)) {
                return `${ key } must be integer`;
            } else {
                const { min, max } = input.timeScope[key];
                return input.checkScope(key, value, min, max);
            }
        }
    },

    validateKeys: (keys, errors, data) => {
        let validated = true;
        keys.map(key => {
            const error = input.validateKey(key, data[key]);
            errors[key] = error;
            if(!input.isEmpty(error) && typeof input !== "object") {
                validated = false;
            }

            if(typeof input === "object") {
                for(const k in error) {
                    if(!input.isEmpty(error[k])) {
                        validated = false;
                    }
                }
            }
        });
        return validated;
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
                if(input.isDisabled(value)){
                    error = {
                        days: null,
                        hours: null,
                        minutes: null,
                        seconds: null
                    };
                    break;
                }

                if(input.isEmpty(value)) {
                    error ={
                        error: "please specify backup interval time or select backup once"
                    };
                }else{
                    error = {};
                    for(let k in value) {
                        error[k] = input.checkTime(k, value[k]);
                    }
                }
                break;
            case "duration":
                if(input.isDisabled(value)) {
                    error = {
                        days: null,
                        hours: null,
                        minutes: null,
                        seconds: null
                    };
                    break;
                }
                if(input.isEmpty(value)) {
                    error = {
                        error: "please specify the duration time of backup copy db or disable this option"
                    };
                }else{
                    error = {};
                    for(let k in value) {
                        error[k] = input.checkTime(k, value[k]);
                    }
                }
                break;
            case "maxBackupNumber":
                console.log(value);
                if(input.isEmpty(value) && !input.isDisabled(value)) {
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

export default input;