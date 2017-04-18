import backups from './backups';
import databases from './databases';
import data from '../redux/action/data';
import { dispatch } from '../redux/store'


const dataLoader = {

    loadBackupConfigs: () => {
        return backups.getBackupConfigs()
                    .then(configs => {
                        dispatch({ type: data.data_set, payload: { key: "backupConfigs", value: configs }})
                    })
                    .catch(err => {
                        console.error('Failed to load the backup configs for ', err.message);
                    })
    },

    loadAllCopyDatabases: (backupId) => {
        return databases.getAllCopyDbs(backupId)
                     .then(copyDBs => {
                         dispatch({ type: data.data_set, payload: { key: "copyDBs", value: copyDBs }})
                     })
                     .catch(err => {
                         console.log(err);
                         console.error(`Failed to load ${ backupId } for ${ err.message }`);
                     })
    },

    updateBackupConfig: (backupId) => {
        return backups.getBackupConfig(backupId)
                    .then(backupConfig => {
                        dispatch({ type: data.data_update, payload: { key: "backupConfigs", value: { id: backupId, update: backupConfig}}})
                    })
                    .catch(err => {
                        console.log(err);
                        console.error(`Failed to update backup config for ${ err.message }`);
                    })
    },

    updateCopyDBs: (backupId) => {
        return databases.getCopyDbs(backupId)
                      .then(copyDbs => {
                          dispatch({ type: data.data_update, payload: { key: "copyDBs", value: { id: backupId, update: copyDbs }}})
                      })
                      .catch(err => {
                          console.log(err);
                          console.error(`Failed to update copy dbs for ${ err.message }`);
                      })
    }
};

export default dataLoader;