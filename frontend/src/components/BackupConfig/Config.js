import React, { Component } from 'react';
import Select from 'react-select';
import DateTime from 'react-datetime';

import TimeInput from 'components/TimeInput';
import Form from '../Form';
import NumberInput from "components/NumberInput";

import object from 'utility/object';
import input from "utility/input";
import timeUtil from "utility/time";
import backupConfigUtil from "utility/backupConfig";


export default class Config extends Component {

    constructor(props) {
        super(props);
        this.errors = {
            db: null,
            collections: null,
            startTime: null,
            interval: {
            },
            maxBackupNumber: null,
            duration: {
            }
        };
        this.initValues = {
            collections: undefined,
            startTime: undefined,
            interval: timeUtil.getTime(1, 0, 0, 0),
            duration: timeUtil.getTime(1, 0, 0, 0),
            maxBackupNumber: 7
        };
        this.getCollOpts = this.getCollOpts.bind(this);
        this.getError = this.getError.bind(this);
    }

    getCollOpts(db) {
        if(db == null) {
            return [];
        }

        const dbsColls = this.props.dbsColls;
        const filteredDbsColls = object.filterArrWithKeyValue("db", db, dbsColls);

        if(filteredDbsColls.length == 0) {
            return [];
        }

        return filteredDbsColls[0].collections;
    }

    handleSelectAll() {
        const { db } = this.props.backupConfig;
        if(db == null) {
            return;
        }
        const collections = this.getCollOpts(db);
        this.handleConfigChange("collections", collections);
    }

    handleCheckBoxChecked(key, event) {
        const target = event.target;
        const checked = target.checked;
        const initValues = this.initValues;
        this.handleConfigChange(key, (checked? null: initValues[key]));
    }

    handleNext() {
        const errors = this.errors;
        const backupConfig = this.props.backupConfig;
        const keys = backupConfigUtil.configKeys;
        if(!input.validateKeys(keys, errors, backupConfig)) {
            this.forceUpdate();
            return;
        }
        this.props.handleNext()
    }

    handleConfigChange(key, change) {
        let changes = {};
        switch (key) {
            case "db":
                if(!input.isEmpty(change)) {
                    change = change.value;
                }
                changes = {"db": change, "collections": undefined};
                break;
            case "collections":
                if(!input.isEmpty(change)) {
                    change = change.map(coll => {
                        if (typeof coll == "object") {
                            return coll.value;
                        }
                        return coll;
                    });
                }
                changes = { collections: change };
                break;
            case "startTime":
                let time = change;
                if(!input.isEmpty(change) && typeof change === "object") {
                    time = change.toISOString();
                    change = time;
                }
                changes = { "startTime": time };
                break;
            case "maxBackupNumber":
                changes = {"maxBackupNumber": change};
                break;
            default:
                changes = {[key]: change};
                break;
        }
        this.errors[key] = input.validateKey(key, change);
        this.props.handleConfigChange(changes);
    }

    getError(key) {
        if(key == "interval" || key == "duration") {
            return this.errors[key].time;
        }else {
            return this.errors[key];
        }
    }

