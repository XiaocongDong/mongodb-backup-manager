import axios from 'axios';
import api from './urlCreator';
import errorHandler from 'error/error_handler';


const backups = {

    newBackupConfig: (backupConfig) => {
        return axios.post(api.backupsPath('/create'), backupConfig)
                    .catch(error => {
                        errorHandler.handleHTTPError(error);
                    })
    },

    getBackupConfigs: () => {
        return axios.get(api.backupsPath('/configs'))
            .then(response => {
                return response.data;
            })
            .catch(error => {
                errorHandler.handleHTTPError(error);
            })
    },

    getBackupConfig: (backupId) => {
       return axios.get(api.backupsPath('/config'), {
           params: { id: backupId }
       }).then(response => {
           return response.data
       })
       .catch(error => {
            errorHandler.handleHTTPError(error);
       })
    },

    stopBackup: (backupId) => {
        return axios.post(api.backupsPath('/stop'), { id: backupId })
                    .catch(error => {
                        errorHandler.handleHTTPError(error);
                    });
    },

    resumeBackup: (backupId) => {
        return axios.post(api.backupsPath('/resume'), { id: backupId })
                    .catch(error => {
                        errorHandler.handleHTTPError(error);
                    });
    },

    updateBackup: (backupId, updates) => {
        return axios.patch(api.backupsPath('/update'), { id: backupId, updates })
                    .catch(error => {
                        errorHandler.handleHTTPError(error);
                    })
    },

    restore: (backupId, db, collections) => {
        return axios.post(api.backupsPath('/restore'), { id: backupId, db, collections })
                    .catch(error => {
                        errorHandler.handleHTTPError(error);
                    });
    },

    deleteBackup: (id) => {
        return axios.delete(api.backupsPath('/delete'), {
            params: { id }
        })
        .catch(error => {
            errorHandler.handleHTTPError(error);
        })
    },

    runBackup: (backupId) => {
        return axios.post(api.backupsPath('/run'), { id: backupId })
                    .catch(error => {
                        errorHandler.handleHTTPError(error);
                    })
    }
};

export default backups;