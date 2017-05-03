import React, { Component } from 'react';
import { hashHistory } from 'react-router';
import GoBackButton from '../../goback.button';
import Status from '../../status';
import Modal from '../../templates/modal';
import backups from '../../../api/backups';


export default class BackupTitle extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showDelete: false,
            deleting: false,
            deleted: false
        };
    }

    handleStop(id) {
        backups.stopBackup(id);
    }

    setStateWithKeyValues(keyValues, callback=null) {
        this.setState(keyValues, callback)
    }

    handleDelete(id) {
        // TODO add options here
    }

    handleResume(id) {
        backups.resumeBackup(id);
    }

    runBackup(id) {
        backups.runBackup(id);
    }

    render() {
        const { backupConfig } = this.props;
        const { id, status } = backupConfig;
        const { showDelete, deleting, deleted } = this.state;

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
                        <div className="operation backup clickable yes" onClick={ this.runBackup.bind(this, id)}>run backup</div>
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
                        <div className="operation delete clickable" onClick={ () => this.setStateWithKeyValues.call(this, { showDelete: true}) }>delete backup</div>
                        {
                            showDelete &&
                            <Modal
                                type="caution"
                                text={`Are you sure to delete ${ id }`}
                                buttons = {
                                    [
                                        {
                                            text: 'cancel',
                                            onClick: this.setStateWithKeyValues.bind(this, { showDelete: false })
                                        },
                                        {
                                            text: 'delete',
                                            onClick: () => {
                                                this.setStateWithKeyValues.call(this, { showDelete: false, deleting: true }, () => {
                                                    backups.deleteBackup(id, true, true)
                                                        .then(() => {
                                                            hashHistory.push('/dashboard');
                                                        });
                                                });

                                            }
                                        }
                                    ]
                                }
                            />
                        }
                        {
                            deleting &&
                            <Modal
                                type="info"
                                text={ `deleting ${ id }`}
                                buttons={ [] }
                            />
                        }
                        {
                            deleted &&
                            <Modal
                                type="info"
                                text={ `successfully deleted ${ id }`}
                                buttons = {
                                    [
                                        {
                                            text: 'ok',
                                            onClick: () => hashHistory.push('/dashboard')
                                        }
                                    ]
                                }
                            />
                        }
                    </div>
                </div>
            </div>
        )
    }

}