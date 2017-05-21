import React, { Component } from 'react';
import Draggable from 'components/Draggable';
import object from 'utility/object';


class HistoryHeader extends  Draggable {

    render() {
        const ids = this.props.selectedIds;

        return (
            <div className="history-connections-header"  ref={ input => this.draggableDOM = input }>
                <div
                    className={"select clickable" + (ids.length != 1? " disabled": "")}
                    onClick={ this.props.selectConnection }
                >
                    select
                </div>
                <div
                    className={"delete clickable" + (ids.length == 0? " disabled": "")}
                    onClick={ this.props.deleteConnections }
                >
                    delete
                </div>
                <i className="fa fa-times close clickable" onClick={ this.props.onClickClose } aria-hidden={ true }></i>
            </div>
        )
    }

}

const headConfig = [
    {
        'type': 'input',
        'width': '5%'
    },
    {
        'type': 'text',
        'key': 'server',
        'text': 'DB Server',
        'width': '50%'
    },
    {
        'type': 'text',
        'key': 'username',
        'text': 'user',
        'width': '20%'
    },
    {
        'type': 'text',
        'text': 'auth DB',
        'key': 'authDB',
        'width': '25%'
    }
];

export default class History extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedIds: []
        };
    }
    
    setCredentials(backupConfig) {
        this.props.setCredentials(backupConfig);
    }

    toggleSingleId(id) {
        let selectedIds = object.clone(this.state.selectedIds);

        if(!selectedIds.includes(id)) {
            selectedIds.push(id);
        }else {
            selectedIds = selectedIds.filter(selectedId => selectedId != id);
        }

        this.setState({
            selectedIds
        });
    }

    toggleSelectAll(event) {
        const checked = event.target.checked;
        const connections = this.props.connections;

        let selectedIds = [];
        if(checked) {
            selectedIds = connections.map(conn => conn.id);
        }

        this.setState({
            selectedIds
        })
    }

    deleteConnections() {
        const selectedIds = this.state.selectedIds;

        if(selectedIds.length < 1) {
            return;
        }

        this.props.deleteConnections(selectedIds);
    }

    selectConnection() {
        const selectedIds = this.state.selectedIds;

        if(selectedIds.length != 1) {
            return;
        }

        const id = selectedIds[0];
        const connection = object.filterArrWithKeyValue('id', id, this.props.connections)[0];
        this.props.setCredentials(connection);
    }

    render() {
        const props = this.props;
        const connections = props.connections;
        const selectedIds = this.state.selectedIds;

        let headElements = headConfig.map((head, index) => {
            return (
                <div className="td" key={ index } style={ { width: head.width } }>
                    {
                        (head.type == 'text')?head.text:
                            (<input
                                type="checkbox"
                                onChange={ this.toggleSelectAll.bind(this) }
                            />)
                    }
                </div>
            )
        });

        headElements = <div className={"tr"}>{ headElements }</div>;

        let bodyElements = connections.map((conn, index) => {

            let connDOM = headConfig.map((head, i) => {
                return (
                    <div className="td" key={ i } style={ { width: head.width } }>
                        {
                            (head.type == 'text')? conn[head.key]:
                                (<input
                                    type="checkbox"
                                    checked={ selectedIds.includes(conn.id) }
                                />)
                        }
                    </div>
                )
            });

            connDOM = (
                        <div 
                                className={"tr clickable" + (selectedIds.includes(conn.id)?" selected": "") } 
                                key={ index }
                                onClick={ this.toggleSingleId.bind(this, conn.id) }
                        >
                            { connDOM }
                        </div>
                    )

            return connDOM;
        });

        return (
            <div className="history-connections" data-draggable={ true } >
                <div className="connections-table">
                    <HistoryHeader
                        selectedIds= { selectedIds }
                        onClickClose={ this.props.onClickClose }
                        deleteConnections={ this.deleteConnections.bind(this) }
                        selectConnection={ this.selectConnection.bind(this) }
                    />
                    <div className="table">
                        <div className="thead">
                            { headElements }
                        </div>
                        <div className="tbody">
                            { bodyElements }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}