//react
import React, { Component } from 'react';
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

//ui
import CredentialForm from './credential.form';
import BackupConfiguration from './configuration.form';
import Review from './review.form';

//utility
import object from '../../../utility/object';
import backupConfigUtil from '../../../utility/backupConfig';


export default class BackConfigurations extends Component {

    constructor(props) {
        super(props);
        this.totalSteps = 3;
        this.state = {
            update: (props.backupConfig? true: false),
            review: (props.review == true),
            step: (props.review? 3: 0),
            backupConfig: (props.backupConfig) || backupConfigUtil.getInitBackupConfig()
        };
        // testing data
        this.dbsColls = [
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

    handleBack() {
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

    handleConfigChange(changes) {
        const backupConfig = object.clone(this.state.backupConfig);
        for(let key in changes) {
            backupConfig[key] = changes[key];
        }
        this.setState({ backupConfig });
    }

    render() {
        const { step, backupConfig, update, review } = this.state;
        const totalStep = this.totalSteps;
        const stagesDOM = [];
        for(let i = 0; i < totalStep; i++) {
            stagesDOM.push(<div className={ "step" + (i == step?" current": (i > step?" pending": " past")) } key={ i }>{ i < step? '': i + 1 }</div>)
        }

        const formsDOM = [];

        const credentialForm = <CredentialForm  backupConfig = { backupConfig }
                                                handleConfigChange = { this.handleConfigChange.bind(this) }
                                                handleNext = { this.handleNext.bind(this) }/>;
        formsDOM.push(credentialForm);

        const backupConfigForm = <BackupConfiguration dbsColls = { this.dbsColls }
                                                      handleNext = { this.handleNext.bind(this) }
                                                      handleBack = { this.handleBack.bind(this) }
                                                      backupConfig = { backupConfig }
                                                      handleConfigChange = { this.handleConfigChange.bind(this) }
                                                      review = { review }/>;
        formsDOM.push(backupConfigForm);

        const reviewForm = <Review backupConfig = { backupConfig }
                                   handleBack = { this.handleBack.bind(this) }/>;
        formsDOM.push(reviewForm);

        return (
            <div className="container">
                <div className="header">
                    <div className="title">
                        {
                            review?(`Backup Config for ${ backupConfig.db } @ ${ backupConfig.server }`):
                                update?(`Update BackupConfig for ${ backupConfig.db } @ ${ backupConfig.server }`):
                                "New Backup Config"
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
