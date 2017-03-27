import React, { Component } from 'react';

import DatabaseCredential from './database-credential';
import BackupConfiguration from './backup-configuration';
import Review from './review';


export default class NewConfiguration extends Component {

    constructor(props) {
        super(props);
        this.newConfiguration = {};
        this.state = { step: 0 };
        this.totalStep = 3;
        this.authenticate = this.authenticate.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleGoBack = this.handleGoBack.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    authenticate(data) {
        console.log('Authenticating the server');
        this.handleNext();
    }

    handleClose() {
        // close the new configuration section

    }

    handleGoBack() {
        // from the backup configuration form back to the authentication form
        this.setState({
            step: this.state.step --
        })
    }

    handleNext() {
        // next form
        this.setState({
            step: this.state.step ++
        })
    }

    handleSubmit() {
        // submit the backup config
    }

    render() {
        const step = this.state.step;

        const formsDOM = [];
        formsDOM.push(<DatabaseCredential authenticate = { this.authenticate }/>);
        formsDOM.push(<BackupConfiguration onClickBack = { this.handleNext } onClickNext = { this.handleNext } />);
        formsDOM.push(<Review onClickBack = { this.handleGoBack } onClickSubmit = { this.handleSubmit } />);

        return (
            <div className="new-configuration-form">
                <div className="progress">
                    <div className="step">{ step + 1 }</div>
                        <div className="bar-wrapper">
                            <div className="bar" style={ { width: ((step +1)/this.totalStep) * 100 + '%' } }></div>
                        </div>
                </div>
                { formsDOM[step] }
            </div>
        )
    }
}
