//react
import React, { Component } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup'

//ui
import Credential from './credential';
import BackupConfig from './backup.config';
import Review from './review';
import Progress from './progress';

//utility
import object from 'utility/object';
import backupConfigUtil from 'utility/backupConfig';
import { AUTHSTATES, SUBMITSTATES } from 'utility/constants';

class Config extends Component {

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

    setAuthState(state) {
        this.setState({ authState: state});
    }

    authenticated(backupConfig, dbsColls) {
        this.dbsColls = dbsColls;
        const prevState = object.clone(this.state);
        prevState.backupConfig = backupConfig;
        prevState.backupConfig.db = this.dbsColls[0].db;
        prevState.collections = undefined;
        prevState.step += 1;
        prevState.authState = AUTHSTATES.AUTHENTICATED;
        this.setState(prevState);
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

        const credentialForm = <Credential key = { 0 }
                                           backupConfig = { backupConfig }
                                           authState = { authState }
                                           setAuthState = { this.setAuthState.bind(this) }
                                           handleConfigChange = { this.handleConfigChange.bind(this) }
                                           authenticated = { this.authenticated.bind(this) }
                                           handleNext = { this.handleNext.bind(this) }/>;
        formsDOM.push(credentialForm);

        const backupConfigForm = <BackupConfig key = { 1 }
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

Config.defaultProps = { backupConfig: backupConfigUtil.getInitBackupConfig() };
export default Config;