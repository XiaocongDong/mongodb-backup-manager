import React, { Component } from 'react';
import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Header from 'components/general/header';
import Content from 'components/general/content';
import Dashboard from 'containers/dashboard';
import BackupDetails from 'containers/backup_details';
import NewConfig from 'containers/new_backup';

import dataLoader from 'api/dataLoader';
import clientSocket from 'api/socket';

import store from 'store/store';

import '../sass/style.scss';

dataLoader.loadAll();

clientSocket.startSocket();
clientSocket.startListenBackupConfigsChanges();
clientSocket.startListenCopyDBsChanges();


const PlaceHolder = ({ children, location }) => {
     return (
         <div className="mongo-backup-manager">
             <Header/>
             <Content>
                 { children }
             </Content>
         </div>
     )
};

const App = () => {
    return (
        <Provider store={ store }>
            <Router history={ hashHistory }>
                <Route path='/' component={ PlaceHolder }>
                    <IndexRoute component={ Dashboard }/>
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
