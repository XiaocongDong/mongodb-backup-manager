import React, { Component } from 'react';
import GoBackButton from '../../goback.button';
import Status from '../../status';
import modalController from '../../../utility/modal';
import { hashHistory } from 'react-router';
import backups from '../../../api/backups';


export default class BackupTitle extends Component {

    handleStop(id) {
        backups.stopBackup(id);
    }

    setStateWithKeyValues(keyValues, callback=null) {
        this.setState(keyValues, callback)
    }

    handleDelete(id) {
        modalController.showModal({
                type: 'caution',
                title: `delete ${ id }?`,
                text: `this action will delete all the databases ang logs this backup created`,
                buttons: [
                    {
                        text: 'cancel',
                        onClick: modalController.closeModal
                    },
                    {
                        text: 'delete',
                        onClick: () => {
                            modalController.showModal({
                                text: `deleting ${ id }`,
                                content: 'progress',
                                buttons: []
                            });
                            backups.deleteBackup(id, true, true)
                                .then(() => {
                                    modalController.showModal({
                                        type: 'info',
                                        title: `successfully deleted ${ id }`,
                                        text: `all the databases and logs related to this backup have been removed`,
                                        buttons: []
                                    });
                                    setTimeout(() => {
                                        modalController.closeModal();
                                        hashHistory.push('/');
                                    }, 2000)
                                })
                                .catch(({ response }) => {
                                    const err = response.data.message;
                                    modalController.showModal({
                                        type: 'error',
                                        title: `failed to delete ${ id }`,
                                        text: err.message,
                                        buttons: [
                                            {
                                                text: 'ok',
                                                onClick: modalController.closeModal
                                            }
                                        ]
                                    })
                                })
                        }
                    }
                ]
            }
        )
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
                        <div className="operation delete clickable" onClick={ this.handleDelete.bind(this, id) }>delete backup</div>
                    </div>
                </div>
            </div>
        )
    }

}