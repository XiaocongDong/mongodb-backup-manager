import { connect } from 'react-redux';
import filtersAction from '../action/filtersAction';
import Filters from '../../ui/filters';


const mapStateToProps = (state) => {
    return {
        status: state.get('filters').get('status'),
        id: state.get('filters').get('id')
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setStatus: (value) => dispatch({type: filtersAction.set_status, payload: { value }}),
        setId: (value) => dispatch({type: filtersAction.set_id, payload: { value }}),
    }
};

const Container = connect(mapStateToProps, mapDispatchToProps)(Filters);

export default Container;