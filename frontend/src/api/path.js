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
    }

};

export default api;