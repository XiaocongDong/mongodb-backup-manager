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

    getIdOpts: (backupConfigs, statuses) => {
        if(statuses.length > 0) {
            backupConfigs = backupConfigs.filter(backupConfig => {
                return filter.arrayValueExists(statuses, backupConfig.status);
            });
        }

        return backupConfigs.map(backupConfig => {
           return {
               value: backupConfig.id,
               label: backupConfig.id
           }
        });
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