import backups from './backups';
import databases from './databases';
import logs from './logs';
import modalController from 'utility/modal';
import userUtil from 'utility/user';
import errorHandler from 'error/error_handler';
import * as userActionsCreators from 'actions/user';
import * as dataActionsCreators from 'actions/data';
import { dispatch } from 'store/store';
import { hashHistory } from 'react-router';


const dataLoader = {

    loadBackupConfigs: () => {
        return backups.getBackupConfigs()
                    .then(configs => {
                        dispatch(dataActionsCreators.setData("backupConfigs", configs))
                    })
    },

    loadAllCopyDatabases: (backupId) => {
        return databases.getAllCopyDbs(backupId)
                     .then(copyDBs => {
                         dispatch(dataActionsCreators.setData("copyDBs", copyDBs));
                     })
    },

    // loadAllRemoteDBs: () => {
    //     return databases.getAllOriginalDBs()
    //         .then(dbs => {
    //             dispatch(dataActionsCreators.setData("remoteDBs", dbs));
    //         })
    //         .catch(err => {
    //             console.error(`Failed to load all the original databases for ${ err.message }`);
    //             throw err;
    //         })
    // },

    loadLogsWithId: (id) => {
        return logs.getLogsWithId(id)
            .then(logs => {
                dispatch(dataActionsCreators.setData("logs", logs))
            })
            .catch(err => {
                errorHandler.handleHTTPError(err);
            })
    },

    updateBackupConfig: (backupId) => {
        return backups.getBackupConfig(backupId)
                    .then(backupConfig => {
                        dispatch(dataActionsCreators.updateData("backupConfigs", backupId, backupConfig))
                    })
                    .catch(err => {
                        errorHandler.handleHTTPError(err);
                    })
    },

    updateCopyDBs: (backupId) => {
        return databases.getCopyDbs(backupId)
                      .then(copyDbs => {
                          dispatch(dataActionsCreators.updateData("copyDBs", backupId, copyDbs));
                      })
                      .catch(err => {
                          errorHandler.handleHTTPError(err);
                      })
    },

    updateRemoteDB: (backupId) => {
        return databases.getOriginalDB(backupId)
            .then(originalDB => {
                dispatch(dataActionsCreators.updateData("remoteDBs", backupId, originalDB));
            })
            .catch(err => {
                errorHandler.handleHTTPError(err);
            })
    },

    updateLogs: (name) => {
        const id = name.substring(0, name.indexOf('-logs'));

        return logs.getLogsWithId(id)
            .then(logs => {
                dispatch(dataActionsCreators.updateData("logs", id, logs))
            })
            .catch(err => {
                errorHandler.handleHTTPError(err);
            })
    },

    loadAll: () => {
        const loads = [];
        loads.push(dataLoader.loadBackupConfigs());
        loads.push(dataLoader.loadAllCopyDatabases());
        // original database can only be updating manually
        //loads.push(dataLoader.loadAllRemoteDBs());

        // if the token doesn't expired login the user
        return Promise.all(loads)
                    .then(() => {
                        const name = userUtil.getUserFromLocalStorage();
                        dispatch(dataActionsCreators.setData("loaded", true))
                        // set the user
                        if(name != null) {
                            dispatch(userActionsCreators.setUser({name}))
                        }        
                    })
                    .catch(error => {
                        errorHandler.handleHTTPError(error);
                    });
    }
};

export default dataLoader;