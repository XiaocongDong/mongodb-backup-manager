import backups from './backups';
import databases from './databases';
import * as dataActionsCreators from 'actions/data';
import { dispatch } from 'store/store'


const dataLoader = {

    loadBackupConfigs: () => {
        return backups.getBackupConfigs()
                    .then(configs => {
                        dispatch(dataActionsCreators.setData("backupConfigs", configs))
                    })
                    .catch(err => {
                        console.error(err);
                        console.error('Failed to load the backup configs for ', err.message);
                    })
    },

    loadAllCopyDatabases: (backupId) => {
        return databases.getAllCopyDbs(backupId)
                     .then(copyDBs => {
                         dispatch(dataActionsCreators.setData("copyDBs", copyDBs));
                     })
                     .catch(err => {
                         console.log(err);
                         console.error(`Failed to load ${ backupId } for ${ err.message }`);
                     })
    },

    loadAllRemoteDBs: () => {
        return databases.getAllOriginalDBs()
            .then(dbs => {
                dispatch(dataActionsCreators.setData("remoteDBs", dbs));
            })
            .catch(err => {
                console.error(`Failed to load all the original databases for ${ err.message }`);
            })
    },

    updateBackupConfig: (backupId) => {
        return backups.getBackupConfig(backupId)
                    .then(backupConfig => {
                        dispatch(dataActionsCreators.updateData("backupConfigs", backupId, backupConfig))
                    })
                    .catch(err => {
                        console.error(`Failed to update backup config for ${ err.message }`);
                    })
    },

    updateCopyDBs: (backupId) => {
        return databases.getCopyDbs(backupId)
                      .then(copyDbs => {
                          dispatch(dataActionsCreators.updateData("copyDBs", backupId, copyDbs));
                      })
                      .catch(err => {
                          console.log(err);
                          console.error(`Failed to update copy dbs for ${ err.message }`);
                      })
    },

    updateRemoteDB: (backupId) => {
        return databases.getOriginalDB(backupId)
            .then(originalDB => {
                dispatch(dataActionsCreators.updateData("remoteDBs", backupId, originalDB));
            })
            .catch(err => {
                console.error(`Failed to update original database for ${ backupId } for ${ err.message }`);
            })
    },

    loadAll: () => {
        const loads = [];
        loads.push(dataLoader.loadBackupConfigs());
        loads.push(dataLoader.loadAllCopyDatabases());
        // original database can only be updating manually
        //loads.push(dataLoader.loadAllRemoteDBs());

        return Promise.all(loads);
    },

    updateWithBackupID: (backupID) => {
        const updates = [];
        updates.push(dataLoader.updateBackupConfig(backupID));
        updates.push(dataLoader.updateCopyDBs(backupID));
        updates.push(dataLoader.updateRemoteDB(backupID));

        return Promise.all(updates);
    }
};

export default dataLoader;