import { SELECT_DISPLAY } from '../constants';

const selectedDisplayReducer = (state = {
  name: '',
  group: '',
  desc: ''
}, action) => {
  switch (action.type) {
    case SELECT_DISPLAY:
      return {
        ...state,
        name: action.name,
        group: action.group,
        desc: action.desc
      };
    default:
  }
  return state;
};

export default selectedDisplayReducer;
