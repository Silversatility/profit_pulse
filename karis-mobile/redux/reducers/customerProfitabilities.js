import {
  LIST_CUSTOMER_PROFITABILITIES_REQUEST,
  LIST_CUSTOMER_PROFITABILITIES_SUCCESS,
  LIST_CUSTOMER_PROFITABILITIES_FAILED,
} from '../actions';

const initialState = {
  results: [],
  loading: false,
  params: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LIST_CUSTOMER_PROFITABILITIES_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case LIST_CUSTOMER_PROFITABILITIES_SUCCESS: {
      return {
        ...action.payload,
        loading: false,
      };
    }
    case LIST_CUSTOMER_PROFITABILITIES_FAILED: {
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
