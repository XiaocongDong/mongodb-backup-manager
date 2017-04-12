//react
import React, { Component } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup'

//ui
import CredentialForm from './credential.form';
import BackupConfiguration from './configuration.form';
import Review from './review.form';
import Progress from './progress';

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

        const credentialForm = <CredentialForm  key = { 0 }
                                                backupConfig = { backupConfig }
                                                authState = { authState }
                                                setAuthState = { this.setAuthState.bind(this) }
                                                handleConfigChange = { this.handleConfigChange.bind(this) }
                                                setDbsColls = { this.setDbsColls.bind(this) }
                                                handleNext = { this.handleNext.bind(this) }/>;
        formsDOM.push(credentialForm);

        const backupConfigForm = <BackupConfiguration key = { 1 }
                                                      dbsColls = { this.dbsColls }
                                                      handleNext = { this.handleNext.bind(this) }
                                                      handleBack = { this.handleBack.bind(this) }
                                                      backupConfig = { backupConfig }
                                                      handleConfigChange = { this.handleConfigChange.bind(this) }
                                                      review = { review }/>;
        formsDOM.push(backupConfigForm);

        const reviewForm = <Review key = { 2 }
                                   backupConfig = { backupConfig }
                                   submitState = { submitState }
                                   setSubmitState = { this.setSubmitState.bind(this) }
                                   handleBack = { this.handleBack.bind(this) }/>;
        formsDOM.push(reviewForm);

        return (
            <div className="configurations-container">
                <div className="side-bar">
                    <Progress step={ step }/>
                </div>
                <div className="content">
                    <div className="form-wrapper">
                    { formsDOM[step] }
                    </div>
                </div>
            </div>
        )
    }
}

BackConfigurations.defaultProps = { backupConfig: backupConfigUtil.getInitBackupConfig() }
export default BackConfigurations;