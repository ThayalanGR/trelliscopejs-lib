import { SET_PBI_CALLBACK } from '../constants';

const pbiCallBackReducer = (state = {
  pbiCallBack: null
}, action) => {
  switch (action.type) {
    case SET_PBI_CALLBACK:
      return {
        ...state,
        pbiCallBack: action.payload
      };
    default:
  }
  return state;
};

export default pbiCallBackReducer;
