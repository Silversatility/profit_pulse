import { DispenseHistoryAPI } from '../../api';


export const LIST_REPORTS_REQUEST = 'LIST_REPORTS_REQUEST';
export const LIST_REPORTS_SUCCESS = 'LIST_REPORTS_SUCCESS';
export const LIST_REPORTS_FAILED = 'LIST_REPORTS_FAILED';
const listReportsRequest = () => ({ type: LIST_REPORTS_REQUEST });
const listReportsSuccess = (payload) => ({ type: LIST_REPORTS_SUCCESS, payload });
const listReportsFailed = (error) => ({ type: LIST_REPORTS_FAILED, error });

export const listAdminReports = (params = { duration: 'year_to_date' }) => {
  const payload = {};
  return async (dispatch) => {
    dispatch(listReportsRequest());
    try {
      const response = await DispenseHistoryAPI.adminReports(params);
      payload.results = response.data;
      payload.params = params;
      dispatch(listReportsSuccess(payload));
    } catch (error) {
      dispatch(listReportsFailed(error.response.data));
    }
  };
};

export const listCustomerReports = (params = { duration: 'year_to_date' }) => {
  const payload = {};
  return async (dispatch) => {
    dispatch(listReportsRequest());
    try {
      const response = await DispenseHistoryAPI.customerReports(params);
      payload.results = response.data;
      payload.params = params;
      dispatch(listReportsSuccess(payload));
    } catch (error) {
      dispatch(listReportsFailed(error.response.data));
    }
  };
};
