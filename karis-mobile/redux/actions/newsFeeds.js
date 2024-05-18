import { CustomerAPI } from '../../api';

export const LIST_NEWS_FEEDS_REQUEST = 'LIST_NEWS_FEEDS_REQUEST';
export const LIST_NEWS_FEEDS_SUCCESS = 'LIST_NEWS_FEEDS_SUCCESS';
export const LIST_NEWS_FEEDS_FAILED = 'LIST_NEWS_FEEDS_FAILED';


const listNewsFeedsRequest = () => ({ type: LIST_NEWS_FEEDS_REQUEST });
const listNewsFeedsSuccess = (payload) => ({ type: LIST_NEWS_FEEDS_SUCCESS, payload });
const listNewsFeedsFailed = (error) => ({ type: LIST_NEWS_FEEDS_FAILED, error });

export const listNewsFeeds = () => {
  let payload = {};
  return async (dispatch) => {
    dispatch(listNewsFeedsRequest());
    try {
      const response = await CustomerAPI.listNewsFeeds();
      payload.results = response.data;
      dispatch(listNewsFeedsSuccess(payload));
    } catch (error) {
      dispatch(listNewsFeedsFailed(error.response.data));
    }
  };
};
