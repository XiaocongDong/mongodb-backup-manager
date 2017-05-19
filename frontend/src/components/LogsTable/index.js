import React, { Component } from 'react';


export default class LogsTable extends Component {

    render() {

        const logs = this.props.logs;

        return (
            <div className="backup-logs-table">
                {
                    logs.length
                }
            </div>
        )
    }
}