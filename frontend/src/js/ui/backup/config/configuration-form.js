import React, { Component } from 'react';
import Select from 'react-select';
import update from 'react-addons-update';
import DateTime from 'react-datetime';


export default class ConfigurationForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            config: {
                db: props.backupConfig.db,
                collections: props.backupConfig.collections,
                startTime: props.backupConfig.startTime,
                interval: props.backupConfig.interval,
                maxBackupNumber: props.backupConfig.maxBackupNumber,
                duration: props.backupConfig.duration
            },
            userSelections: {
                collectionsDisabled: props.userSelections.collectionsDisabled,
                dateTimeDisabled: props.userSelections.dateTimeDisabled
            }
        };
        this.getAvailableCollectionsWithDB = this.getAvailableCollectionsWithDB.bind(this);
        this.handleGoBack = this.handleGoBack.bind(this);
        this.handleNext = this.handleNext.bind(this);
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
        const newState = update(this.state, {
            config: { $set: { db: db.value, collections: null }},
        });
        this.setState(newState);
    }

    handleCollectionsChange(collections) {
        const newState = update(this.state, {
            config: { collections: { $set: collections }}
        });
        this.setState(newState)
    }

    handleSelectAll() {
        const { db } = this.state.config;
        const { collectionsDisabled } = this.state.userSelections;

        if(collectionsDisabled) {
            return;
        }

        const availableCollections = this.getAvailableCollectionsWithDB(db);

        const newState = update(this.state, {
            config: { collections: { $set: availableCollections }}
        });

        this.setState(newState);
    }

    handleCollectionsChecked(event) {
        const target = event.target;
        const checked = target.checked;

        const newState = update(this.state, {
            userSelections: { collectionsDisabled: {$set: checked } },
            config: { collections: {$set: null} }
        });
        this.setState(newState);
    }

    handleNowChecked(event) {
        const target = event.target;
        const checked = target.checked;

        const newState = update(this.state, {
            userSelections: { dateTimeDisabled: {$set: checked} },
            config: { startTime: { $set: null}}
        });
        this.setState(newState)
    }

    handleDateTimeSave(time) {
        if(!time) {
            return
        }
        const newState = update(this.state, {
            config: { startTime: {$set: time.toISOString()}}
        });
        this.setState(newState);
    }

    handleGoBack() {
        // Save the data first
        this.saveData();
        this.props.onClickBack();
    }

    handleNext() {
        // Save the date, validate the data
        this.saveData();
        this.props.onClickNext();
    }

    saveData() {
        this.props.saveData(this.state.config, this.state.userSelections)
    }

    render() {

        const { db, collections, startTime } = this.state.config;
        const { collectionsDisabled, dateTimeDisabled } = this.state.userSelections;

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
                    <label>Backup DataBase</label>
                    { dbsDOM }
                    <label>Backup Collections{( !collectionsDisabled ) && (<span className="select-all clickable" onClick = { this.handleSelectAll.bind(this) }>[Select all]</span>)}</label>
                    { (!collectionsDisabled) && collectionsDOM }
                    <label><input type="checkbox" checked = { collectionsDisabled } onChange = { this.handleCollectionsChecked.bind(this) }/><span className="info">Backup all the collections all the time</span></label>
                    <label>Backup StartTime</label>
                    <div className="datetime-wrapper">
                        {(!dateTimeDisabled) && (<DateTime className={ dateTimeDisabled ? "disabled" : "" }
                                                           defaultValue={ startTime ? new Date(startTime) : "" }
                                                           open={ false }
                                                           onBlur={ this.handleDateTimeSave.bind(this) }/>)
                        }
                    </div>
                    <label><input type="checkbox" checked = { dateTimeDisabled } onChange = { this.handleNowChecked.bind(this) }/><span className="info">Backup now</span></label>
                </div>
                <div className="footer">
                    <div className="button big no button-left" onClick = { this.handleGoBack.bind(this) }>Go Back</div>
                    <div className="button big yes button-right" onClick = { this.handleNext.bind(this) }>Next</div>
                </div>
            </div>
        )
    }
}