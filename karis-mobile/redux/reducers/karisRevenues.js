import {
  LIST_KARIS_REVENUES_REQUEST,
  LIST_KARIS_REVENUES_SUCCESS,
  LIST_KARIS_REVENUES_FAILED,
} from '../actions';

const initialState = {
  results: [],
  loading: false,
  params: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LIST_KARIS_REVENUES_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case LIST_KARIS_REVENUES_SUCCESS: {
      return {
        ...action.payload,
        loading: false,
      };
    }
    case LIST_KARIS_REVENUES_FAILED: {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }
    default:
      return state;
  }
};
