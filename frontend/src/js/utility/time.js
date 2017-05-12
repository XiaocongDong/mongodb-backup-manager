const timesMap = new Map();
timesMap.set("days", 24 * 60 * 60 * 1000);
timesMap.set("hours", 60 * 60 * 1000);
timesMap.set("minutes", 60 * 1000);
timesMap.set("seconds", 1000);

const time = {

    getTime: (days, hours=0, minutes=0, seconds=0) => {
        return {
            days,
            hours,
            minutes,
            seconds
        };
    },

    convertToMilliseconds: (time) => {
        let ret = 0;

        for(const k in time) {
            ret += time[k] * timesMap.get(k);
        }

        return ret;
    },

    convertToTime:(milliseconds) => {
        let remainder = milliseconds;
        let ret = {};
        timesMap.forEach((v, k) => {
            ret[k] = parseInt(remainder/v);
            remainder = remainder % v;
        });

        return ret;
    },

    getTimeStringFromMilliseconds(milliseconds) {
        const t = time.convertToTime(milliseconds);
        let ret = '';

        for(let key in t) {
            ret += `${ t[key] } ${ key }`
        }

        return ret;
    }
};

export default time;