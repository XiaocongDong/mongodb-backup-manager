import backups from './backups';
import databases from './databases';
import { dataActionBuilder } from '../redux/action/dataAction';
import { dispatch } from '../redux/store'


const dataLoader = {

    loadBackupConfigs: () => {
        return backups.getBackupConfigs()
                    .then(configs => {
                        dispatch(dataActionBuilder.set_data("backupConfigs", configs))
                    })
                    .catch(err => {
                        console.error(err);
                        console.error('Failed to load the backup configs for ', err.message);
                    })
    },

    loadAllCopyDatabases: (backupId) => {
        return databases.getAllCopyDbs(backupId)
                     .then(copyDBs => {
                         dispatch(dataActionBuilder.set_data("copyDBs", copyDBs));
                     })
                     .catch(err => {
                         console.log(err);
                         console.error(`Failed to load ${ backupId } for ${ err.message }`);
                     })
    },

    loadAllOriginalDatabases: () => {
        return databases.getAllOriginalDBs()
            .then(dbs => {
                dispatch(dataActionBuilder.set_data("originalDBs", dbs));
            })
            .catch(err => {
                console.error(`Failed to load all the original databases for ${ err.message }`);
            })
    },

    updateBackupConfig: (backupId) => {
        return backups.getBackupConfig(backupId)
                    .then(backupConfig => {
                        dispatch(dataActionBuilder.update_data("backupConfigs", backupId, backupConfig))
                    })
                    .catch(err => {
                        console.error(`Failed to update backup config for ${ err.message }`);
                    })
    },

    updateCopyDBs: (backupId) => {
        return databases.getCopyDbs(backupId)
                      .then(copyDbs => {
                          dispatch(dataActionBuilder.update_data("copyDBs", backupId, copyDbs));
                      })
                      .catch(err => {
                          console.log(err);
                          console.error(`Failed to update copy dbs for ${ err.message }`);
                      })
    },

    updateOriginalDBs: (backupId) => {
        return databases.getOriginalDB(backupId)
            .then(originalDB => {
                dispatch(dataActionBuilder.update_data("originalDBs", backupId, originalDB));
            })
            .catch(err => {
                console.error(`Failed to update original database for ${ backupId } for ${ err.message }`);
            })
    }
};

export default dataLoader;