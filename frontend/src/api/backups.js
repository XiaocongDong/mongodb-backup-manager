import axios from 'axios';
import api from './urlCreator';


const backups = {

    newBackupConfig: (backupConfig) => {
        return axios.post(api.backupsPath('/create'), backupConfig)
    },

    getBackupConfigs: () => {
        return axios.get(api.backupsPath('/configs'))
            .then(response => {
                return response.data;
            })
    },

    getBackupConfig: (backupId) => {
       return axios.get(api.backupsPath('/config'), {
           params: { id: backupId }
       }).then(response => {
           return response.data
       })
    },

    stopBackup: (backupId) => {
        return axios.post(api.backupsPath('/stop'), { id: backupId });
    },

    resumeBackup: (backupId) => {
        return axios.post(api.backupsPath('/resume'), { id: backupId });
    },

    restore: (backupId, db, collections) => {
        return axios.post(api.backupsPath('/restore'), { id: backupId, db, collections });
    },

    deleteBackup: (id) => {
        return axios.delete(api.backupsPath('/delete'), {
            params: { id }
        })
    },

    runBackup: (backupId) => {
        return axios.post(api.backupsPath('/run'), { id: backupId })
    }
};

export default backups;