import backups from './backups';
import data from '../redux/action/data';
import { dispatch } from '../redux/store'
import io from 'socket.io-client';


const dataLoader = {

    loadBackupConfigs: () => {
        return backups.getBackupConfigs()
                    .then(configs => {
                        dispatch({ type: data.data_set, payload: { key: "backupConfigs", value: configs }})
                    })
                    .catch(err => {
                        console.error('Failed to load the backup configs for ', err.message);
                    })
    }

};

export default dataLoader;