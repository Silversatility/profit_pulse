import { DispenseHistoryAPI } from '../../api';

export const LIST_NATIONAL_PRODUCTS_REQUEST = 'LIST_NATIONAL_PRODUCTS_REQUEST';
export const LIST_NATIONAL_PRODUCTS_SUCCESS = 'LIST_NATIONAL_PRODUCTS_SUCCESS';
export const LIST_NATIONAL_PRODUCTS_FAILED = 'LIST_NATIONAL_PRODUCTS_FAILED';


const listNationalProductsRequest = () => ({ type: LIST_NATIONAL_PRODUCTS_REQUEST });
const listNationalProductsSuccess = (payload) => ({ type: LIST_NATIONAL_PRODUCTS_SUCCESS, payload });
const listNationalProductsFailed = (error) => ({ type: LIST_NATIONAL_PRODUCTS_FAILED, error });

export const listNationalProducts = (params = {}) => {
  let defaultParams = {
    duration: 'year_to_date',
    ordering: '-created',
    page: 1,
    page_size: 10,
  };
  params = Object.assign({}, defaultParams, params);
  return async (dispatch) => {
    dispatch(listNationalProductsRequest());
    try {
      const response = await DispenseHistoryAPI.topProducts(params);
      response.data.params = params;
      dispatch(listNationalProductsSuccess(response.data));
    } catch (error) {
      dispatch(listNationalProductsFailed(error.response.data));
    }
  };
};
