import React, { Component } from 'react';
import databases from '../../../api/databases';
import collections from '../../../api/collections'
import ModalWrapper from '../../modal.wrapper';
import CollectionViewer from './collection.viewer';
import Portal from '../../portal';


export default class BackupDatabase extends Component {

    constructor(props) {
        super(props);
        this.state ={
            collection: null,
        };
    }

    handleDelete(id, db) {
        databases.deleteCopyDB(id, db)
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
                <div className="database-header">
                    <div className="database-name">
                        { database.name }
                    </div>
                    <div className="time-wrapper">
                        <div className="time">
                            <span className="name" style={ { color: "#aaa"} }>created time</span>
                            <span className="value">
                                { database.createdTime }
                            </span>
                        </div>
                        {
                            (database.deletedTime) &&
                            (<div className="time">
                                <span className="name" style={ { color: "#ed281a"} }>deleted time</span>
                                <span className="value">
                                    { database.deletedTime }
                                </span>
                            </div>)
                        }
                    </div>
                    <div className="collection-number-wrapper">
                        <span className="name">collections</span>
                        <span className="number">{ database.collections.length }</span>
                    </div>
                    <div className="operations-wrapper">
                        <span className="operation button yes clickable" onClick={ () => this.props.toggleOpen(database.name) }>
                            details
                        </span>
                        <span className="operation button yes clickable">
                            restore
                        </span>
                        <span className="operation button no clickable" onClick={ this.handleDelete.bind(this, database.id, database.name) }>
                            delete
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
                                            <input type="checkbox"/>
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