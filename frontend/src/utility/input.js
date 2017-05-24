import timeUtil from "./time";
import backupConfigUtil from './backupConfig';

const input = {
    integerRegEx: new RegExp(/^[0-9]*$/),

    isInteger: (data) => input.integerRegEx.exec(data) !== null,

    dataScope: {
        days: {
            min: 0
        },
        hours: {
            min: 0,
            max: 23
        },
        minutes: {
            min: 0,
            max: 59
        },
        seconds: {
            min: 0,
            max: 59
        },
        maxBackupNumber: {
            min: 1
        },
        interval: {
            min: 1
        },
        duration: {
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
            return -1;
        }

        if(max != undefined && value > max) {
            return 1;
        }

        return 0;
    },

    checkTime: (key, value) => {
        if(!input.isEmpty(value)) {
            if (!input.isInteger(value)) {
                return `${ key } must be integer`;
            }

            const result = input.checkScope(key, value);
            if(result > 0) {
                return `${ key } must be smaller than ${ input.dataScope[key].max }`;
            }

            if(result < 0) {
                return `${ key } must be larger than ${ input.dataScope[key].min }`;
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

    getTimeError: (key, time) => {
        const error = {};

        if(input.isDisabled(time)) {
            return error;
        }

        for(let k in time) {
            const err = input.checkTime(k, time[k]);
            (err) && (error[k] = err);
        }

        if(input.isEmpty(error)) {
            const t = timeUtil.convertToMilliseconds(time);
            const result = input.checkScope(key, t);
            (result < 0) && (error.time = `time must be larger than 0`);
        }

        return error;
    },

    validateKey: (key, value) => {
        let error = null;
        if(backupConfigUtil.requiredKeys.includes(key) &&
            input.isEmpty(value) &&
            !input.isDisabled(value)) {
            error = `${ key } must be specified`;
        }
        switch (key) {
            case "port":
                if(!input.isInteger(value)) {
                    error = 'port must be a number';
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
                error = input.getTimeError(key, value);
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

                const result = input.checkScope(key, value);
                (result > 0) && (error = `${ key } must be smaller than ${ input.dataScope[key].max }`);
                (result < 0) && (error = `${ key } must be larger than ${ input.dataScope[key].min }`);
                break;
            default:
                break
        }
        return error;
    },
};

export default input;