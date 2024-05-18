import {
  LIST_DISPENSE_HISTORIES_REQUEST,
  LIST_DISPENSE_HISTORIES_SUCCESS,
  LIST_DISPENSE_HISTORIES_FAILED,
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
    case LIST_DISPENSE_HISTORIES_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case LIST_DISPENSE_HISTORIES_SUCCESS: {
      return {
        ...state,
        ...action.payload,
        loading: false,
      };
    }
    case LIST_DISPENSE_HISTORIES_FAILED: {
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
