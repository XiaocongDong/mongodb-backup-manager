import Immutable from 'immutable';
import filtersAction from '../action/filtersAction';


const initialState = Immutable.Map({
    status: null,
    id: null
});

const filtersReducer = (state=initialState, action) => {
    switch(action.type) {

        case filtersAction.set_status:
            const status = action.payload.value;
            return state.setIn(['status'], status);

        case filtersAction.set_id:
            const id = action.payload.value;
            return state.setIn(['id'], id);

        default:
            return state;
    }
};

export default filtersReducer;
