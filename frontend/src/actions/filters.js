import * as actions from 'constants/filtersActions';

export const setStatuses = (value) => {
    return { type: actions.SET_STATUSES, payload: { value } }
};

export const setIds = (value) => {
    return { type: actions.SET_IDS, payload: { value } }
};
