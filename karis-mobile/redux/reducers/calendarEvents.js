import {
  LIST_CALENDAR_EVENTS_REQUEST,
  LIST_CALENDAR_EVENTS_SUCCESS,
  LIST_CALENDAR_EVENTS_FAILED,
} from '../actions';

const initialState = {
  results: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LIST_CALENDAR_EVENTS_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case LIST_CALENDAR_EVENTS_SUCCESS: {
      return {
        ...action.payload,
        loading: false,
      };
    }
    case LIST_CALENDAR_EVENTS_FAILED: {
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
