import store from 'store/store';
import localStore from 'utility/localStore';


const user = {
    
    isSigned: () => {
        const user = store.getState().get('user').getIn(['user', 'name']);

        return user != null;
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