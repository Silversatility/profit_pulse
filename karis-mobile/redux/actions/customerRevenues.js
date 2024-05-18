import { CustomerAPI } from '../../api';

export const LIST_CUSTOMER_REVENUES_REQUEST = 'LIST_CUSTOMER_REVENUES_REQUEST';
export const LIST_CUSTOMER_REVENUES_SUCCESS = 'LIST_CUSTOMER_REVENUES_SUCCESS';
export const LIST_CUSTOMER_REVENUES_FAILED = 'LIST_CUSTOMER_REVENUES_FAILED';


const listCustomerRevenuesRequest = () => ({ type: LIST_CUSTOMER_REVENUES_REQUEST });
const listCustomerRevenuesSuccess = (payload) => ({ type: LIST_CUSTOMER_REVENUES_SUCCESS, payload });
const listCustomerRevenuesFailed = (error) => ({ type: LIST_CUSTOMER_REVENUES_FAILED, error });

export const listCustomerRevenues = (params = {}) => {
  let payload = {};
  let defaultParams = {
    limit: 0,
  };
  params = Object.assign({}, defaultParams, params);
  return async (dispatch) => {
    dispatch(listCustomerRevenuesRequest());
    try {
      const response = await CustomerAPI.customerRevenues(params);
      payload.results = response.data;
      payload.totalNetProfit = response.data.reduce((accumulator, current) => {
        return accumulator + current.net_profit;
      }, 0);
      payload.totalMargin = response.data.reduce((accumulator, current) => {
        return accumulator + current.margin;
      }, 0);
      payload.params = params;
      dispatch(listCustomerRevenuesSuccess(payload));
    } catch (error) {
      dispatch(listCustomerRevenuesFailed(error.response.data));
    }
  };
};
