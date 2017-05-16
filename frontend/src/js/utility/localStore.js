const localStore = {

    getItem: (key) => {
        let value;
        try {
            value = localStorage.getItem(key);
        } catch(e) {
            if(__DEV__) {
                console.error('localStorage get item error', e.message);
            }
        }

        if(value != null) {
            value = JSON.parse(value);
        }
        return value;
    },

    setItem: (key, value) => {
        try {
            value = JSON.stringify(value);
            localStorage.setItem(key, value);
        } catch (e) {
            if(__DEV__) {
                console.error('localStorage set item error', e.message);
            }
        }
    }
};

export default localStore;