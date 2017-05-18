const middleware = {

    logAction: store => next => action => {
        console.log(action);
        next(action);
    }
};

export default middleware;