import axios from 'axios';
import api from './urlCreator';
import errorHandler from 'error/error_handler';


const databases = {

    getAvailableDBs: (credential) => {
        return axios.get(api.databasesPath('/availableDBs'), {
            params: credential
        })
        .catch(err => errorHandler.handleHTTPError(err));
    },

    getCopyDbs: (backupId) => {
        return axios.get(api.databasesPath('/copyDBs'), {
            params: { id: backupId }
        }).then( response => {
            return response.data;
        })
        .catch(err => errorHandler.handleHTTPError(err));
    },

    getAllCopyDbs: () => {
        return axios.get(api.databasesPath('/allCopyDBs'))
                .then(response => {
                    return response.data;
                })
                .catch(err => errorHandler.handleHTTPError(err));
    },

    getAllOriginalDBs: () => {
        return axios.get(api.databasesPath('/allOriginalDBs'))
            .then(response => {
                return response.data;
            })
            .catch(err => errorHandler.handleHTTPError(err));
    },

    getOriginalDB: (backupID) => {
        return axios.get(api.databasesPath('/originalDB'), {
                params: {id: backupID}
            })
            .then(response => {
                return response.data;
            })
            .catch(err => errorHandler.handleHTTPError(err));
    },

    deleteCopyDB: (id, db) => {
        return axios.delete(api.databasesPath('/'), {
            params: {id, db}
        })
        .catch(err => errorHandler.handleHTTPError(err));
    }
};

export default databases;
