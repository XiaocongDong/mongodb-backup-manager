const api = {

    backupsPath: (action) => {
        let prefix = "api/backups";

        return prefix + action;
    },

    databasesPath: (action) => {
        let prefix = "api/databases";

        return prefix + action;
    },

    collectionsPath: (action) => {
        let prefix = "api/collections";

        return prefix + action;
    },

    logsPath: (action) => {
        let prefix = "api/logs";

        return prefix + action;
    },

    userAuthPath: (action) => {
        let prefix = "user/auth";

        return prefix + action;
    },

    userOperationPath: (action) => {
        let prefix = "user/operation";

        return prefix + action;
    }
};

export default api;