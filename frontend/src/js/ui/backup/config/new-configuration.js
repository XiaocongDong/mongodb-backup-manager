import React, { Component } from 'react';

import CredentialForm from './credential-form';
import BackupConfiguration from './configuration-form';
import Review from './review';


export default class NewConfiguration extends Component {

    constructor(props) {
        super(props);
        this.state = { step: 0 };
        this.totalStep = 3;
        this.backupConfiguration = {
            server: 'localhost',
            port: 27017,
            authDB: 'admin'
        };
        this.userSelections = {
            collectionsDisabled: false,
            backupNow: false
        };
        this.availableDBsCollections = [
            {
                "db": "osdna",
                "collections": [
                    "links",
                    "clique_constraints",
                    "clique_types",
                    "scans",
                    "inventory",
                    "cliques",
                    "constants",
                    "environments_config",
                    "environment_config",
                    "Mirantis-Liberty-UT",
                    "meteor_accounts_loginServiceConfiguration",
                    "users",
                    "messages",
                    "monitoring_config_templates"
                ]
            },
            {
                "db": "test",
                "collections": [
                    "organizations",
                    "fiscal_years",
                    "main",
                    "country_info"
                ]
            }
        ];
        this.authenticate = this.authenticate.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleGoBack = this.handleGoBack.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.saveData = this.saveData.bind(this);
    }

    authenticate(credential) {
        console.log('Authenticating the server');
        this.handleNext();
    }

    handleClose() {
        // close the new configuration section

    }

    handleGoBack() {
        // from the backup configuration form back to the authentication form
        this.setState({
            step: this.state.step - 1
        })
    }

    handleNext() {
        // next form
        this.setState({
            step: this.state.step + 1
        })
    }

    handleSubmit() {
        // submit the backup config
    }

    saveData(config, userSelections) {
        (config) && (Object.assign(this.backupConfiguration, config));
        (userSelections) && (Object.assign(this.userSelections, userSelections));
    }

    render() {
        const step = this.state.step;
        console.log(step);

        const formsDOM = [];
        formsDOM.push(<CredentialForm authenticate = { this.authenticate }
                                      backupConfig = { this.backupConfiguration }
                                      saveData = { this.saveData }
        />);

        formsDOM.push(<BackupConfiguration onClickBack = { this.handleGoBack }
                                           onClickNext = { this.handleNext }
                                           availableDBsCollections = { this.availableDBsCollections}
                                           backupConfig = { this.backupConfiguration }
                                           userSelections = { this.userSelections }
                                           saveData = { this.saveData }
        />);
        formsDOM.push(<Review onClickBack = { this.handleGoBack }
                              onClickSubmit = { this.handleSubmit } />);

        return (
            <div className="container">
                <div className="progress">
                    <div className="bar-wrapper">
                        <div className="bar" style={ { width: ((step +1)/this.totalStep) * 100 + '%' } }></div>
                    </div>
                </div>
                { formsDOM[step] }
            </div>
        )
    }
}
