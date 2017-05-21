import React, { Component } from 'react';
import object from 'utility/object';
import dataLoader from 'api/dataLoader';
import socket from 'api/socket';

import LogsTable from 'components/LogsTable';


export default class LogsContent extends Component {

    constructor(props) {
        super(props);
        this.eventName = props.id + '-logs';
    }

    componentDidMount() {
        // start to load all the related logs of this id when the logs component mounted,
        // instead of loading all the data like backupConfigs to save space in the browser
        const id = this.props.id;

        dataLoader.loadLogsWithId(id);
        // start to only listen to the logs change of this backup
        socket.startListenLogsChanges(this.eventName)
    }

    componentWillUnmount() {
        // remove log change listener
        socket.stopListenChanges(this.eventName);
    }

   
    render() {
        const logs = this.props.logs;

        return (
            <div className="logs-content">
                <LogsTable
                    logs={ logs }
                />
            </div>
        )
    }
}
