import { DispenseHistoryAPI } from '../../api';

export const LIST_MY_PRODUCTS_REQUEST = 'LIST_MY_PRODUCTS_REQUEST';
export const LIST_MY_PRODUCTS_SUCCESS = 'LIST_MY_PRODUCTS_SUCCESS';
export const LIST_MY_PRODUCTS_FAILED = 'LIST_MY_PRODUCTS_FAILED';


const listMyProductsRequest = () => ({ type: LIST_MY_PRODUCTS_REQUEST });
const listMyProductsSuccess = (payload) => ({ type: LIST_MY_PRODUCTS_SUCCESS, payload });
const listMyProductsFailed = (error) => ({ type: LIST_MY_PRODUCTS_FAILED, error });

export const listMyProducts = (params = {}) => {
  let defaultParams = {
    duration: 'year_to_date',
    ordering: '-created',
    page: 1,
    page_size: 10,
  };
  params = Object.assign({}, defaultParams, params);
  return async (dispatch) => {
    dispatch(listMyProductsRequest());
    try {
      const response = await DispenseHistoryAPI.topProducts(params);
      response.data.params = params;
      dispatch(listMyProductsSuccess(response.data));
    } catch (error) {
      dispatch(listMyProductsFailed(error.response.data));
    }
  };
};
