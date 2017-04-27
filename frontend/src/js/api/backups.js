import axios from 'axios';
import api from '../utility/api';


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

    deleteBackup: (id, clearLog, clearDBs) => {
        return axios.delete(api.backupsPath('/delete'), {
            params: {
                id,
                clearLog,
                clearDBs
            }
        })
    },

    runBackup: (backupId) => {
        return axios.post(api.backupsPath('/run'), { id: backupId })
    }
};

export default backups;