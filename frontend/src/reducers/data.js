import Immutable from "immutable";
import * as actions from "constants/dataActions";
import object from 'utility/object';


const initData = Immutable.Map({
    backupConfigs: Immutable.Map({
        data: [],
    }),
    copyDBs: Immutable.Map({
        data: [],
    }),
    remoteDBs: Immutable.Map({
        data: []
    }),
    logs: Immutable.Map({
        data: []
    }),
    loaded: Immutable.Map({
        data: false
    })
});

const dataReducer = (state=initData, action) => {
    switch(action.type) {

        case actions.DATA_SET:
            return state.setIn([action.payload.key, "data"], action.payload.value);

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