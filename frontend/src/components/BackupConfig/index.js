//react
import React, { Component } from 'react';

//ui
import Credential from './Credential';
import Config from './Config';
import Review from './Review';
import Progress from './Progress';

//utility
import object from 'utility/object';
import backupConfigUtil from 'utility/backupConfig';
import { AUTHSTATES, SUBMITSTATES } from 'constants/config';


class BackupConfig extends Component {

    constructor(props) {
        super(props);
        this.totalSteps = 3;
        // if it is in the update config mode
        // we need the backup id
        this.id = this.props.id;
        this.state = {
            review: props.review || false,
            update: props.update,
            step: (props.review? 2:0),
            authState: AUTHSTATES.UNAUTHENTICATED,
            submitState: SUBMITSTATES.UNSUBMITTED,
            backupConfig: (props.backupConfig)
        };
    }

    componentWillReceiveProps(nextProps) {
        const { review, update, dbsColls } = nextProps;
        if(review !== this.state.review ||
           update !== this.state.update) {
            let step = 0;

            if(review) {
                step = 2;
            }

            if(update) {
                step = 1;
                this.dbsColls = dbsColls;
            }

            this.setState({
                update,
                review,
                step
            })
        }
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
        const { step, update, backupConfig, review, authState, submitState } = this.state;
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
                                           handleNext = { this.handleNext.bind(this) }
                              />;
        formsDOM.push(credentialForm);

        const backupConfigForm = <Config key = { 1 }
                                         dbsColls = { this.dbsColls }
                                         update = { update }
                                         handleNext = { this.handleNext.bind(this) }
                                         handleBack = { this.handleBack.bind(this) }
                                         backupConfig = { backupConfig }
                                         handleConfigChange = { this.handleConfigChange.bind(this) }
                                         review = { review }
                                 />;
        formsDOM.push(backupConfigForm);

        const reviewForm = <Review key = { 2 }
                                   backupConfig = { backupConfig }
                                   review = { review }
                                   update = { update }
                                   submitState = { submitState }
                                   setSubmitState = { this.setSubmitState.bind(this) }
                                   handleBack = { this.handleBack.bind(this) }
                                   id ={  this.id } 
                            />;

        formsDOM.push(reviewForm);

        return (
            <div className="configurations-container">
                {
                    !review && !update &&
                    (
                        <div className="side-bar">
                            <Progress step={ step }/>
                        </div>
                    )
                }
                <div className="content">
                    <div className="form-wrapper">
                        { formsDOM[step] }
                    </div>
                </div>
            </div>
        )
    }
}

BackupConfig.defaultProps = { backupConfig: backupConfigUtil.getInitBackupConfig() };
export default BackupConfig;