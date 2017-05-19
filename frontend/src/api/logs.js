import axios from 'axios';
import api from './urlCreator';


const logs = {

    getLogsWithId: (id) => {
        return axios.get(api.logsPath(''), {
            params: {
                id
            }})
            .then(response => response.data);
    }

};

export default logs;