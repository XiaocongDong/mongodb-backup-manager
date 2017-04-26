import React, { Component } from 'react';
import GoBackButton from '../../goback.button';
import Status from '../../status';

import backups from '../../../api/backups';


export default class BackupTitle extends Component {

    handleStop(id) {
        backups.stopBackup(id);
    }

    handleDelete(id) {
        // TODO add options here
        backups.deleteBackup(id, true, true);
    }

    handleResume(id) {
        backups.resumeBackup(id);
    }

    render() {
        const { backupConfig } = this.props;
        const { id, status } = backupConfig;

        return (
            <div className="backup-title">
                <GoBackButton/>
                <div className="backup-id">
                    { id }
                </div>
                <div className="panel">
                    <div className="status-wrapper">
                        <Status status={ status }/>
                    </div>
                    <div className="operations-wrapper">
                        {
                            (status == "WAITING" || status == "RUNNING") && (
                                <div className="operation stop clickable" onClick={ this.handleStop.bind(this, id) }>stop backup</div>
                            )
                        }
                        {
                            (status == "STOP") && (
                                <div className="operation resume clickable" onClick={ this.handleResume.bind(this, id) }>resume backup</div>
                            )
                        }
                        {
                            <div className="operation delete clickable" onClick={ this.handleDelete.bind(this, id) }>delete backup</div>
                        }
                    </div>
                </div>
            </div>
        )
    }

}