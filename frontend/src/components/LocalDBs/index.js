import React, { Component } from 'react';
import Datetime from 'react-datetime'
import DB from './DB';
import input from 'utility/input';

import backups from 'api/backups';


export default class LocalDBs extends Component {

    constructor(props) {
        super(props);
        this.dbToggleMap = {};
        this.timeFilters = {
            startTime: null,
            endTime: null
        };
        this.copyDBs = props.copyDBs;
        this.filteredDBs = this.copyDBs;
    }

    toggleDatabaseOpen(dbName) {
        if(!this.dbToggleMap.hasOwnProperty(dbName)) {
            this.dbToggleMap[dbName] = { open: false };
        }else if(!this.dbToggleMap[dbName].hasOwnProperty("open")) {
            this.dbToggleMap[dbName].open = false;
        }

        this.dbToggleMap[dbName].open = !this.dbToggleMap[dbName].open;
        this.forceUpdate();
    }

    toggleCollectionSelect(dbName, collection) {
        if(!this.dbToggleMap.hasOwnProperty(dbName)) {
            this.dbToggleMap[dbName] = { collections: [] };
        }else if(!this.dbToggleMap[dbName].hasOwnProperty("collections")) {
            this.dbToggleMap[dbName].collections = [];
        }

        const prevCollections = this.dbToggleMap[dbName]["collections"];
        let nextCollections = null;

        if(prevCollections.includes(collection)) {
            nextCollections = prevCollections.filter(coll => coll != collection);
        }else {
            prevCollections.push(collection);
            nextCollections = prevCollections;
        }

        this.dbToggleMap[dbName]["collections"] = nextCollections;
        this.forceUpdate()
    }

    toggleSelectAll(dbName, collections) {
        if(!this.dbToggleMap.hasOwnProperty(dbName)) {
            this.dbToggleMap[dbName] = { collections: [] };
        }else if(!this.dbToggleMap[dbName].hasOwnProperty("collections")) {
            this.dbToggleMap[dbName].collections = [];
        }

        const prevCollections = this.dbToggleMap[dbName].collections;
        let nextCollections = null;

        if(prevCollections.length !== collections.length) {
            nextCollections = collections;
        }else {
            nextCollections = [];
        }

        this.dbToggleMap[dbName].collections = nextCollections;
        this.forceUpdate();
    }

    restore(dbName) {
        const id = this.props.backupConfig.id;
        const collections = this.dbToggleMap[dbName].collections;

        return backups.restore(id, dbName, collections);
    }

    onTimeChange(key, value) {
        this.timeFilters[key] = value;
        this.search();
    }

    search() {
        let filteredDBs = this.copyDBs;
        const { startTime, endTime } = this.timeFilters;
        if(!input.isEmpty(startTime)) {
            try {
                filteredDBs = filteredDBs.filter(db => {
                    return startTime.isSameOrBefore(new Date(db.createdTime))
                })
            }catch (e) {console.error(e)}
        }

        if(!input.isEmpty(endTime)) {
            try {
                filteredDBs = filteredDBs.filter(db => {
                    return endTime.isSameOrAfter(new Date(db.createdTime));
                })
            }catch (e) {}
        }

        this.filteredDBs = filteredDBs;
        this.forceUpdate();
    }

    componentWillReceiveProps(nextProps) {
        this.copyDBs = nextProps.copyDBs;
        this.search();
    }

    resetFilter(event) {
        event.preventDefault();
        this.timeFilters.startTime = null;
        this.timeFilters.endTime = null;
        this.search();
    }

    render() {
        const copyDBs = this.filteredDBs;
        const { startTime, endTime } = this.timeFilters;
        const { backupConfig } = this.props;

        const startTimeProps = {};
        if(startTime) {
            startTimeProps.defaultValue = startTime
        }else {
            startTimeProps.value = "";
        }

        const endTimeProps = {};
        if(endTime) {
            endTimeProps.defaultValue = endTime
        }else {
            endTimeProps.value = "";
        }

        return (
            <div className="database-info copy-databases">
                <div className="header">
                    <div className="title">
                        local
                    </div>
                    <div className="filter">
                        <div className="time-selector">
                            <span className="name">From</span>
                            <div className="selector">
                                <Datetime
                                    { ...startTimeProps }
                                    onChange={ this.onTimeChange.bind(this, 'startTime') }
                                />
                            </div>
                        </div>
                        <div className="time-selector">
                            <span className="name">To</span>
                            <div className="selector">
                                <Datetime
                                    { ...endTimeProps }
                                    onChange={ this.onTimeChange.bind(this, 'endTime') }
                                />
                            </div>
                        </div>
                        <span className="reset-button clickable" onClick={ this.resetFilter.bind(this) }>
                            reset
                        </span>
                    </div>
                </div>
                {
                    copyDBs &&
                    (
                        <div className="databases">
                            {
                                copyDBs.map((db, index) => {
                                    return (
                                        <DB key={ index }
                                            database={ db }
                                            updateRemoteDB={ this.props.updateRemoteDB }
                                            backupConfig={ backupConfig }
                                            toggleOpen={ this.toggleDatabaseOpen.bind(this) }
                                            toggleCollectionSelect={ this.toggleCollectionSelect.bind(this) }
                                            toggleSelectAll={ this.toggleSelectAll.bind(this) }
                                            restore={ this.restore.bind(this) }
                                            selectedCollections={ this.dbToggleMap.hasOwnProperty(db.name) && this.dbToggleMap[db.name].hasOwnProperty("collections")?this.dbToggleMap[db.name]["collections"]: [] }
                                            open={ this.dbToggleMap.hasOwnProperty(db.name) && this.dbToggleMap[db.name].hasOwnProperty("open")?this.dbToggleMap[db.name]["open"]: false  }
                                        />
                                    )
                                })
                            }
                        </div>
                    )
                }
            </div>
        )
    }

}