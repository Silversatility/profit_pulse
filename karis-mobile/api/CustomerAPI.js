import axios from 'axios';


export default class CustomerAPI {
  static listMinifiedCustomers = async (params = {}) => {
    const endpoint = 'customers/minified/';
    const response = await axios.get(endpoint, { params });
    return response;
  }

  static listCustomers = async (params = {}) => {
    const endpoint = 'customers/admin_list/';
    const response = await axios.get(endpoint, { params });
    return response;
  }

  static searchCustomers = async (params = {}) => {
    const endpoint = 'customers/search/';
    const response = await axios.get(endpoint, { params });
    return response;
  }

  static karisRevenues = async (params = {}) => {
    const endpoint = 'customers/revenue-reports/';
    const response = await axios.get(endpoint, { params });
    return response;
  }

  static customerRevenues = async (params = {}) => {
    const endpoint = 'customers/revenue-reports-2/';
    const response = await axios.get(endpoint, { params });
    return response;
  }

  static calendarEvents = async () => {
    const endpoint = 'customers/calendar/';
    const response = await axios.get(endpoint);
    return response;
  }

  static customerProfitabilities = async (params = {}) => {
    const endpoint = 'physicians/overview/';
    const response = await axios.get(endpoint, { params });
    return response;
  }

  static listNewsFeeds = async (params) => {
    const endpoint = 'newsfeeds/?limit=0';
    const response = await axios.get(endpoint, { params });
    return response;
  }
}
