import React, { Component } from 'react';


export default class LogsTable extends Component {

    headers = ['time', 'level', 'content'];

    render() {

        const logs = this.props.logs;

        return (
            <div className="backup-logs-table">
                <div className="theader">

                </div>
                <div className="tbody">
                    
                </div>
            </div>
        )
    }
}