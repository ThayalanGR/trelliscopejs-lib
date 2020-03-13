import { SET_COG_DATA } from '../constants';

const cogDataReducer = (state = [], action) => {
  switch (action.type) {
    case SET_COG_DATA:
      return {
        ...action.payload
      };
    default:
  }
  return state;
};

export default cogDataReducer;
