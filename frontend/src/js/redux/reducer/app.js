import { combineReducers } from 'redux-immutable';
import data from './data';
import filters from './filters';


const appReducer = combineReducers(
    {
        data,
        filters,
    }
);

export default appReducer;