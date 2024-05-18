import { UserAPI, OAuth2API } from '../../api';

export const RETRIEVE_ME_REQUEST = 'RETRIEVE_ME_REQUEST';
export const RETRIEVE_ME_SUCCESS = 'RETRIEVE_ME_SUCCESS';
export const RETRIEVE_ME_FAILED = 'RETRIEVE_ME_FAILED';
const retrieveMeRequest = () => ({ type: RETRIEVE_ME_REQUEST });
const retrieveMeSuccess = (payload) => ({ type: RETRIEVE_ME_SUCCESS, payload });
const retrieveMeFailed = (error) => ({ type: RETRIEVE_ME_FAILED, error });
export const retrieveMe = () => {
  return async (dispatch) => {
    dispatch(retrieveMeRequest());
    try {
      const response = await UserAPI.me();
      dispatch(retrieveMeSuccess(response.data));
    } catch (error) {
      dispatch(retrieveMeFailed(error.response.data));
    }
  };
};

export const UPDATE_ME_REQUEST = 'UPDATE_ME_REQUEST';
export const UPDATE_ME_SUCCESS = 'UPDATE_ME_SUCCESS';
export const UPDATE_ME_FAILED = 'UPDATE_ME_FAILED';
const updateMeRequest = () => ({ type: UPDATE_ME_REQUEST });
const updateMeSuccess = (payload) => ({ type: UPDATE_ME_SUCCESS, payload });
const updateMeFailed = (error) => ({ type: UPDATE_ME_FAILED, error });
export const updateAdminMe = (id, data) => {
  return async (dispatch) => {
    dispatch(updateMeRequest());
    try {
      const response = await UserAPI.updateAdminMe(id, data);
      dispatch(updateMeSuccess(response.data));
    } catch (error) {
      dispatch(updateMeFailed(error.response.data));
      throw error;
    }
  };
};

export const updateCustomerMe = (id, data) => {
  return async (dispatch) => {
    dispatch(updateMeRequest());
    try {
      const response = await UserAPI.updateCustomerMe(id, data);
      dispatch(updateMeSuccess(response.data));
    } catch (error) {
      dispatch(updateMeFailed(error.response.data));
      throw error;
    }
  };
};

export const CHANGE_PASSWORD_ME_REQUEST = 'CHANGE_PASSWORD_ME_REQUEST';
export const CHANGE_PASSWORD_ME_SUCCESS = 'CHANGE_PASSWORD_ME_SUCCESS';
export const CHANGE_PASSWORD_ME_FAILED = 'CHANGE_PASSWORD_ME_FAILED';
const changePasswordMeRequest = () => ({ type: CHANGE_PASSWORD_ME_REQUEST });
const changePasswordMeSuccess = (payload) => ({ type: CHANGE_PASSWORD_ME_SUCCESS, payload });
const changePasswordMeFailed = (error) => ({ type: CHANGE_PASSWORD_ME_FAILED, error });
export const changePasswordMe = (data) => {
  return async (dispatch) => {
    dispatch(changePasswordMeRequest());
    try {
      const response = await OAuth2API.changePassword(data);
      dispatch(changePasswordMeSuccess(response.data));
      return response;
    } catch (error) {
      dispatch(changePasswordMeFailed(error.response.data));
      throw error;
    }
  };
};

export const LOGOUT_ME = 'LOGOUT_ME';
export const logoutMe = () => ({ type: LOGOUT_ME });
