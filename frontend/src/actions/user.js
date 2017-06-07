import * as actions from 'constants/userActions';

export const setUser = (user) => {
    return { type: actions.SET_USER, payload: { value: user } }
};
