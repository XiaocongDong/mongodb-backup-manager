import axios from 'axios';
import api from './urlCreator';

const userApi = {

    login: user => {
        return axios.post(
             api.userAuthPath('/login'), 
             user
        )
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error);
        })
    }
}

export default userApi;