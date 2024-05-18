import { DispenseHistoryAPI } from '../../api';

export const LIST_DISPENSE_HISTORIES_REQUEST = 'LIST_DISPENSE_HISTORIES_REQUEST';
export const LIST_DISPENSE_HISTORIES_SUCCESS = 'LIST_DISPENSE_HISTORIES_SUCCESS';
export const LIST_DISPENSE_HISTORIES_FAILED = 'LIST_DISPENSE_HISTORIES_FAILED';


const listDispenseHistoriesRequest = () => ({ type: LIST_DISPENSE_HISTORIES_REQUEST });
const listDispenseHistoriesSuccess = (payload) => ({ type: LIST_DISPENSE_HISTORIES_SUCCESS, payload });
const listDispenseHistoriesFailed = (error) => ({ type: LIST_DISPENSE_HISTORIES_FAILED, error });

export const listDispenseHistories = (params = {}) => {
  let defaultParams = {
    page: 1,
    page_size: 10,
  };
  params = Object.assign({}, defaultParams, params);
  return async (dispatch) => {
    dispatch(listDispenseHistoriesRequest());
    try {
      const response = await DispenseHistoryAPI.dispenseHistory(params);
      response.data.params = params;
      dispatch(listDispenseHistoriesSuccess(response.data));
    } catch (error) {
      dispatch(listDispenseHistoriesFailed(error.response.data));
    }
  };
};
