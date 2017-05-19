import Immutable from "immutable";
import * as actions from "constants/dataActions";
import object from 'utility/object';


const initData = Immutable.Map({
    backupConfigs: Immutable.Map({
        data: [],
        loaded: false
    }),
    copyDBs: Immutable.Map({
        data: [],
        loaded: false
    }),
    remoteDBs: Immutable.Map({
        data: []
    }),
    logs: Immutable.Map({
        data: []
    })
});

const dataReducer = (state=initData, action) => {
    switch(action.type) {

        case actions.DATA_SET:
            const s1 = state.setIn([action.payload.key, "data"], action.payload.value);
            if(state.get(action.payload.key).has("loaded")) {
                return s1.setIn([action.payload.key, "loaded"], true);
            }

            return s1;

        case actions.DATA_UPDATE:
            const payload = action.payload;
            const data = state.getIn([payload.key, "data"]);
            const updateData = object.updateArrWithKeyValue("id", payload.value.id, data, payload.value.update );
            return state.setIn([payload.key, "data"], updateData);

        default:
            return state;
    }
};

export default dataReducer;