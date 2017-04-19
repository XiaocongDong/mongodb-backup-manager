import React, { Component } from 'react';

import colorPicker from '../../utility/colorPicker';

import backups from '../../api/backups';

export default class Panel extends Component {

    handleStop() {
        backups.stopBackup(this.props.backupConfig.id);
    }

    handleResume() {
        backups.resumeBackup(this.props.backupConfig.id);
    }

    handleView() {

    }

    render() {
        const { backupConfig } = this.props;
        const status = backupConfig.status;

        return (
            <div className="panel">
                <div className="status" style={ { backgroundColor: colorPicker.getColorWithStatus(status)} }>
                    { status}
                </div>
                <div className="info-operation-wrapper">
                    <div className="backup-info">
                        <div className="item">
                            <div className="title">
                                backup created time
                            </div>
                            <div className="time">
                                { backupConfig.createdTime }
                            </div>
                        </div>
                        <div className="item">
                            <div className="title">
                                last backup time
                            </div>
                            <div className="time">
                                { backupConfig.lastBackupTime }
                            </div>
                            <div className="result" style={{ color: colorPicker.getColorWithResult(backupConfig.lastBackupResult)}}>
                                { backupConfig.lastBackupResult }
                            </div>
                        </div>
                        <div className="item">
                            <div className="title">
                                next backup time
                            </div>
                            <div className="time">
                                { backupConfig.nextBackupTime }
                            </div>
                        </div>
                    </div>
                    <div className="operation-buttons">
                        {
                            (status == "WAITING" || status == "RUNNING") &&
                            (
                                <div className="button operation-button stop-button"
                                     onClick={ this.handleStop.bind(this) }
                                >
                                    STOP BACKUP
                                </div>
                            )
                        }
                        {
                            (status == "STOP") &&
                            (
                                <div className="button operation-button resume-button"
                                     onClick={ this.handleResume.bind(this) }
                                >
                                    RESUME BACKUP
                                </div>
                            )
                        }
                        <div className="button operation-button view-button"
                             onClick={ this.handleView.bind(this) }
                        >
                            VIEW BACKUP CONFIG
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}