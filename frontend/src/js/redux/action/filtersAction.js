const filtersAction = {
    set_statuses: 'SET_STATUSES',
    set_ids: 'SET_IDS'
};

const filterActionBuilder = {

    set_statuses: (value) => {
        return { type: filtersAction.set_statuses, payload: { value } }
    },

    set_ids: (value) => {
        return { type: filtersAction.set_statuses, payload: { value } }
    }

};

export default filtersAction;
export { filterActionBuilder }