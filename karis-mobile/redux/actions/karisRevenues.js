import { CustomerAPI } from '../../api';

export const LIST_KARIS_REVENUES_REQUEST = 'LIST_KARIS_REVENUES_REQUEST';
export const LIST_KARIS_REVENUES_SUCCESS = 'LIST_KARIS_REVENUES_SUCCESS';
export const LIST_KARIS_REVENUES_FAILED = 'LIST_KARIS_REVENUES_FAILED';


const listKarisRevenuesRequest = () => ({ type: LIST_KARIS_REVENUES_REQUEST });
const listKarisRevenuesSuccess = (payload) => ({ type: LIST_KARIS_REVENUES_SUCCESS, payload });
const listKarisRevenuesFailed = (error) => ({ type: LIST_KARIS_REVENUES_FAILED, error });

export const listKarisRevenues = (params = {}) => {
  let payload = {};
  let defaultParams = {
    limit: 0,
  };
  params = Object.assign({}, defaultParams, params);
  return async (dispatch) => {
    dispatch(listKarisRevenuesRequest());
    try {
      const response = await CustomerAPI.karisRevenues(params);
      payload.results = response.data;
      payload.totalTotalRevenue = response.data.reduce((accumulator, current) => {
        return accumulator + current.total_revenue;
      }, 0);
      payload.params = params;
      dispatch(listKarisRevenuesSuccess(payload));
    } catch (error) {
      dispatch(listKarisRevenuesFailed(error.response.data));
    }
  };
};
