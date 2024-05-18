import { DispenseHistoryAPI } from '../../api';

export const LIST_PRODUCTS_REQUEST = 'LIST_PRODUCTS_REQUEST';
export const LIST_PRODUCTS_SUCCESS = 'LIST_PRODUCTS_SUCCESS';
export const LIST_PRODUCTS_FAILED = 'LIST_PRODUCTS_FAILED';


const listProductsRequest = () => ({ type: LIST_PRODUCTS_REQUEST });
const listProductsSuccess = (payload) => ({ type: LIST_PRODUCTS_SUCCESS, payload });
const listProductsFailed = (error) => ({ type: LIST_PRODUCTS_FAILED, error });

export const listProducts = (params = {}) => {
  let defaultParams = {
    duration: 'year_to_date',
    ordering: '-created',
    page: 1,
    page_size: 10,
  };
  params = Object.assign({}, defaultParams, params);
  return async (dispatch) => {
    dispatch(listProductsRequest());
    try {
      const response = await DispenseHistoryAPI.topProducts(params);
      response.data.params = params;
      dispatch(listProductsSuccess(response.data));
    } catch (error) {
      dispatch(listProductsFailed(error.response.data));
    }
  };
};
