import { SET_XY_LABEL_DECISON_ARRAY } from '../constants';

const xyDecisionArray = (state = [], action) => {
    switch (action.type) {
        case SET_XY_LABEL_DECISON_ARRAY:
            return action.payload;
        default:
    }
    return state;
};

export default xyDecisionArray;
