import React, { Component } from 'react';
import Form from '../../templates/form';

import input from '../../../utility/input';
import object from '../../../utility/object';
import time from '../../../utility/time';
import backupConfigUtil from '../../../utility/backupConfig';


export default class Review extends Component {

    constructor(props) {
        super(props);
        this.disabledMessages = {
            collections: "back up all the collections in the backup db",
            startTime: "backup start after the backup configuration committed",
            interval: "not applied",
            duration: "not applied",
            maxBackupNumber: "not applied"
        }
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
        const backupConfig = object.clone(this.props.backupConfig);
        for(const key in backupConfig) {
            console.log(key);
            if(input.isEmpty(backupConfig[key])) {
                delete backupConfig[key];
                continue;
            }
            if(key == "duration" || key == "interval") {
                backupConfig[key] = time.convertToMilliseconds(backupConfig[key]);
            }
        }
        console.log(this.props.backupConfig);
        console.log(backupConfig);
        console.log(backupConfigUtil.getBackupConfigFromInput(backupConfig));
    }

    render() {
        const { backupConfig } = this.props;
        const uiKeys = backupConfigUtil.uiKeys;
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
            (<div className="button big yes button-right" onClick = { this.handleSubmit.bind(this) }>Submit</div>)
        ];

        return (
            <Form className="review-form"
                  title={ title }
                  items={ items }
                  buttons={ buttons }
            >
            </Form>
        )
    }
}