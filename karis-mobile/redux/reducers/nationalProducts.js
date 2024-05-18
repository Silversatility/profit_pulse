import {
  LIST_NATIONAL_PRODUCTS_REQUEST,
  LIST_NATIONAL_PRODUCTS_SUCCESS,
  LIST_NATIONAL_PRODUCTS_FAILED,
} from '../actions';

const initialState = {
  count: 0,
  current_page: 1,
  next: null,
  previous: null,
  results: [],
  loading: false,
  params: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LIST_NATIONAL_PRODUCTS_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case LIST_NATIONAL_PRODUCTS_SUCCESS: {
      return {
        ...state,
        ...action.payload,
        loading: false,
      };
    }
    case LIST_NATIONAL_PRODUCTS_FAILED: {
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
