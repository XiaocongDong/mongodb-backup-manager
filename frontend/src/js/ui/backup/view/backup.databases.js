import React, { Component } from 'react';
import Datetime from 'react-datetime'
import BackupDatabase from './backup.database';
import input from '../../../utility/input';


export default class BackupDatabases extends Component {

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

    toggleDatabase(dbName) {
        if(!this.dbToggleMap.hasOwnProperty(dbName)) {
           this.dbToggleMap[dbName] = false;
        }
        this.dbToggleMap[dbName] = !this.dbToggleMap[dbName];
        this.forceUpdate();
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

       // console.log(this.copyDBs, copyDBs);
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
            <div className="backup-databases">
                <div className="header">
                    <div className="title">
                        databases
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
                <div className="databases">
                    {
                        copyDBs.map((db, index) => {
                            return(
                                <BackupDatabase key={ index }
                                                database={ db }
                                                toggleOpen={ this.toggleDatabase.bind(this) }
                                                open={ this.dbToggleMap.hasOwnProperty(db.name)? this.dbToggleMap[db.name]: false }
                                />
                            )
                        })
                    }
                </div>
            </div>
        )
    }

}