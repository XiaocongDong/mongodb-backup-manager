import { hashHistory } from 'react-router';
import localStore from 'utility/localStore';
import * as userActions from 'actions/user';
import { dispatch } from 'store/store';


const errorHandler = {

    handleHTTPError: error => {
        if(__DEV__) {
            console.error(error);
        }

        const status = error.response.status;

        // authentication failed, jump to the login page
        if(status == 401) {
            let currentLocation = hashHistory.getCurrentLocation().pathname;
            if(currentLocation!=null && currentLocation != '/sign_in') {
                dispatch(userActions.setUser({}));
                localStore.setItem('currentLocation', currentLocation);    
            }                     
            hashHistory.push('/sign_in');
        }

        // need to throw the error back for handling
        throw error;
    }

}

export default errorHandler;