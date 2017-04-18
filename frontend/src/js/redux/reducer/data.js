import Immutable from "immutable";
import dataAction from '../action/data';
import object from '../../utility/object';


const initData = Immutable.Map({
    backupConfigs: Immutable.Map({
        data: [],
        loaded: false
    }),
    copyDBs: Immutable.Map({
        data: [],
        loaded: false
    })
});

const data = (state=initData, action) => {
    switch(action.type) {
        case dataAction.data_set:
            const s1 = state.setIn([action.payload.key, "data"], action.payload.value);
            if(state.get(action.payload.key).has("loaded")) {
                return s1.setIn([action.payload.key, "loaded"], true);
            }
            return s1;

        case dataAction.data_update:
            const payload = action.payload;
            const data = state.getIn([payload.key, "data"]);
            const updateData = object.updateArrWithKeyValue("id", payload.value.id, data, payload.value.update );
            return state.setIn([payload.key, "data"], updateData);

        default:
            return state;
    }
};

export default data;