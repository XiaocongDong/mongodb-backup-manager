import axios from 'axios';
import api from './urlCreator';


const databases = {

    getAvailableDBs: (credential) => {
        return axios.get(api.databasesPath('/availableDBs'), {
            params: credential
        })
    },

    getCopyDbs: (backupId) => {
        return axios.get(api.databasesPath('/copyDBs'), {
            params: { id: backupId }
        }).then( response => {
            return response.data;
        })
    },

    getAllCopyDbs: () => {
        return axios.get(api.databasesPath('/allCopyDBs'))
                .then(response => {
                    return response.data;
                })
    },

    getAllOriginalDBs: () => {
        return axios.get(api.databasesPath('/allOriginalDBs'))
            .then(response => {
                return response.data;
            })
    },

    getOriginalDB: (backupID) => {
        return axios.get(api.databasesPath('/originalDB'), {
                params: {id: backupID}
            })
            .then(response => {
                return response.data;
            })
    },

    deleteCopyDB: (id, db) => {
        return axios.delete(api.databasesPath('/'), {
            params: {id, db}
        })
    }
};

export default databases;
