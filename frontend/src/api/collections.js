import axios from 'axios';
import api from './path';


const collections = {

    getDataFromCollection: (id, db, collection) => {
        return axios.get(api.collectionsPath('/data'), {
            params: {
                id,
                db,
                collection
            }})
            .then(response => response.data);
    }

};

export default collections;