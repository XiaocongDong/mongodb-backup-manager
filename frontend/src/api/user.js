import axios from 'axios';
import api from './urlCreator';
import localStore from 'utility/localStore';
import { hashHistory } from 'react-router';


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
            throw error.response.data
        })
    },

    logout: () => {
        return axios.post(
            api.userAuthPath('/logout'),
        )
        .then(response => {
            return response.data;
        })
        .catch(error => {
            throw error.response.data;
        })
    }
}

export default userApi;