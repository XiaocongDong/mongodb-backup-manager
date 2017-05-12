import React, { Component } from 'react';
import Form from '../../templates/form';
import dataLoader from '../../../api/dataLoader';
import { hashHistory } from 'react-router'

//utility
import input from '../../../utility/input';
import object from '../../../utility/object';
import time from '../../../utility/time';
import backupConfigUtil from '../../../utility/backupConfig';
import { SUBMITSTATES } from '../../../utility/constants';


//api
import backups from '../../../api/backups';


export default class Review extends Component {

    constructor(props) {
        super(props);
        this.disabledMessages = {
            collections: "back up all the collections in the backup db",
            startTime: "backup start after the backup configuration committed",
            interval: "not applied",
            duration: "not applied",
            maxBackupNumber: "not applied"
        };
        this.submitErr = null;
    }

    getValue(key) {
        const { backupConfig } = this.props;
        let value = backupConfig[key];

        if(!input.isEmpty(value) && (key == "duration" || key == "interval")) {
            let displayValue = "";
            for(const k in value) {
                displayValue += `${ value[k] } ${ k } `;
            }
            value = displayValue;
        }

        if(key == "collections" && !input.isEmpty(value)) {
            let displayValue = "";
            for(const i in value) {
                displayValue += value[i] + (i !== value.length - 1? "   ": "");
            }
            value = displayValue;
        }

        return value;
    }

    handleSubmit() {
        const { submitState, setSubmitState } = this.props;

        if(submitState == SUBMITSTATES.SUBMITTING) {
            return;
        }

        setSubmitState(SUBMITSTATES.SUBMITTING);

        const backupConfig = object.clone(this.props.backupConfig);
        for(const key in backupConfig) {
            if(input.isEmpty(backupConfig[key])) {
                delete backupConfig[key];
                continue;
            }
            if(key == "duration" || key == "interval") {
                backupConfig[key] = time.convertToMilliseconds(backupConfig[key]);
            }
        }

        backups.newBackupConfig(backupConfig)
            .then(response => {
                this.submitErr = response.data.message;
                // redirect to the main page
                hashHistory.push('/');
            })
            .catch(({ response }) => {
                this.submitErr = response.data.message;
                setSubmitState(SUBMITSTATES.UNSUBMITTED);
            })
    }

    render() {
        const { backupConfig, submitState } = this.props;
        const uiKeys = backupConfigUtil.uiKeys;
        const submitError = this.submitErr;

        const title = "Review";
        const items = Object.keys(backupConfig).map((key) => {
            const value = this.getValue(key);

            return (
                <div className="row">
                    <div className="name-row">
                        <div className="cell name">{ uiKeys[key] }</div>
                        <div className={ "cell value" + (value? "": " disabled")}>{ value || this.disabledMessages[key] }</div>
                    </div>
                </div>
            )
        });

        const buttons = [
            (<div className="button big no button-left" onClick = { this.props.handleBack }>Go Back</div>),
            (<div className={"button big yes button-right" + (submitState == SUBMITSTATES.SUBMITTING? " button-waiting": "")} onClick = { this.handleSubmit.bind(this) }>Submit</div>)
        ];

        return (
            <Form className="review-form"
                  title={ title }
                  items={ items }
                  buttons={ buttons }
                  error = { submitError }
            >
            </Form>
        )
    }
}