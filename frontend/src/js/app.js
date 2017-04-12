import React, { Componet } from 'react';
import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Header from './ui/header';
import Content from './ui/content';
import Dashboard from './ui/dashboard/dashboard';
import BackupConfigurations from './ui/backup/config/backup.configurations';

import store from './redux/store';

import '../sass/style.scss';

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
                    <Route path='/newConfig' component={ BackupConfigurations }/>
                </Route>
            </Router>
        </Provider>
    )
};

ReactDOM.render(<App></App>, document.getElementById('app'));
