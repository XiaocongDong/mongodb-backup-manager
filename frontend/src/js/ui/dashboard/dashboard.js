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
                        statusFilter={ props.statusFilters }
                        idFilter={ props.idFilters }
                        idOpts={ props.idOpts }
                        backupConfigs={ props.backupConfigs }
                        setStatuses={ props.onStatusChange }
                        setIds={ props.onIdChange }
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