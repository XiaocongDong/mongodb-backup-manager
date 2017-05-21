import timeUtil from './time';
import object from './object';
import input from './input';


const backupConfig = {

    credentialKeys: ["server", "port", "username", "password", "authDB"],
    configKeys: ["db", "collections", "startTime", "interval", "maxBackupNumber", "duration"],
    requiredKeys: ["server", "port", "authDB", "db", "collections"],
    uiKeys: {
        server: "server",
        port: "port",
        username: "username",
        password: "password",
        authDB: "authentication database",
        db: "backup database",
        collections: "backup collections",
        startTime: "backup start time",
        interval: "backup interval",
        maxBackupNumber: "maximum copy databases",
        duration: "existing time for copy database"
    },

    getInitBackupConfig: () => {
        return {
            server: 'localhost',
            port: 27017,
            authDB: 'admin',
            db: undefined,
            collections: undefined,
            startTime: null,
            interval: timeUtil.getTime(1, 0, 0, 0),
            maxBackupNumber: 7,
            duration: timeUtil.getTime(1, 0, 0, 0)
        }
    },

    prepareReviewBackupConfig: (inputBackupConfig) => {
        const reviewKeys = backupConfig.credentialKeys.concat(backupConfig.configKeys);
        const ret = object.cloneWithKeysFilter(inputBackupConfig, reviewKeys);

        for(const key of backupConfig.configKeys) {
            if(!ret.hasOwnProperty(key)) {
                ret[key] = null;
            }

            if((key === 'duration' || key === 'interval') && (!input.isEmpty(ret[key]))) {
                ret[key] = timeUtil.convertToTime(ret[key]);
            }
        }

        return ret;
    }
};

export default backupConfig;