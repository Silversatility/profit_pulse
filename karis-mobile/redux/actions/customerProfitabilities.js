import { CustomerAPI } from '../../api';

export const LIST_CUSTOMER_PROFITABILITIES_REQUEST = 'LIST_CUSTOMER_PROFITABILITIES_REQUEST';
export const LIST_CUSTOMER_PROFITABILITIES_SUCCESS = 'LIST_CUSTOMER_PROFITABILITIES_SUCCESS';
export const LIST_CUSTOMER_PROFITABILITIES_FAILED = 'LIST_CUSTOMER_PROFITABILITIES_FAILED';


const listCustomerProfitabilitiesRequest = () => ({ type: LIST_CUSTOMER_PROFITABILITIES_REQUEST });
const listCustomerProfitabilitiesSuccess = (payload) => ({ type: LIST_CUSTOMER_PROFITABILITIES_SUCCESS, payload });
const listCustomerProfitabilitiesFailed = (error) => ({ type: LIST_CUSTOMER_PROFITABILITIES_FAILED, error });

export const listCustomerProfitabilities = (params = {}) => {
  let payload = {};
  let defaultParams = {
    limit: 0,
  };
  params = Object.assign({}, defaultParams, params);
  return async (dispatch) => {
    dispatch(listCustomerProfitabilitiesRequest());
    try {
      const response = await CustomerAPI.customerProfitabilities(params);
      payload.params = params;
      payload.results = response.data;
      dispatch(listCustomerProfitabilitiesSuccess(payload));
    } catch (error) {
      dispatch(listCustomerProfitabilitiesFailed(error.response.data));
    }
  };
};
