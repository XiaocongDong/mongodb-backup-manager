import React, { Component } from 'react';
import BackupGrid from './backup.grid';


export default class BackupsView extends Component {
    render() {
        const props = this.props;

        return (
            <div className="backup-overview">
                {
                    props.backupConfigs.map((backupConfig, index) => {
                        return <BackupGrid key={ index } backupConfig={ backupConfig }/>
                    })
                }
            </div>
        )
    }
}