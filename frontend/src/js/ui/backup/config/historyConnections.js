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

    render() {
        const props = this.props;

        return (
            <div className="history-connections" data-draggable={ true } ref={ input => this.draggableDOM = input }>
                <div className="history-connections-operations">
                    <div className="close clickable" onClick={ props.onClickClose }>X</div>
                </div>
                <div className="connections-table">
                    <Table
                        head={ connectionsTableConfig.head }
                        body={ props.connections }
                    />
                </div>
                <div className="connections-operations">
                    <div className="button connect" onClick={ props.onClickConnect}>connect</div>
                </div>
            </div>
        )
    }

}