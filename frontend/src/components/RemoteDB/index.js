import React, { Component } from 'react';
import ModalWrapper from 'components/ModalWrapper';
import CollectionViewer from 'components/CollectionViewer';
import Portal from 'components/Portal';
import collectionsAPI from 'api/collections';
import dataLoader from 'api/dataLoader';


export default class RemoteDatabase extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            collection: null,
            updating: false,
        }
    }

    componentDidMount() {
        this.updateOriginalDB.call(this, this.props.id);
    }

    toggleOpen() {
        this.setState({
            open: !this.state.open
        })
    }

    showCollectionData(collection) {
        this.setState({ collection })
    }

    updateOriginalDB(id) {
        this.setState({
            updating: true
        });
        dataLoader.updateOriginalDB(id)
            .then(() => {
                this.setState({
                    updating: false
                })
            })
            .catch(err => {
                this.setState({updating: false});
                console.error(`Failed to update original db for ${ id } for ${ err.message }`);
            });
    }

    render() {
        const originalDB = this.props.originalDB;
        const id = this.props.id;
        const { open, collection, updating } = this.state;

        return (
            <div className="database-info original-database">
                <div className="header">
                    <div className="title">
                        remote
                    </div>
                    <div className="db-refresh">
                        <div className="last-update-time">
                            {
                                updating && <span className="text">updating</span>
                            }
                        </div>
                        <i
                            className={"fa fa-refresh clickable" + (updating?" updating": "") }
                            aria-hidden={ true } onClick={ this.updateOriginalDB.bind(this, id) }
                            title="update original database"
                        >
                        </i>
                    </div>
                </div>
                {
                    originalDB &&
                    (
                        <div className="database clickable">
                        <div className="database-name" onClick={ this.toggleOpen.bind(this) }>
                            { originalDB.db }
                        </div>
                        {
                            open &&
                            (
                                <div className="database-details">
                                    {
                                        originalDB.collections.map((collection, index) => {
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
                                        <CollectionViewer title={ collection}
                                                          promise={ collectionsAPI.getDataFromCollection(originalDB.id, originalDB.db, collection)}/>
                                    </ModalWrapper>
                                </Portal>
                            )
                        }
                    </div>
                    )
                }
            </div>
        )
    }
}