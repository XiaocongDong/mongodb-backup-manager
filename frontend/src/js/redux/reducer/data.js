import Immutable from "immutable";
import dataAction from '../action/data';

const initData = Immutable.Map({
    backupConfigs: Immutable.Map({
        data: [],
        loaded: false
    })
});

const data = (state=initData, action) => {
    switch(action.type) {
        case dataAction.data_set:
            const s1 = state.setIn([action.payload.key, "data"], action.payload.value);
            if(state.get("backupConfigs").has("loaded")) {
                return s1.setIn([action.payload.key, "loaded"], true);
            }
            return s1;
        default:
            return state;
    }
};

export default data;