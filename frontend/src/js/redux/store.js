import { createStore, applyMiddleware } from 'redux';

import appReducer from './reducer/app';
import middleware from '../utility/middleware';


const store = createStore(appReducer, applyMiddleware(middleware.logAction));
const dispatch  = store.dispatch;

export default store;
export { dispatch };