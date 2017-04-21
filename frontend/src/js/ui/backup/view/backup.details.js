import React, { Component } from 'react'
import BackupTitle from './backup.title';
import BackupDatabases from './backup.databases';
import Statistics from './backup.statistics';


export default class BackupDetails extends Component {

    render() {
        const props = this.props;

        if(!props.backupConfig) {
            return null;
        }

        return (
            <div className="backup-details">
                <BackupTitle backupConfig={ props.backupConfig }/>
                <div className="backup-content">
                    <div className="backup-databases-wrapper">
                        <BackupDatabases copyDBs={ props.copyDBs } />
                    </div>
                    <div className="backup-statistics-wrapper">
                        <Statistics backupConfig={ props.backupConfig }/>
                    </div>
                </div>
            </div>
        )
    }
}