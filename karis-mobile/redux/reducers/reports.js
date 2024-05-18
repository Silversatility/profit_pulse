import {
  LIST_REPORTS_REQUEST,
  LIST_REPORTS_SUCCESS,
  LIST_REPORTS_FAILED,
} from '../actions';

const initialState = {
  results: {},
  loading: false,
  params: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LIST_REPORTS_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case LIST_REPORTS_SUCCESS: {
      return {
        ...action.payload,
        loading: false,
      };
    }
    case LIST_REPORTS_FAILED: {
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
