import { connect } from 'react-redux';
import filtersAction from '../../action/filtersAction';
import DashBoard from '../../../ui/dashboard/dashboard';
import filter from '../../../utility/filter';


const mapStateToProps = (state) => {
    const filters = state.get('filters');
    const statusFilters = filters.get('statuses');
    const idFilters = filters.get('ids');
    const backupConfigs = state.get('data').getIn(['backupConfigs', 'data']);
    const empty = (backupConfigs.length == 0);
    const idOpts = filter.getIdOpts(backupConfigs, statusFilters);
    const filteredBackupConfigs = filter.backupConfigs(backupConfigs, filters);

    return {
        statusFilters,
        idFilters,
        empty,
        idOpts,
        backupConfigs: filteredBackupConfigs
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setStatuses: value => {
            dispatch({type: filtersAction.set_ids, payload: { value: [] }});
            dispatch({type: filtersAction.set_statuses, payload: { value }});
        },
        setIds: (value) => dispatch({type: filtersAction.set_ids, payload: { value }}),
    }
};

const Container = connect(mapStateToProps, mapDispatchToProps)(DashBoard);

export default Container;