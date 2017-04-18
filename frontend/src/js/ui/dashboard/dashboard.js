import React, { Component } from 'react';

import Filters from '../filters';
import EmptyContent from './empty.content';
import BackupsView from './backups.view';


export default class Dashboard extends Component{

    render() {
        const props = this.props;

        if(props.empty) {
            return <EmptyContent/>;
        }

        return (
            <div className="dashboard">
                <div className="side-bar">
                    <Filters
                        showStatus={ true }
                        showId={ true }
                        multiIds={ true }
                        statusFilter={ props.statusFilter }
                        idFilter={ props.idFilter }
                        idOpts={ props.idOpts }
                        backupConfigs={ props.backupConfigs }
                        onStatusChange={ props.onStatusChange }
                        onIdChange={ props.onIdChange }
                    />
                </div>
                <div className="content">
                    <BackupsView
                        empty={ props.empty }
                        backupConfigs={ props.backupConfigs }
                    />
                </div>
            </div>
        )
    }
}