import React, { Component } from 'react';

import Filters from '../../redux/container/filters';
import BackupGrid from './backup.grid';

const backupConfig = {
    "server" : "localhost",
    "port" : 27017,
    "authDB" : "admin",
    "interval" : 86400000,
    "maxBackupNumber" : 1,
    "duration" : 86400000,
    "db" : "osdna",
    "collections" : [
        "Mirantis-Liberty-UT"
    ],
    "id" : "osdna@localhost",
    "status" : "RUNNING",
    "startTime" : null,
    "nextBackUpTime" : "2017-04-14T17:41:13.063+0000",
    "lastBackupTime" : "4/13/2017, 10:41:13 AM",
    "lastBackupStatus" : "SUCCESS",
    "backupTotal" : 1,
    "successfulBackups" : 1,
    "failedBackups" : 0
};

export default class Dashboard extends Component{

    render() {
        return (
            <div className="dashboard">
                <div className="side-bar">
                    <Filters
                        showStatus={ true }
                        showId={ true }
                        multiIds={ true }
                    />
                </div>
                <div className="content">
                    <BackupGrid
                        backupConfig = { backupConfig }
                    />
                    <BackupGrid
                        backupConfig = { backupConfig }
                    />
                    <BackupGrid
                        backupConfig = { backupConfig }
                    />
                </div>
            </div>
        )
    }
}