import axios from 'axios';
import api from '../utility/api';


const backups = {

    newBackupConfig: (backupConfig) => {
        return axios.post(api.backupsPath('/create'), backupConfig)
    }

};

export default backups;