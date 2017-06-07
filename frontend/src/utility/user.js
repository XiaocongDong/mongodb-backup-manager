import store from 'store/store';


const user = {
    
    isSigned: () => {
        const user = store.getState().get('user').getIn(['user', 'name']);

        return user != null;
    },

    getUserFromLocalStorage: () => {
        const name = localStorage.getItem('user_name');

        return name;
    },

    setUserToLocalStorage: name => {
        localStorage.setItem('user_name', name);
    }
}

export default user;