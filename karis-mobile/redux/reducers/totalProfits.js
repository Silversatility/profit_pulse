import {
  LIST_TOTAL_PROFITS_REQUEST,
  LIST_TOTAL_PROFITS_SUCCESS,
  LIST_TOTAL_PROFITS_FAILED,
} from '../actions';

const initialState = {
  results: [],
  loading: false,
  params: {
    duration: 'year_to_date',
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LIST_TOTAL_PROFITS_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case LIST_TOTAL_PROFITS_SUCCESS: {
      return {
        ...action.payload,
        loading: false,
      };
    }
    case LIST_TOTAL_PROFITS_FAILED: {
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
