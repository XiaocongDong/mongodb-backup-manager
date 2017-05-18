import Immutable from 'immutable';
import * as actions from 'constants/filtersActions';


const initialState = Immutable.Map({
    statuses: [],
    ids: [],
    id: null
});

const filtersReducer = (state=initialState, action) => {
    switch(action.type) {

        case actions.SET_STATUSES:
            const statuses = action.payload.value;
            return state.setIn(['statuses'], statuses);

        case actions.SET_IDS:
            const ids = action.payload.value;
            return state.setIn(['ids'], ids);

        case actions.SET_ID:
            const id = action.payload.value;
            return state.setIn(['id'], id);

        default:
            return state;
    }
};

export default filtersReducer;
