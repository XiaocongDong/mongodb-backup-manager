import React, { Component } from 'react';
import Datetime from 'react-datetime'
import BackupDatabase from './backup.database';


export default class BackupDatabases extends Component {

    render() {
        const copyDBs = this.props.copyDBs;

        return (
            <div className="backup-databases">
                <div className="header">
                    <div className="title">
                        databases
                    </div>
                    <div className="filter">
                        <div className="time-selector">
                            <span className="name">From</span>
                            <div className="selector"><Datetime/></div>
                        </div>
                        <div className="time-selector">
                            <span className="name">To</span>
                            <div className="selector"><Datetime/></div>
                        </div>
                    </div>
                </div>
                <div className="databases">
                    {
                        copyDBs.map((db, index) => {
                            return <BackupDatabase key={ index } database={ db }/>
                        })
                    }
                </div>
            </div>
        )
    }

}