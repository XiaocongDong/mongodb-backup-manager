import { createStore, applyMiddleware } from 'redux';

import reducer from 'reducers';
import middleware from './middleware';


const store = createStore(reducer, applyMiddleware(middleware.logAction));
const dispatch  = store.dispatch;

export default store;
export { dispatch };