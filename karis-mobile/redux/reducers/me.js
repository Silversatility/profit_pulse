import {
  RETRIEVE_ME_REQUEST,
  RETRIEVE_ME_SUCCESS,
  RETRIEVE_ME_FAILED,
  UPDATE_ME_REQUEST,
  UPDATE_ME_SUCCESS,
  UPDATE_ME_FAILED,
  CHANGE_PASSWORD_ME_REQUEST,
  CHANGE_PASSWORD_ME_SUCCESS,
  CHANGE_PASSWORD_ME_FAILED,
  LOGOUT_ME,
} from '../actions';

const initialState = {
  data: {},
  loading: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case RETRIEVE_ME_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case RETRIEVE_ME_SUCCESS: {
      return {
        ...action.payload,
        loading: false,
      };
    }
    case RETRIEVE_ME_FAILED: {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }
    case UPDATE_ME_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case UPDATE_ME_SUCCESS: {
      return {
        ...action.payload,
        loading: false,
      };
    }
    case UPDATE_ME_FAILED: {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }
    case CHANGE_PASSWORD_ME_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case CHANGE_PASSWORD_ME_SUCCESS: {
      return {
        ...state,
        loading: false,
      };
    }
    case CHANGE_PASSWORD_ME_FAILED: {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }
    case LOGOUT_ME: {
      return {
        ...initialState,
      };
    }
    default:
      return state;
  }
};
