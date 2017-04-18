import { connect } from 'react-redux';
import { filterActionBuilder } from '../../action/filtersAction';
import DashBoard from '../../../ui/dashboard/dashboard';
import filter from '../../../utility/filter';


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
            dispatch(filterActionBuilder.set_ids([]));
            dispatch(filterActionBuilder.set_statuses(value));
        },
        onIdChange: value => dispatch(filterActionBuilder.set_ids(value)),
    }
};

const Container = connect(mapStateToProps, mapDispatchToProps)(DashBoard);

export default Container;