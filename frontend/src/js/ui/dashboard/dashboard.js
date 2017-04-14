import React, { Component } from 'react';

import Filters from '../filters';
import BackupsView from './backups.view';


export default class Dashboard extends Component{

    render() {
        const props = this.props;

        return (
            <div className="dashboard">
                <div className="side-bar">
                    <Filters
                        showStatus={ true }
                        showId={ true }
                        multiIds={ true }
                        statusFilter={ props.statusFilters }
                        idFilter={ props.idFilters }
                        idOpts={ props.idOpts }
                        backupConfigs={ props.backupConfigs }
                        setStatuses={ props.setStatuses }
                        setIds={ props.setIds }
                    />
                </div>
                <div className="content">
                    <BackupsView
                        backupConfigs={ props.backupConfigs }
                    />
                </div>
            </div>
        )
    }
}