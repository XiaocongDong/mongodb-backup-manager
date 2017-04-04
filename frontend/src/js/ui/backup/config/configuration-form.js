import React, { Component } from 'react';
import Select from 'react-select';
import update from 'react-addons-update';
import DateTime from 'react-datetime';
import TimeInput from '../../time-input';
import object from '../../../utility/object';


export default class ConfigurationForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            db: props.backupConfig.db,
            collections: props.backupConfig.collections,
            startTime: props.backupConfig.startTime,
            interval: this.getInitialTime(props.backupConfig.interval),
            maxBackupNumber: props.backupConfig.maxBackupNumber,
            duration: this.getInitialTime(props.backupConfig.interval)
        };

        this.errorMessages = {
            db: null,
            collections: null,
            startTime: null,
            interval: {},
            maxBackupNumber: null,
            duration: {}
        };

        this.getAvailableCollections = this.getAvailableCollections.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    getAvailableCollections(db) {
        if(db == null) {
            return [];
        }

        const availableDBsCollections = this.props.availableDBsCollections;
        const filteredDBsCollections = object.filterArrWithKeyValue("db", db, availableDBsCollections);

        if(filteredDBsCollections.length == 0) {
            return [];
        }

        return filteredDBsCollections[0].collections;
    }

    getInitialTime(time) {
        if(time === undefined) {
            return {days: 0, hours: 0, minutes: 0, seconds: 0}
        }

        return time;
    }

    handleDBChange(db) {
        const changes = {
            db: db.value,
            collections: undefined
        };
        this.handleChange(changes)
    }

    handleCollectionsChange(collections) {
        this.handleChange({ collections })
    }

    handleSelectAll() {
        const { db } = this.state;
        const collections = this.getAvailableCollections(db);
        this.handleChange({ collections });
    }

    handleCollectionsChecked(event) {
        const target = event.target;
        const checked = target.checked;
        this.handleChange({ collections: (checked)?null: undefined})
    }

    handleNowChecked(event) {
        const target = event.target;
        const checked = target.checked;
        this.handleChange({startTime: (checked? null: undefined)})
    }

    handleBackupOnceChecked(event) {
        const target = event.target;
        const checked = target.checked;
        this.handleChange({interval: (checked? null: this.getInitialTime(undefined))})
    }

    handleDateTimeSave(time) {
        if(!time) {
            return
        }

        this.handleChange({ startTime: time.toISOString() })
    }

    handleTimeInput(configKey, timeKey, value) {
        const newState = update(this.state, {
            [configKey]: { [timeKey]: { $set: value } }
        });
        this.handleChange(newState);
    }

    onClickNext() {
        // TODO validate the data
        this.props.onClickNext()
    }

    timeInputOnError(configType, timeType, errorMessage) {
        console.log(configType, timeType, errorMessage);
        this.errorMessages[configType][timeType] = errorMessage;
    }

    handleChange(changes) {
        this.setState(changes);
        if(!this.props.handleChange) {
            return;
        }
        for(let key in changes) {
            this.props.handleChange(key, changes[key]);
        }
    }

    render() {

        const { db, collections, startTime, interval, duration } = this.state;
        const availableDBsCollections = this.props.availableDBsCollections;
        const dbOptions = availableDBsCollections.map(dbCollections => {
            const { db } = dbCollections;
            return {
                value: db,
                label: db
            }
        });

        const dbsDOM = <Select name = "db-select"
                               value = { db }
                               options = { dbOptions }
                               onChange = { this.handleDBChange.bind(this) }
                       />;


        const availableCollections = db? object.filterArrWithKeyValue("db", db, availableDBsCollections)[0].collections: [];
        const availableCollectionsOptions = availableCollections.map(collection => {
            return {
                value: collection,
                label: collection
            };
        });

        const collectionsDOM = <Select name = "collections"
                                       value = { collections }
                                       multi={ true }
                                       placeholder= "Select the backup collections"
                                       options = { availableCollectionsOptions }
                                       onChange = { this.handleCollectionsChange.bind(this) }
                               />;

        return (
            <div className="form configuration-form">
                <div className="title">Backup Configuration</div>
                <div className="content">
                    <div className="item">
                        <label>database</label>
                        { dbsDOM }
                    </div>
                    <div className="item">
                        <label>collections
                            {
                                ( collections !== null ) && (<span className="select-all clickable" onClick = { this.handleSelectAll.bind(this) }>[select all]</span>)
                            }
                        </label>
                        {
                            ( collections !== null ) && collectionsDOM
                        }
                        <label>
                            <input type="checkbox"
                                   checked = { collections === null }
                                   onChange = { this.handleCollectionsChecked.bind(this) }
                            />
                            <span className="info">backup all the collections all the time</span>
                        </label>
                    </div>
                    <div className="item">
                        <label>startTime</label>
                        {
                            (startTime !== null ) && (
                                <div className="datetime-wrapper">
                                    <DateTime value={ startTime ? new Date(startTime) : "" }
                                              open={ false }
                                              onBlur={ this.handleDateTimeSave.bind(this) }
                                    />
                                </div>
                            )
                        }
                        <label>
                            <input type="checkbox"
                                   checked = { startTime === null }
                                   onChange = { this.handleNowChecked.bind(this) }
                            />
                            <span className="info">backup now</span>
                        </label>
                    </div>
                    <div className="item">
                        <label>Interval</label>
                        {
                            (interval !== null ) && (<TimeInput onChange={ this.handleTimeInput.bind(this, "interval") }
                                    onErrorChange={ this.timeInputOnError.bind(this, "interval") }
                                    { ...interval }
                            />)
                        }
                        <label>
                            <input type="checkbox"
                                   checked = { interval === null }
                                   onChange = { this.handleBackupOnceChecked.bind(this) }
                            />
                            <span className="info">Backup once</span>
                        </label>
                    </div>
                    <div className="item">
                        <label>max copy dbs number</label>
                        <input type="number" className="input-field"/>
                    </div>
                    <div className="item">
                        <label>duration</label>
                        <TimeInput onChange={ this.handleTimeInput.bind(this, "duration") }
                                   onErrorChange={ this.timeInputOnError.bind(this, "duration") }
                                   { ...duration }
                        />
                    </div>
                </div>
                <div className="footer">
                    <div className="button big no button-left" onClick = { this.props.onClickBack }>Go Back</div>
                    <div className="button big yes button-right" onClick = { this.onClickNext.bind(this) }>Next</div>
                </div>
            </div>
        )
    }
}