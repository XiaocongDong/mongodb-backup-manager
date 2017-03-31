import React, { Component } from 'react';
import Select from 'react-select';
import update from 'react-addons-update';
import DateTime from 'react-datetime';
import TimeInput from '../../time-input';


export default class ConfigurationForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            db: props.backupConfig.db,
            collections: props.backupConfig.collections,
            startTime: props.backupConfig.startTime,
            interval: props.backupConfig.interval || { days: 0, hours: 0, minutes: 0, seconds: 0 },
            maxBackupNumber: props.backupConfig.maxBackupNumber,
            duration: props.backupConfig.duration

        };

        this.errorMessages = {
            db: null,
            collections: null,
            startTime: null,
            interval: {},
            maxBackupNumber: null,
            duration: {}
        };
        this.getAvailableCollectionsWithDB = this.getAvailableCollectionsWithDB.bind(this);
        this.saveData = this.saveData.bind(this);
    }

    getAvailableCollectionsWithDB(db) {
        const availableDBCollections = this.props.availableDBsCollections;

        const dbCollections = availableDBCollections.filter(dbCollections => dbCollections.db == db);

        if(dbCollections.length > 0) {
            return dbCollections[0].collections;
        }

        return [];
    }

    handleDBChange(db) {
        this.setState({
            db: db.value,
            collections: undefined
        });
    }

    handleCollectionsChange(collections) {
        this.setState({
            collections: collections
        })
    }

    handleSelectAll() {
        const { db } = this.state;
        const availableCollections = this.getAvailableCollectionsWithDB(db);

        this.setState({
            collections: availableCollections
        });
    }

    handleCollectionsChecked(event) {
        const target = event.target;
        const checked = target.checked;

        this.setState({
            collections: (checked)?null: undefined
        });
    }

    handleNowChecked(event) {
        const target = event.target;
        const checked = target.checked;

        this.setState({
            startTime: (checked? null: undefined)
        })
    }

    handleDateTimeSave(time) {
        if(!time) {
            return
        }

        this.setState({
            startTime: time.toISOString()
        });
    }

    handleTimeInput(configKey, timeKey, value) {
        const newState = update(this.state, {
            [configKey]: { [timeKey]: { $set: value } }
        });

        this.setState(newState);
    }

    onClickBack() {
        this.saveData();
        this.props.onClickBack()
    }

    onClickNext() {
        this.saveData();
        this.props.onClickNext()
    }

    timeInputOnError(configType, timeType, errorMessage) {
        console.log(configType, timeType, errorMessage);
        this.errorMessages[configType][timeType] = errorMessage;
    }

    saveData() {
        this.props.saveData(this.state)
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
                               placeholder = "Select backup database"
                               onChange = { this.handleDBChange.bind(this) }
                       />;

        const availableCollections = this.getAvailableCollectionsWithDB(db);
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
                        <label>Collections{( collections !== null ) && (<span className="select-all clickable" onClick = { this.handleSelectAll.bind(this) }>[select all]</span>)}</label>
                        { (collections !== null ) && collectionsDOM }
                        <label><input type="checkbox" checked = { collections === null } onChange = { this.handleCollectionsChecked.bind(this) }/><span className="info">backup all the collections all the time</span></label>
                    </div>
                    <div className="item">
                        <label>startTime</label>
                        <div className="datetime-wrapper">
                            {
                                (startTime !== null) && (<DateTime defaultValue={ startTime ? new Date(startTime) : "" }
                                                                open={ false }
                                                                onBlur={ this.handleDateTimeSave.bind(this) }/>)
                            }
                        </div>
                        <label><input type="checkbox" checked = { startTime === null } onChange = { this.handleNowChecked.bind(this) }/><span className="info">backup now</span></label>
                    </div>
                    <div className="item">
                        <label>Interval</label>
                        <TimeInput onChange={ this.handleTimeInput.bind(this, "interval") }
                                   onErrorChange={ this.timeInputOnError.bind(this, "interval") }
                                   { ...interval }/>
                    </div>
                    <div className="item">
                        <label>duration</label>
                        <TimeInput onChange={ this.handleTimeInput.bind(this, "duration") }
                                   onErrorChange={ this.timeInputOnError.bind(this, "duration") }
                                   { ...duration }/>
                    </div>
                </div>
                <div className="footer">
                    <div className="button big no button-left" onClick = { this.onClickBack.bind(this) }>Go Back</div>
                    <div className="button big yes button-right" onClick = { this.onClickNext.bind(this) }>Next</div>
                </div>
            </div>
        )
    }
}