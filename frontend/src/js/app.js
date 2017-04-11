import React, { Componet } from 'react';
import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import ReactDOM from 'react-dom';

import Header from './ui/header';
import Content from './ui/content';
import Dashboard from './ui/dashboard/dashboard';
import BackupConfigurations from './ui/backup/config/backup.configurations';

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
        <Router history={ hashHistory }>
            <Route path='/' component={ PlaceHolder }>
                <IndexRoute component={ Dashboard }/>
                <Route path='/newConfig' component={ BackupConfigurations }/>
            </Route>
        </Router>
    )
};

ReactDOM.render(<App></App>, document.getElementById('app'));
