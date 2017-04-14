import Immutable from 'immutable';
import filtersAction from '../action/filtersAction';


const initialState = Immutable.Map({
    statuses: [],
    ids: []
});

const filtersReducer = (state=initialState, action) => {
    switch(action.type) {

        case filtersAction.set_statuses:
            const statuses = action.payload.value;
            return state.setIn(['statuses'], statuses);

        case filtersAction.set_ids:
            const ids = action.payload.value;
            return state.setIn(['ids'], ids);
        default:
            return state;
    }
};

export default filtersReducer;
