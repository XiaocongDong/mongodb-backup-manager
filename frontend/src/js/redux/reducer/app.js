import { combineReducers } from 'redux-immutable';
import filters from './filters';


const appReducer = combineReducers(
    {
        filters,
    }
);

export default appReducer;