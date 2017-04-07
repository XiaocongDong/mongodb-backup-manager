import timeUtil from './time';
import object from './object';

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
            maxBackupNumber: 1,
            duration: timeUtil.getTime(1, 0, 0, 0)
        }
    },

    getBackupConfigFromInput: (inputBackupConfig) => {
        const ret = object.clone(inputBackupConfig);

        for(const key of backupConfig.configKeys) {
            if(!ret.hasOwnProperty(key)) {
                ret[key] = null;
            }
        }

        return ret;
    }
};

export default backupConfig;