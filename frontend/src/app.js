import React, { Componet } from 'react';

import './static/sass/style.scss';

import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Dashboard from 'containers/Dashboard';
import BackupDetails from 'containers/BackupDetails';
import NewConfig from 'containers/NewBackup';
import Loading from 'containers/Loading';
import Login from 'containers/Login';
import PlaceHolder from 'containers/App'

import dataLoader from 'api/dataLoader';
import clientSocket from 'api/socket';
import userUtil from 'utility/user';

import store from 'store/store';
import user from 'utility/user';

if(userUtil.userExists()) {
    dataLoader.loadAll();
}else {
    // redirect to the sign_in page
    hashHistory.push('/sign_in');
}

clientSocket.startSocket();
clientSocket.startListenBackupConfigsChanges();
clientSocket.startListenCopyDBsChanges();

const App = () => {
    return (
        <Provider store={ store }>
            <Router history={ hashHistory }>
                <Route path='/' component={ PlaceHolder }>
                    <IndexRoute component={ Dashboard }/>
                    <Route path='/sign_in' component={ Login }/>
                    <Route path='/newConfig' component={ NewConfig }/>
                    <Route path='/backups'>
                        <Route path='/backups/:backupId' component={ BackupDetails }/>
                    </Route>
                </Route>
            </Router>
        </Provider>
    )
};

ReactDOM.render(<App></App>, document.getElementById('app'));
