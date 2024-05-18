import axios from 'axios';


export default class DispenseHistoryAPI {
  static adminReports = async (params = { duration: 'year_to_date' }) => {
    const endpoint = 'dispense-histories/admin-reports/';
    const response = await axios.get(endpoint, { params });
    return response;
  }

  static adminTotalProfits = async (params = { duration: 'year_to_date' }) => {
    const endpoint = 'dispense-histories/admin-total-profits/';
    const response = await axios.get(endpoint, { params });
    return response;
  }

  static topProducts = async (params = {}) => {
    let endpoint;
    endpoint = 'products/top/';
    const response = await axios.get(endpoint, { params });
    return response;
  }

  static dispenseHistory = async (params = {}) => {
    let endpoint;
    endpoint = 'dispense-histories/dated/';
    const response = await axios.get(endpoint, { params });
    return response;
  }

  static customerReports = async (params = { duration: 'year_to_date' }) => {
    const endpoint = 'dispense-histories/customer-reports/';
    const response = await axios.get(endpoint, { params });
    return response;
  }

  static customerTotalProfits = async (params = { duration: 'year_to_date' }) => {
    const endpoint = 'dispense-histories/customer-profits/';
    const response = await axios.get(endpoint, { params });
    return response;
  }

}
