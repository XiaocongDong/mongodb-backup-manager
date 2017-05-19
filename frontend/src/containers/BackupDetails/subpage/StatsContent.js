import React, { Component } from 'react';
import BackupStats from 'components/BackupStats';


export default class StatsContent extends Component {

    render() {
        return (
            <div className="stats-content">
                <BackupStats backupConfig={ this.props.backupConfig }/>
            </div>
        )
    }
}