import {
  LIST_NEWS_FEEDS_REQUEST,
  LIST_NEWS_FEEDS_SUCCESS,
  LIST_NEWS_FEEDS_FAILED,
} from '../actions';

const initialState = {
  results: [],
  loading: true,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LIST_NEWS_FEEDS_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case LIST_NEWS_FEEDS_SUCCESS: {
      return {
        ...action.payload,
        loading: false,
      };
    }
    case LIST_NEWS_FEEDS_FAILED: {
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
