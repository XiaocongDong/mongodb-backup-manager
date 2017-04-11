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
import { AUTHSTATES, SUBMITSTATES } from '../../../utility/constants';

class BackConfigurations extends Component {

    constructor(props) {
        super(props);
        this.totalSteps = 3;
        this.state = {
            update: props.update ||  false,
            review: props.review || false,
            step: (props.review? 3: 0),
            authState: AUTHSTATES.UNAUTHENTICATED,
            submitState: SUBMITSTATES.UNSUBMITTED,
            backupConfig: (props.backupConfig)
        };
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

    setDbsColls(dbsColls) {
        this.dbsColls = dbsColls;
        const prevState = object.clone(this.state);
        prevState.backupConfig.db = this.dbsColls[0].db;
        prevState.collections = undefined;
        prevState.step += 1;
        this.setState(prevState);
    }

    setAuthState(state) {
        this.setState({ authState: state});
    }

    setSubmitState(state) {
        this.setState({ submitState: state });
    }

    render() {
        const { step, backupConfig, update, review, authState, submitState } = this.state;
        const totalStep = this.totalSteps;
        const stagesDOM = [];
        for(let i = 0; i < totalStep; i++) {
            stagesDOM.push(<div className={ "step" + (i == step?" current": (i > step?" pending": " past")) } key={ i }>{ i < step? '': i + 1 }</div>)
        }

        const formsDOM = [];

        const credentialForm = <CredentialForm  backupConfig = { backupConfig }
                                                authState = { authState }
                                                setAuthState = { this.setAuthState.bind(this) }
                                                handleConfigChange = { this.handleConfigChange.bind(this) }
                                                setDbsColls = { this.setDbsColls.bind(this) }
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
                                   submitState = { submitState }
                                   setSubmitState = { this.setSubmitState.bind(this) }
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

BackConfigurations.defaultProps = { backupConfig: backupConfigUtil.getInitBackupConfig() }
export default BackConfigurations;