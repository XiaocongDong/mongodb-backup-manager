import axios from 'axios';
import api from './urlCreator';
import errorHandler from 'error/error_handler';


const collections = {

    getDataFromCollection: (id, db, collection) => {
        return axios.get(api.collectionsPath('/data'), {
            params: {
                id,
                db,
                collection
            }})
            .then(response => response.data)
            .catch(err => errorHandler.handleHTTPError(err));
    }

};

export default collections;