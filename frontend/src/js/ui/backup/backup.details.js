import React, { Component } from 'react'
import { hashHistory } from 'react-router';
import Filters from '../filters';

export default class BackupDetails extends Component {

    handleFilterChange(data) {
        const id = data.value;
        hashHistory.push(`/backups/${ id }`);
    };

    render() {
        const props = this.props;

        if(!props.backupConfig) {
            return null;
        }

        const idsOpts = props.idOpts.map(id => {
            return {
                value: id,
                label: id
            }
        });

        const idValue = {
            value: props.backupConfig.id,
            label: props.backupConfig.id
        };

        return (
            <div className="backup-details">
                <div className="side-bar">
                    <Filters
                        showId={ true }
                        multiIds={ false }
                        clearableId={ false }
                        idFilter={ idValue }
                        options={ idsOpts }
                        onIdChange={ this.handleFilterChange }
                    />
                </div>
                <div className="content">
                    { props.backupConfig.id }
                </div>
            </div>
        )
    }
}