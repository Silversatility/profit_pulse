import { CustomerAPI } from '../../api';

export const LIST_MINIFIED_CUSTOMERS_REQUEST = 'LIST_MINIFIED_CUSTOMERS_REQUEST';
export const LIST_MINIFIED_CUSTOMERS_SUCCESS = 'LIST_MINIFIED_CUSTOMERS_SUCCESS';
export const LIST_MINIFIED_CUSTOMERS_FAILED = 'LIST_MINIFIED_CUSTOMERS_FAILED';


const listMinifiedCustomersRequest = () => ({ type: LIST_MINIFIED_CUSTOMERS_REQUEST });
const listMinifiedCustomersSuccess = (payload) => ({ type: LIST_MINIFIED_CUSTOMERS_SUCCESS, payload });
const listMinifiedCustomersFailed = (error) => ({ type: LIST_MINIFIED_CUSTOMERS_FAILED, error });

export const listMinifiedCustomers = (params = {}) => {
  return async (dispatch) => {
    const payload = {};
    dispatch(listMinifiedCustomersRequest());
    try {
      const response = await CustomerAPI.listMinifiedCustomers(params);
      payload.results = response.data;
      payload.params = params;
      dispatch(listMinifiedCustomersSuccess(payload));
    } catch (error) {
      dispatch(listMinifiedCustomersFailed(error.response.data));
    }
  };
};
