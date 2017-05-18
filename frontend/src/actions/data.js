import * as actions from 'constants/dataActions';

export const setData = (key, value) => {
    return { type: actions.DATA_SET, payload: { key, value }}
};

export const updateData = (key, id, update) => {
    return { type: actions.DATA_UPDATE, payload: { key, value: { id, update } } }
};
