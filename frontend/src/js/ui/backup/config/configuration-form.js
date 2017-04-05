import React, { Component } from 'react';
import Select from 'react-select';
import DateTime from 'react-datetime';
import TimeInput from '../../time-input';
import object from '../../../utility/object';
import inputValidator from "../../../utility/input-validator";
import NumberInput from "../../number-input";


export default class ConfigurationForm extends Component {

    constructor(props) {
        super(props);
        this.errors = {
            db: null,
            collections: null,
            startTime: null,
            interval: {
                days: null,
                hours: null,
                minutes: null,
                seconds: null
            },
            maxBackupNumber: null,
            duration: {
                days: null,
                hours: null,
                minutes: null,
                seconds: null
            }
        };
        this.initValues = {
            collections: undefined,
            startTime: undefined,
            interval: {days: 0, hours: 0, minutes: 0, seconds:0 },
            duration: {days: 0, hours: 0, minutes: 0, seconds:0 },
            maxBackupNumber: 0
        };
        this.configs = ["db", "collections", "startTime", "interval", "maxBackupNumber", "duration"];
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
        const collections = this.getCollOpts(db);
        this.handleConfigChange("collections", collections);
    }

    handleCheckBoxChecked(key, event) {
        const target = event.target;
        const checked = target.checked;
        const initValues = this.initValues;
        this.handleConfigChange(key, checked? null: initValues[key]);
    }

    handleNext() {
        let validated = true;
        const backupConfig = this.props.backupConfig;
        this.configs.map(key => {
            const error = inputValidator.validate(key, backupConfig[key]);
            this.errors[key] = error;
            if(!object.isValuesEmpty(error)) {
                validated = false;
            }
        });
        if(!validated) {
            this.forceUpdate();
            return;
        }
        this.props.handleNext()
    }

    handleConfigChange(key, change) {
        this.errors[key] = inputValidator.validate(key, change);
        switch (key) {
            case "db":
                this.props.handleConfigChange({"db": change.value, "collections": undefined});
                break;
            case "collections":
                let collections = change;
                if(!inputValidator.isEmpty(change)) {
                    collections = change.map(coll => {
                        if (typeof coll == "object") {
                            return coll.value;
                        }
                        return coll;
                    });
                }
                this.props.handleConfigChange({ collections });
                break;
            case "startTime":
                if(!inputValidator.isEmpty(change) && typeof change === "object") {
                    change = change.toISOString();
                }
                this.props.handleConfigChange({ "startTime": change });
                break;
            case "maxBackupNumber":
                this.props.handleConfigChange({"maxBackupNumber": change});
                break;
            default:
                this.props.handleConfigChange({ [key]: change });
                break;
        }
    }

    getError(key) {
        if(key == "interval" || key == "duration") {
            return this.errors[key].error;
        }else {
            return this.errors[key];
        }
    }

    render() {
        const { db, collections, startTime, interval, duration, maxBackupNumber } = this.props.backupConfig;
        const dbsColls = this.props.dbsColls;
        const errors = this.errors;
        const dbOpts = dbsColls.map(dbColls => {
            const { db } = dbColls;
            return {
                value: db,
                label: db
            }
        });

        const dbsDOM = <Select name = "db-select"
                               value = { db }
                               options = { dbOpts }
                               onChange = { this.handleConfigChange.bind(this, "db") }/>;


        const collOpts = this.getCollOpts(db);
        const collFilterOpts = collOpts.map(collection => {
            return {
                value: collection,
                label: collection
            };
        });

        const collsDOM = <Select name = "collections"
                                 value = { collections }
                                 multi={ true }
                                 placeholder= "Select the backup collections"
                                 options = { collFilterOpts }
                                 onChange = { this.handleConfigChange.bind(this, "collections") }
                                 disabled={ collections === null }/>;

        return (
            <div className="form configuration-form">
                <div className="title">Backup Configuration</div>
                <div className="content">
                    <div className="item">
                        <label>database</label>
                        { dbsDOM }
                        <div className="error-message">{ this.getError("db") }</div>
                    </div>
                    <div className="item">
                        <label>collections
                            <span className="select-all clickable" onClick = { this.handleSelectAll.bind(this) }>[select all]</span>
                        </label>
                        { collsDOM }
                        <div className="error-message">{ this.getError("collections") }</div>
                        <label>
                            <input type="checkbox"
                                   checked = { collections === null }
                                   onChange = { this.handleCheckBoxChecked.bind(this, "collections") }/>
                            <span className="info">backup all the collections all the time</span>
                        </label>
                    </div>
                    <div className="item">
                        <label>startTime</label>
                        <div className="datetime-wrapper">
                            <DateTime value={ startTime ? new Date(startTime) : "" }
                                      open={ false }
                                      inputProps={ {disabled: startTime === null } }
                                      onBlur={ this.handleConfigChange.bind(this, "startTime") }/>
                        </div>
                        <div className="error-message">{ this.getError("startTime") }</div>
                        <label>
                            <input type="checkbox"
                                   checked = { startTime === null }
                                   onChange = { this.handleCheckBoxChecked.bind(this, "startTime") }/>
                            <span className="info">backup now</span>
                        </label>
                    </div>
                    <div className="item">
                        <label>Interval</label>
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
                            <span className="info">Backup once</span>
                        </label>
                    </div>
                    <div className="item">
                        <label>max copy dbs number</label>
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
                    </div>
                    <div className="item">
                        <label>duration</label>
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
                    </div>
                </div>
                <div className="footer">
                    <div className="button big no button-left" onClick = { this.props.handleBack }>Go Back</div>
                    <div className="button big yes button-right" onClick = { this.handleNext.bind(this) }>Next</div>
                </div>
            </div>
        )
    }
}