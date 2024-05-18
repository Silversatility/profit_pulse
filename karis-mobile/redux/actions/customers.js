import { CustomerAPI } from '../../api';

export const LIST_CUSTOMERS_REQUEST = 'LIST_CUSTOMERS_REQUEST';
export const LIST_CUSTOMERS_SUCCESS = 'LIST_CUSTOMERS_SUCCESS';
export const LIST_CUSTOMERS_FAILED = 'LIST_CUSTOMERS_FAILED';


const listCustomersRequest = () => ({ type: LIST_CUSTOMERS_REQUEST });
const listCustomersSuccess = (payload) => ({ type: LIST_CUSTOMERS_SUCCESS, payload });
const listCustomersFailed = (error) => ({ type: LIST_CUSTOMERS_FAILED, error });

export const listCustomers = (params = {}) => {
  let payload = {};
  let defaultParams = {
    limit: 0,
  };
  params = Object.assign({}, defaultParams, params);
  return async (dispatch) => {
    dispatch(listCustomersRequest());
    try {
      if (params.text__contains) {
        const response = await CustomerAPI.searchCustomers(params);
        payload.results = response.data;
        payload.params = params;
        dispatch(listCustomersSuccess(payload));
      } else {
        const response = await CustomerAPI.listCustomers(params);
        payload.results = response.data;
        payload.params = params;
        dispatch(listCustomersSuccess(payload));
      }
    } catch (error) {
      dispatch(listCustomersFailed(error.response.data));
    }
  };
};
