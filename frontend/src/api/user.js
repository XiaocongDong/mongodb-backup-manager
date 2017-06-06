import axios from 'axios';
import api from './urlCreator';

const user = {

    login: user => {
        axios.post(
             api.userAuthPath('/create'), 
             user
        )
        ,then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error);
        })
    }
}

export default user;