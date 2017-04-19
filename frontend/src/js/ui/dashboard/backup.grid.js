import React, { Component } from 'react';
import { hashHistory } from 'react-router';

import colorPicker from '../../utility/colorPicker';

export default class BackupGrid extends Component {

    render() {
        const { backupConfig } = this.props;
        const color = colorPicker.getColorWithStatus(backupConfig.status);

        return (
            <div className="backup-grid-wrapper clickable" onClick={ () => hashHistory.push('/backups/' + backupConfig.id) }>
                <div className="backup-grid">
                    <div className="backup-grid-overview">
                        <div className="status-wrapper">
                            <div className="status-ball" style={ { borderColor: color } }></div>
                            <div className="status" style={ { color } }>{ backupConfig.status }</div>
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