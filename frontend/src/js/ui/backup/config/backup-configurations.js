import React, { Component } from 'react';
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import CredentialForm from './credential-form';
import BackupConfiguration from './configuration-form';
import Review from './review';
import object from '../../../utility/object';


export default class BackConfigurations extends Component {

    constructor(props) {
        super(props);
        this.totalSteps = 3;
        this.state = {
            update: (props.backupConfiguration? true: false),
            review: (props.review == true),
            step: (props.review? 3: 0)
        };
        this.backupConfiguration = (props.backupConfiguration) || ({
                server: 'localhost',
                port: 27017,
                authDB: 'admin'
        });
        // testing data
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
    }

    handleGoBack() {
        this.setState({
            step: this.state.step - 1
        })
    }

    handleNext() {
        // TODO check if the data is correct
        // next form
        this.setState({
            step: this.state.step + 1
        })
    }

    handleSubmit() {
        // submit the backup config
    }

    handleChange(keys, value) {
        object.assign(keys, value, this.backupConfiguration);
    }

    render() {
        const step = this.state.step;
        const totalStep = this.totalSteps;

        const stagesDOM = [];
        for(let i = 0; i < totalStep; i++) {
            stagesDOM.push(<div className={ "step" + (i == step?" current": (i > step?" pending": " past")) } key={ i }>{ i < step? '': i + 1 }</div>)
        }

        const formsDOM = [];

        const credentialForm = <CredentialForm  backupConfig = { this.backupConfiguration }
                                                handleChange = { this.handleChange.bind(this) }
                                                onClickNext = { this.handleNext.bind(this) }/>;
        formsDOM.push(credentialForm);

        const backupConfigForm = <BackupConfiguration availableDBsCollections = { this.availableDBsCollections }
                                                      onClickNext = { this.handleNext.bind(this) }
                                                      onClickBack = { this.handleGoBack.bind(this) }
                                                      backupConfig = { this.backupConfiguration }
                                                      handleChange = { this.handleChange.bind(this) }
                                                      review = { this.review }/>;
        formsDOM.push(backupConfigForm);

        const reviewForm = <Review backupConfig = { this.backupConfiguration }
                                   onClickBack = { this.handleGoBack.bind(this) }
                                   onClickSubmit = { this.handleSubmit.bind(this)}/>;
        formsDOM.push(reviewForm);

        return (
            <div className="container">
                <div className="header">
                    <div className="title">
                        {
                            (this.review)?(`Backup Config for ${ this.backupConfiguration.db } @ ${ this.backupConfiguration.server }`):
                                ((this.update)?(`Update BackupConfig for ${ this.backupConfiguration.db } @ ${ this.backupConfiguration.server }`):
                                "New Backup Config")
                        }
                    </div>
                </div>
                {
                    (!this.review) && (
                    <div className="progress">
                        <div className="stages">
                            { stagesDOM }
                        </div>
                        <div className="bar-wrapper">
                            <div className="bar" style={ {width: (step)/(totalStep - 1) * 100 + "%" } }></div>
                        </div>
                    </div>)
                }
                { formsDOM[step] }
            </div>
        )
    }
}
