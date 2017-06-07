import Immutable from 'immutable';
import * as actions from 'constants/userActions';


const initialState = Immutable.Map({
    user: Immutable.Map(),
    role: Immutable.Map()
});

const userReducer = (state=initialState, action) => {
    switch(action.type) {

        case actions.SET_USER:
            const user = action.payload.value;
            return state.set('user', Immutable.fromJS(user));

        default:
            return state;
    }
};

export default userReducer;
