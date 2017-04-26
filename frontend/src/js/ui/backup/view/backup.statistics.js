import React, { Component } from 'react';


export default class Statistics extends Component {

    render() {
        const backupConfig = this.props.backupConfig;

        return (
            <div className="statistics">
                <div className="statistics-header">
                    statistics
                </div>
                <div className="item">
                    <div className="key">server</div>
                    <div className="value">{ backupConfig.server }</div>
                </div>
                <div className="item">
                    <div className="key">backup database</div>
                    <div className="value">{ backupConfig.db }</div>
                </div>
                <div className="item">
                    <div className="key">created time</div>
                    <div className="value">{ backupConfig.createdTime }</div>
                </div>
                {
                    (backupConfig.lastBackupTime) &&
                    (
                        <div className="item">
                            <div className="key">last backup time</div>
                            <div className="value">{ backupConfig.lastBackupTime }</div>
                        </div>
                    )
                }
                {
                    (backupConfig.lastBackupResult) &&
                    (
                        <div className="item">
                            <div className="key">last backup result</div>
                            <div className="value">{ backupConfig.lastBackupResult }</div>
                        </div>
                    )
                }
                {
                    (backupConfig.nextBackupTime) &&
                    (
                        <div className="item">
                            <div className="key">next backup time</div>
                            <div className="value">{ backupConfig.nextBackupTime }</div>
                        </div>
                    )
                }
            </div>
        )
    }
}