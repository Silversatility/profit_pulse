import { DispenseHistoryAPI } from '../../api';


export const LIST_TOTAL_PROFITS_REQUEST = 'LIST_TOTAL_PROFITS_REQUEST';
export const LIST_TOTAL_PROFITS_SUCCESS = 'LIST_TOTAL_PROFITS_SUCCESS';
export const LIST_TOTAL_PROFITS_FAILED = 'LIST_TOTAL_PROFITS_FAILED';
const listTotalProfitsRequest = () => ({ type: LIST_TOTAL_PROFITS_REQUEST });
const listTotalProfitsSuccess = (payload) => ({ type: LIST_TOTAL_PROFITS_SUCCESS, payload });
const listTotalProfitsFailed = (error) => ({ type: LIST_TOTAL_PROFITS_FAILED, error });


export const listAdminTotalProfits = (params = { duration: 'year_to_date' }) => {
  const payload = {};
  return async (dispatch) => {
    dispatch(listTotalProfitsRequest());
    try {
      const response = await DispenseHistoryAPI.adminTotalProfits(params);
      payload.results = response.data;
      payload.params = params;
      dispatch(listTotalProfitsSuccess(payload));
    } catch (error) {
      dispatch(listTotalProfitsFailed(error.response.data));
    }
  };
};

export const listCustomerTotalProfits = (params = { duration: 'year_to_date' }) => {
  const payload = {};
  return async (dispatch) => {
    dispatch(listTotalProfitsRequest());
    try {
      const response = await DispenseHistoryAPI.customerTotalProfits(params);
      payload.results = response.data;
      payload.params = params;
      dispatch(listTotalProfitsSuccess(payload));
    } catch (error) {
      dispatch(listTotalProfitsFailed(error.response.data));
    }
  };
};
