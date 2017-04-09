import axios from 'axios';
import api from '../utility/api';


const databases = {

    getAvailableDBs: (credential) => {
        return  axios.get(api.databasesPath('/availableDBs'), {
            params: credential
        })
    }

};

export default databases;
