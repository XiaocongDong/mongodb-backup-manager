import React, { Component } from 'react';

import Filters from '../../redux/container/filters';
import BackupGrid from './backup.grid';

const backupConfig = {
    "_id": "58e9751400b05f755571c1c6",
    "server": "localhost",
    "port": "27017",
    "username": "xiaocdon",
    "password": "137800",
    "authDB": "crcdashboard",
    "db": "copy",
    "maxBackupNumber": 1,
    "interval": 6000,
    "id": "copy@localhost",
    "status": "STOP",
    "startTime": null,
    "nextBackUpTime": "2017-04-08T23:41:14.741Z",
    "lastBackupTime": "4/8/2017, 4:41:56 PM"
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