    render() {
        const { backupConfig, dbsColls, update } = this.props;
        const uiKeys = backupConfigUtil.uiKeys;
        const { db, collections, startTime, interval, duration, maxBackupNumber } = backupConfig;
        const errors = this.errors;
        const dbOpts = dbsColls.map(({ db }) => {
            return {
                value: db,
                label: db
            }
        });

        const collOpts = this.getCollOpts(db);
        const collFilterOpts = collOpts.map(collection => {
            return {
                value: collection,
                label: collection
            };
        });

        const startTimeProps = {};
        if(startTime) {
            startTimeProps.defaultValue = new Date(startTime)
        }else {
            startTimeProps.value = "";
        }

        const title = "Backup Configuration";
        const items = [
            (<div>
                <label>{ uiKeys["db"] }<div className="required">*</div></label>
                <Select name = "db-select"
                        value = { db }
                        placeholder={ "please select backup database" }
                        options = { dbOpts }
                        disabled = { update }
                        onChange = { this.handleConfigChange.bind(this, "db") }
                />
                <div className="error-message">{ this.getError("db") }</div>
            </div>),
            (<div>
                <label>{ uiKeys["collections"] }<div className="required">*</div>
                    <span className="select-all clickable" onClick = { this.handleSelectAll.bind(this) }>[select all]</span>
                </label>
                <Select name = "collections"
                        value = { collections }
                        multi={ true }
                        placeholder= { (collFilterOpts.length != 0)?"Select the backup collections": "no available collections" }
                        options = { collFilterOpts }
                        onChange = { this.handleConfigChange.bind(this, "collections") }
                        disabled={ collections === null }
                />
                <div className="error-message">{ this.getError("collections") }</div>
                <label>
                    <input type="checkbox"
                           checked = { collections === null }
                           onChange = { this.handleCheckBoxChecked.bind(this, "collections") }/>
                    <span className="info">backup all the collections all the time</span>
                </label>
            </div>),
            (<div>
                <label>{ uiKeys["startTime"] }</label>
                <div className="datetime-wrapper">
                    <DateTime {...startTimeProps}
                              open={ false }
                              className={ this.getError("startTime")? "error": "" }
                              inputProps={ {disabled: startTime === null } }
                              onBlur={ this.handleConfigChange.bind(this, "startTime") }
                    />
                </div>
                <div className="error-message">{ this.getError("startTime") }</div>
                <label>
                    <input type="checkbox"
                           checked = { startTime === null }
                           onChange = { this.handleCheckBoxChecked.bind(this, "startTime") }
                    />
                    <span className="info">backup now</span>
                </label>
            </div>),
            (<div>
                <label>{ uiKeys["interval"] }</label>
                <TimeInput onChange={ this.handleConfigChange.bind(this, "interval") }
                           disabled={ interval === null }
                           values={ interval }
                           errors={ errors.interval }
                />
                <div className="error-message">{ this.getError("interval") }</div>
                <label>
                    <input type="checkbox"
                           checked = { interval === null }
                           onChange = { this.handleCheckBoxChecked.bind(this, "interval") }
                    />
                    <span className="info">just backup one time</span>
                </label>
            </div>),
            (<div>
                <label>{ uiKeys["maxBackupNumber"] }</label>
                <NumberInput className="input-field"
                             onChange={ this.handleConfigChange.bind(this, "maxBackupNumber") }
                             onBlur={ this.handleConfigChange.bind(this, "maxBackupNumber") }
                             value={ maxBackupNumber }
                />
                <div className="error-message">{ this.getError("maxBackupNumber") }</div>
                <label>
                    <input type="checkbox"
                           checked = { maxBackupNumber === null }
                           onChange = { this.handleCheckBoxChecked.bind(this, "maxBackupNumber") }
                    />
                    <span className="info">not applied</span>
                </label>
            </div>),
            (<div>
                <label>{ uiKeys["duration"] }</label>
                <TimeInput onChange={ this.handleConfigChange.bind(this, "duration") }
                           disabled={ duration === null }
                           values={ duration }
                           errors={ errors.duration }
                />
                <div className="error-message">{ this.getError("duration") }</div>
                <label>
                    <input type="checkbox"
                           checked = { duration === null }
                           onChange = { this.handleCheckBoxChecked.bind(this, "duration") }
                    />
                    <span className="info">not applied</span>
                </label>
            </div>)
        ];

        let buttons = [];
        if(update) {
            buttons.push(<div className='button big yes button-middle' onClick = { this.handleNext.bind(this) }>Next</div>);
        }else {
            buttons.push(<div className="button big no button-left" onClick = { this.props.handleBack }>Go Back</div>);
            buttons.push(<div className="button big yes button-right" onClick = { this.handleNext.bind(this)}>Next</div>)
        }

        return(
            <Form
                className="configuration-form"
                title={ title }
                items={ items }
                buttons={ buttons }
            >
            </Form>
        )
    }
}