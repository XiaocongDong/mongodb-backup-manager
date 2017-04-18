const dataAction = {
    data_set: "DATA_SET",
    data_update: "DATA_UPDATE"
};

const dataActionBuilder = {

    set_data: (key, value) => {
        return { type: dataAction.data_set, payload: { key, value }}
    },

    update_data: (key, id, update) => {
        return { type: dataAction.data_update, payload: { key, value: { id, update } } }
    }

};

export default dataAction;
export { dataActionBuilder }