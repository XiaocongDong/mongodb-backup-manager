import Immutable from 'immutable';
import filtersAction from '../action/filtersAction';


const initialState = Immutable.Map({
    statuses: [],
    ids: [],
    id: null
});

const filtersReducer = (state=initialState, action) => {
    switch(action.type) {

        case filtersAction.set_statuses:
            const statuses = action.payload.value;
            return state.setIn(['statuses'], statuses);

        case filtersAction.set_ids:
            const ids = action.payload.value;
            return state.setIn(['ids'], ids);

        case filtersAction.set_id:
            const id = action.payload.value;
            return state.setIn(['id'], id);

        default:
            return state;
    }
};

export default filtersReducer;
