const filter = {

    backupConfigs: (backupConfigs, filters) => {
        let ret = [];

        backupConfigs.map(backupConfig => {
            if(filter._checkBackupConfig(backupConfig, filters)) {
                ret.push(backupConfig);
            }
        });

        return ret;
    },

    _checkBackupConfig: (backupConfig, filters) => {
        if(filters.get("statuses").length > 0) {
            if(!filter.arrayValueExists(filters.get("statuses"), backupConfig.status)) {
                return false;
            }
        }

        if(filters.get("ids").length > 0) {
            if(!filter.arrayValueExists(filters.get("ids"), backupConfig.id)) {
                return false
            }
        }

        return true;
    },

    getIdOptsWithStatus: (backupConfigs, statuses) => {
        let filteredBackupConfigs = [];

        if(statuses.length > 0) {
            backupConfigs.forEach(backupConfig => {
                if(filter.arrayValueExists(statuses, backupConfig.status)) {
                    filteredBackupConfigs.push(backupConfig);
                }
            });
        }else {
            filteredBackupConfigs = backupConfigs;
        }

        let ret = [];

        filteredBackupConfigs.map(backupConfig => {
            const id = backupConfig.id;

            ret.push({
                value: id,
                label: id
            })
        });

        return ret;
    },

    arrayValueExists: (array, value) => {
        for(const i in array) {
            if(array[i].value == value) {
                return true;
            }
        }
        return false;
    }
};

export default filter;