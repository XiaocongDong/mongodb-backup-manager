import React, { Component } from 'react';
import { hashHistory } from 'react-router';

import Status from 'components/Status';

import colorPicker from 'utility/colorPicker';

export default class Backup extends Component {

    render() {
        const { backupConfig } = this.props;

        return (
            <div className="backup-grid-wrapper clickable" onClick={ () => hashHistory.push('/backups/' + backupConfig.id + '?tab=databases') }>
                <div className="backup-grid">
                    <div className="backup-grid-overview">
                        <div className="status-wrapper">
                            <Status status={ backupConfig.status }/>
                        </div>
                        <div className="numbers-wrapper">
                            {
                                Object.keys(backupConfig.statistics).map((key, index) => {
                                    return (
                                        <div className="number" style={ { color: colorPicker.getColorWithKey(key) } } key={ index }>
                                            <div className="name">{ key }</div>
                                            <div className="value">{ backupConfig.statistics[key] }</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className="backup-id">{ backupConfig.id }</div>
                    </div>
                    <div className="item">
                        <div className="key">server</div>
                        <div className="value server-value">{ backupConfig.server }</div>
                    </div>
                    <div className="item">
                        <div className="key">backup database</div>
                        <div className="value db-value">{ backupConfig.db }</div>
                    </div>
                    <div className="item">
                        <div className="key">last backup time</div>
                        <div className="value time-value">{ backupConfig.lastBackupTime || "N/A" }</div>
                        <div className="result" style={ {color: colorPicker.getColorWithResult(backupConfig.lastBackupResult)} }>{ backupConfig.lastBackupResult }</div>
                    </div>
                    <div className="item">
                        <div className="key">next backup time</div>
                        <div className="value time-value">{ backupConfig.nextBackupTime || "N/A"}</div>
                    </div>
                </div>
            </div>
        )
    }

};