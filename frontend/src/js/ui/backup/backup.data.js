import React, { Component } from 'react';


export default class BackupData extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { logs, copyDBs } = this.props;
        const current = this.state.current;
        const tabs = ["databases", "logs"];

        return (
            <div className="backup-data-wrapper">
                <div className="data-title">
                    databases
                </div>
            </div>
        )
    }

}