import React, { Component } from 'react';
import DraggableComponent from '../../draggable.component';
import Table from '../../templates/table';

const connectionsTableConfig = {
    head: [
        {
            text: "DB Server",
            width: "60%",
            key: "server"
        },
        {
            text: "username",
            width: "20%",
            key: "username"
        },
        {
            text: "auth DB",
            width: "20%",
            key: "authDB"
        }
    ]
};

export default class HistoryConnections extends DraggableComponent {

    constructor(props) {
        super(props);
    }

    setCredentials(index, backupConfig) {
        this.props.setCredentials(backupConfig);
    }

    render() {
        const props = this.props;
        const head = connectionsTableConfig.head;
        const body = props.connections;

        return (
            <div className="history-connections" data-draggable={ true } ref={ input => this.draggableDOM = input }>
                <div className="history-connections-header">
                    <div className="hint">double click to select connection</div>
                    <div className="close clickable" onClick={ props.onClickClose }>X</div>
                </div>
                <div className="connections-table">
                    <Table
                        head={ head }
                        body={ body }
                        handleRowDoubleClick={ this.setCredentials.bind(this) }
                    />
                </div>
            </div>
        )
    }

}