import React, { Component } from 'react';
import Backup from './Backup';


export default class BackupsView extends Component {
    render() {
        const props = this.props;

        return (
            <div className="backup-overview">
                {
                    props.backupConfigs.map((backupConfig, index) => {
                        return(<Backup
                            key={ index }
                            onClick={ props.setCurrentBackupId }
                            backupConfig={ backupConfig }
                        />);
                    })
                }
            </div>
        )
    }
}