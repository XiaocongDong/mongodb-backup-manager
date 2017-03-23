import React, { Componet } from 'react';
import { Router, Route, browserHistory, IndexRoute, IndexRedirect } from 'react-router';
import ReactDOM from 'react-dom';

import Header from './ui/header';
import Dashboard from './ui/dashboard/dashboard';
import ConfigurationForm from './ui/backup/configuration-form';

import '../sass/style.scss';

const PlaceHolder = ({ children, location }) => {
     return (
         <div>
             <Header/>
             { children }
         </div>
     )
};

const App = () => {
    return (
        <Router history={ browserHistory }>
            <Route path='/' component={ PlaceHolder }>
                <IndexRedirect to='/dashboard'/>
                <Route path='/dashboard' component={ Dashboard }/>
                <Route path='/newConfig' component={ ConfigurationForm }/>
            </Route>
        </Router>
    )
};

ReactDOM.render(<App></App>, document.getElementById('app'));
