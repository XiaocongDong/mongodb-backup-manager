const middleware = {

    logAction: store => next => action => {
        if(__DEV__) {
            console.log(action);
        }
        next(action);
    }
};

export default middleware;