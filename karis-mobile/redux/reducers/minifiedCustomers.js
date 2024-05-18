import {
  LIST_MINIFIED_CUSTOMERS_REQUEST,
  LIST_MINIFIED_CUSTOMERS_SUCCESS,
  LIST_MINIFIED_CUSTOMERS_FAILED,
} from '../actions';

const initialState = {
  results: [],
  loading: false,
  params: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LIST_MINIFIED_CUSTOMERS_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case LIST_MINIFIED_CUSTOMERS_SUCCESS: {
      return {
        ...action.payload,
        loading: false,
      };
    }
    case LIST_MINIFIED_CUSTOMERS_FAILED: {
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
