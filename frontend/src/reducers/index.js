import { combineReducers } from 'redux-immutable';
import data from './data';
import filters from './filters';
import user from './user';


const rootReducer = combineReducers(
    {
        data,
        filters,
        user
    }
);

export default rootReducer;