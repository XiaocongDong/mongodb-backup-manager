import React, { Component } from 'react';
import databases from '../../../../api/databases';
import collections from '../../../../api/collections'
import ModalWrapper from '../../../modal.wrapper';
import CollectionViewer from '../collection.viewer';
import Portal from '../../../portal';
import modalController from '../../../../utility/modal';


export default class CopyDatabase extends Component {

    constructor(props) {
        super(props);
        this.state ={
            collection: null,
        };
    }

    handleDelete(id, db, event) {
        event.stopPropagation();
        modalController.showModal({
            type: 'caution',
            title: `delete ${ db }`,
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

    handleCollectionSelect(collection, event) {
        event.preventDefault();
        event.stopPropagation()
    }

    showCollectionData(collection) {
        this.setState({ collection })
    }

    render() {
        const database = this.props.database;
        const { collection } = this.state;
        const open = this.props.open;

        return (
            <div className="database clickable">
                <div className="database-header" onClick={ this.props.toggleOpen.bind(this, database.name) }  >
                    <div className="database-name">
                        { database.name }
                    </div>
                    <div className="operations-wrapper">
                        <span className="operation clickable" onClick={ this.handleDelete.bind(this, database.id, database.name) }>
                            <i className="fa fa-trash"></i>
                        </span>
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
                                            className="database-collection"
                                            key={ index }
                                            onClick={ this.showCollectionData.bind(this, collection) }
                                        >
                                            <input type="checkbox" onChange={ this.handleCollectionSelect.bind(this, collection) }/>
                                            <span className="collection-name">{ collection }</span>
                                        </div>
                                    )
                                })
                            }
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