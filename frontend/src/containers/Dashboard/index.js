import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as filterActionsCreators from 'actions/filters';
import filter from 'utility/filter';
import Filters from 'components/Filters';
import Empty from '../../components/Empty';
import Backups from 'components/Backups';


class Dashboard extends Component{

    render() {
        const props = this.props;

        if(props.empty) {
            return <Empty />;
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
                    <Backups
                        empty={ props.empty }
                        backupConfigs={ props.backupConfigs }
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const filters = state.get('filters');
    const statusFilter = filters.get('statuses');
    const idFilter = filters.get('ids');
    const backupConfigs = state.get('data').getIn(['backupConfigs', 'data']);
    const empty = (backupConfigs.length == 0);
    const idOpts = filter.getIdOptsWithStatus(backupConfigs, statusFilter);
    const filteredBackupConfigs = filter.backupConfigs(backupConfigs, filters);

    return {
        statusFilter,
        idFilter,
        empty,
        idOpts,
        backupConfigs: filteredBackupConfigs
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onStatusChange: value => {
            dispatch(filterActionsCreators.setIds([]));
            dispatch(filterActionsCreators.setStatuses(value));
        },
        onIdChange: value => dispatch(filterActionsCreators.setIds(value)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);