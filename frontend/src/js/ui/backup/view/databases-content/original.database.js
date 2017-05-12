import React, { Component } from 'react';
import ModalWrapper from '../../../modal.wrapper';
import CollectionViewer from '../collection.viewer';
import Portal from '../../../portal';
import collectionsAPI from '../../../../api/collections';


export default class OriginalDatabase extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            collection: null,
        }
    }

    toggleOpen() {
        this.setState({
            open: !this.state.open
        })
    }

    showCollectionData(collection) {
        this.setState({ collection })
    }

    render() {
        const originalDB = this.props.originalDB;
        const { db, collections } = originalDB;
        const { open, collection } = this.state;

        return (
            <div className="database-info original-database">
                <div className="header">
                    remote
                </div>
                <div className="database clickable">
                    <div className="database-name" onClick={ this.toggleOpen.bind(this) }>
                        { db }
                    </div>
                    {
                        open &&
                        (
                            <div className="database-details">
                                {
                                    collections.map((collection, index) => {
                                        return (
                                            <div
                                                className="database-collection"
                                                key={ index }
                                                onClick={ this.showCollectionData.bind(this, collection) }
                                            >
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
                                    <CollectionViewer title={ collection} promise={ collectionsAPI.getDataFromCollection(originalDB.id, originalDB.db, collection)}/>
                                </ModalWrapper>
                            </Portal>
                        )
                    }
                </div>
            </div>
        )
    }
}