import React, { Component } from 'react';
import Form from '../Form';
import { hashHistory } from 'react-router'

//utility
import input from 'utility/input';
import object from 'utility/object';
import time from 'utility/time';
import backupConfigUtil from 'utility/backupConfig';
import { SUBMITSTATES } from 'constants/config';


//api
import backups from 'api/backups';


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

            if(key == "duration" || key == "interval") {
                for(const k in value) {
                    displayValue += `${ value[k] } ${ k } `;
                }
            }
            
            value = displayValue;
        }

        if(!input.isEmpty(value) && (key == "startTime")) {
             value = new Date(value).toLocaleString();

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
        const { submitState, setSubmitState, update, id } = this.props;

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

        if(!update) {
            //create a new backup
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
        }else {
            // update backup config
            backups.updateBackup(id, backupConfig)
                    .then(response => {
                        this.submitErr = response.data.message;
                        // redirect to the main page
                        hashHistory.push(`/backups/${ id }`);
                    })
                    .catch(({ response }) => {
                        this.submitErr = response.data.message;
                        setSubmitState(SUBMITSTATES.UNSUBMITTED);
                    })
        }
    }

    render() {
        const { backupConfig, submitState, review, update } = this.props;
        const uiKeys = backupConfigUtil.uiKeys;
        const submitError = this.submitErr;

        const title = review? undefined: "Reviews";
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

        let buttons = [];

        if(review) {
            this.submitErr = null;
        }

        if(!review) {
            buttons.push(<div 
                                className="button big no button-left"
                                onClick = { this.props.handleBack }
                         >
                             Go Back
                         </div>);
            buttons.push(<div 
                                className={"button big yes button-right" + (submitState == SUBMITSTATES.SUBMITTING? " button-waiting": "")} 
                                onClick = { this.handleSubmit.bind(this) }
                         >
                            { update?'Update': 'Submit' }
                         </div>)
        }

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