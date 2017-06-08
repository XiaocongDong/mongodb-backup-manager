import store from 'store/store';
import localStore from 'utility/localStore';


const user = {
    
    userExists: () => {
        const name = user.getUserFromLocalStorage();

        return name != null;
    },

    getUserFromLocalStorage: () => {
        const name = localStore.getItem('user_name');

        return name;
    },

    setUserToLocalStorage: name => {
        localStore.setItem('user_name', name);
    }
}

export default user;