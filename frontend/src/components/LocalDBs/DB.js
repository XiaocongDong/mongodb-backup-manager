import React, { Component } from 'react';
import databases from 'api/databases';
import collections from 'api/collections'
import ModalWrapper from 'components/ModalWrapper';
import CollectionViewer from 'components/CollectionViewer';
import Portal from 'components/Portal';
import Timer from 'components/Timer';
import modalController from 'utility/modal';


export default class DB extends Component {

    constructor(props) {
        super(props);
        this.state ={
            collection: null,
            collections: [],
            restoreErr: null
        };
    }

    handleDelete(id, db, event) {
        event.stopPropagation();
        modalController.showModal({
            type: 'info',
            title: `delete ${ db }?`,
            text: `all the collections in this database will be deleted`,
            buttons: [
                {
                    text: 'cancel',
                    onClick: modalController.closeModal
                },
                {
                    text: 'delete',
                    onClick: () => {
                        modalController.showModal({
                            type: 'info',
                            text: `deleting ${ db }`,
                            content: 'progress',
                            buttons: []
                        });
                        databases.deleteCopyDB(id, db)
                            .then(modalController.closeModal)
                            .catch(({ response }) => {
                                const err = response.data.message;
                                modalController.showModal({
                                    type: 'error',
                                    title: `failed to delete ${ db }`,
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
        });
    }

    showCollectionData(collection) {
        this.setState({ collection })
    }

    restore(dbName) {
        const { selectedCollections, updateRemoteDB, database } = this.props;
        const { id } = database;

        if(selectedCollections.length == 0) {
            this.setState({
                restoreErr: `must select restore collections`
            });
            return;
        }else {
            this.setState({
                restoreErr: null
            });
        }

        modalController.showModal({
            type: 'info',
            title: `Are you sure to restore ${ dbName}?`,
            text: `${ selectedCollections.join(', ') } of ${ dbName } will be written to the remote database, the corresponding collections of the remote database will be removed`,
            buttons: [
                {
                    text: 'cancel',
                    onClick: modalController.closeModal
                },
                {
                    text: 'restore',
                    onClick: () => {
                        modalController.showModal({
                            type: 'info',
                            text: `restoring ${ dbName }`,
                            content: 'progress'
                        });
                        this.props.restore(dbName)
                            .then(() => {
                                updateRemoteDB(id);
                                modalController.showModal({
                                    type: 'info',
                                    title: 'restore succeeded',
                                    text: `${ selectedCollections.join(', ') } of ${ dbName } has been written to the remote database, the corresponding collections of the remote database has been removed`,
                                    buttons: [
                                        {
                                            text: 'ok',
                                            onClick: modalController.closeModal
                                        }
                                    ]
                                })
                            })
                            .catch(err => {
                                modalController.showModal({
                                    type: 'error',
                                    title: 'restore failed',
                                    text: `failed to restore ${ dbName } for ${ err.message }`,
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
        });
    }

    render() {
        const { database,selectedCollections, backupConfig, open } = this.props;
        const { collection, restoreErr } = this.state;

        return (
            <div className="database clickable">
                <div className="database-header" onClick={ this.props.toggleOpen.bind(this, database.name) }  >
                    <div className="basic-info">
                        <div className="name">
                            { database.name }
                        </div>
                        <div className="operation clickable" onClick={ this.handleDelete.bind(this, database.id, database.name) }>
                            <i className="fa fa-trash"></i>
                        </div>
                    </div>
                    <div className="time-info">
                        <div className="time created-time">
                            <i className="fa fa-clock-o" aria-hidden={ true }></i>
                            <span>created at </span>
                            <span>{ database.createdTime }</span>
                        </div>
                        {
                            database.deletedTime && backupConfig.status !== "STOP" &&
                            (
                                <div className="time deleted-time">
                                    <i className="fa fa-times-circle-o" aria-hidden={ true }></i>
                                    <span>deleted after: </span>
                                    <span><Timer endTime={ database.deletedTime }/></span>
                                </div>
                            )
                        }
                    </div>
                </div>
                {
                    open &&
                    (
                        <div className="database-details">
                            {
                                database.collections.map((collection, index) => {
                                    return (
                                        <div
                                            className={"database-collection" + (selectedCollections.includes(collection)? " selected": "")}
                                            key={ index }
                                        >
                                            <div className="collection-select" onClick={ () => this.props.toggleCollectionSelect(database.name, collection)}>
                                                <input type="checkbox" checked={ selectedCollections.includes(collection) }/>
                                                <span className="collection-name">{ collection }</span>
                                            </div>
                                            <div className="collection-view">
                                                <i className="fa fa-eye view-icon" aria-hidden={ true } onClick={ this.showCollectionData.bind(this, collection) }></i>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            <div className="operations">
                                <div className="error-message">{ restoreErr }</div>
                                <div
                                    className="operation select-all"
                                    onClick={ () => this.props.toggleSelectAll(database.name, database.collections) }
                                >
                                    {
                                        selectedCollections.length != database.collections.length?"select all": "clear"
                                    }
                                </div>
                                <div
                                    className="operation restore"
                                    onClick={ this.restore.bind(this, database.name) }
                                >
                                    restore
                                </div>
                            </div>
                        </div>
                    )
                }
                {
                    (collection) &&
                    (
                        <Portal>
                            <ModalWrapper onClick={ this.showCollectionData.bind(this, null)}>
                                <CollectionViewer title={ collection} promise={ collections.getDataFromCollection(database.id, database.name, collection)}/>
                            </ModalWrapper>
                        </Portal>
                    )
                }
            </div>
        )
    }
}