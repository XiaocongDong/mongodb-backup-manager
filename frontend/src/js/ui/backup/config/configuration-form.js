import React, { Component } from 'react';
import Select from 'react-select';
import update from 'react-addons-update';
import DateTime from 'react-datetime';


export default class ConfigurationForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            db: props.backupConfig.db,
            collections: props.backupConfig.collections,
            startTime: props.backupConfig.startTime,
            interval: props.backupConfig.interval,
            maxBackupNumber: props.backupConfig.maxBackupNumber,
            duration: props.backupConfig.duration
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

    onClickBack() {
        this.saveData();
        this.props.onClickBack()
    }

    onClickNext() {
        this.saveData();
        this.props.onClickNext()
    }

    saveData() {
        this.props.saveData(this.state)
    }

    render() {

        const { db, collections, startTime } = this.state;
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
                    <label>Backup Collections{( collections !== null ) && (<span className="select-all clickable" onClick = { this.handleSelectAll.bind(this) }>[Select all]</span>)}</label>
                    { (collections !== null ) && collectionsDOM }
                    <label><input type="checkbox" checked = { collections === null } onChange = { this.handleCollectionsChecked.bind(this) }/><span className="info">Backup all the collections all the time</span></label>
                    <label>Backup StartTime</label>
                    <div className="datetime-wrapper">
                        {(startTime !== null) && (<DateTime defaultValue={ startTime ? new Date(startTime) : "" }
                                                           open={ false }
                                                           onBlur={ this.handleDateTimeSave.bind(this) }/>)
                        }
                    </div>
                    <label><input type="checkbox" checked = { startTime === null } onChange = { this.handleNowChecked.bind(this) }/><span className="info">Backup now</span></label>
                </div>
                <div className="footer">
                    <div className="button big no button-left" onClick = { this.onClickBack.bind(this) }>Go Back</div>
                    <div className="button big yes button-right" onClick = { this.onClickNext.bind(this) }>Next</div>
                </div>
            </div>
        )
    }
}