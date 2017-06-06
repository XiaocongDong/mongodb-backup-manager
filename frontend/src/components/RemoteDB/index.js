import React, { Component } from 'react';
import ModalWrapper from 'components/ModalWrapper';
import CollectionViewer from 'components/CollectionViewer';
import Portal from 'components/Portal';
import collectionsAPI from 'api/collections';


export default class RemoteDatabase extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: true,
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
        const { remoteDB, updating, backupConfig } = this.props;
        const { open, collection } = this.state;
        return (
            <div className="database-info original-database">
                <div className="header">
                    <div className="title">
                        { backupConfig.server }
                    </div>
                    <div className="db-refresh">
                        <div className="last-update-time">
                            {
                                updating && <span className="text">updating</span>
                            }
                        </div>
                        <i
                            className={"fa fa-refresh clickable" + (updating?" updating": "") }
                            aria-hidden={ true } onClick={ this.props.updateRemoteDB.bind(this, backupConfig.id) }
                            title="update original database"
                        >
                        </i>
                    </div>
                </div>
                {
                    remoteDB &&
                    (
                        <div className="database clickable">
                        <div className="database-name" onClick={ this.toggleOpen.bind(this) }>
                            { remoteDB.db }
                        </div>
                        {
                            open &&
                            (
                                <div className="database-details">
                                    {
                                        remoteDB.collections.map((collection, index) => {
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
                                                          promise={ collectionsAPI.getDataFromCollection(remoteDB.id, remoteDB.db, collection)}/>
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