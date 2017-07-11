import React, { Component } from 'react';
import GoBackButton from 'components/GoBackButton';
import Status from 'components/Status';
import Timer from 'components/Timer';

import modalController from 'utility/modal';
import { hashHistory } from 'react-router';
import backups from 'api/backups';


export default class title extends Component {

    handleStop(id) {
        backups.stopBackup(id)
               .catch(({ response }) => {
                   const err = response.data.message;
                   modalController.showModal({
                       type: 'error',
                       title: `Failed to stop ${ id }`,
                       text: `${ err }`,
                       buttons: [
                           {
                               text: 'ok',
                               onClick: modalController.closeModal
                           }
                       ]
                   })
               })
    }

    setStateWithKeyValues(keyValues, callback=null) {
        this.setState(keyValues, callback)
    }

    handleDelete(id) {
        modalController.showModal({
                type: 'info',
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
                            backups.deleteBackup(id)
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
                                        text: err,
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
                         {
                            (status == "WAITING") && (
                                <div className="next-backup-time"><Timer endTime={ backupConfig.nextBackupTime }/></div>
                            )
                        }
                    </div>
                    <div className="operations-wrapper">
                        <div className="operation backup clickable yes" onClick={ this.runBackup.bind(this, id)}>run</div>
                        {
                            (status == "WAITING" || status == "RUNNING") && (
                                <div className="operation stop clickable" onClick={ this.handleStop.bind(this, id) }>stop</div>
                            )
                        }
                        {
                            (status == "STOP") && (
                                <div className="operation resume clickable" onClick={ this.handleResume.bind(this, id) }>resume</div>
                            )
                        }
                        <div className="operation delete clickable" onClick={ this.handleDelete.bind(this, id) }>delete</div>
                    </div>
                </div>
            </div>
        )
    }

}