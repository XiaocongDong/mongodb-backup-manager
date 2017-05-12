import React, { Component } from 'react'
import BackupTitle from './backup.title';
import BackupSubtitle from './backup.subtitle';
import DatabasesContent from './databases-content';


export default class BackupDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            current: 0
        }
    }

    setCurrentTab(current) {
        this.setState(
            {
                current
            }
        )
    }

    render() {
        const props = this.props;
        const current = this.state.current;

        if(!props.backupConfig) {
            return null;
        }

        const contents = [
            <DatabasesContent
                originalDB={ props.originalDB }
                copyDBs={ props.copyDBs }
                id={ props.backupConfig.id }
            />
        ];

        return (
            <div className="backup-details">
                <BackupTitle backupConfig={ props.backupConfig }/>
                <BackupSubtitle current={ this.state.current } setCurrentTab={ this.setCurrentTab.bind(this) }/>
                { contents[current] }
            </div>
        )
    }
}