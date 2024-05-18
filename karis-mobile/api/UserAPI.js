import axios from 'axios';


export default class UserAPI {
  static me = async () => {
    const endpoint = 'me/';
    const response = await axios.get(endpoint);
    return response;
  }

  static updateAdminMe = async (id, data) => {
    const endpoint = `managers/${id}/`;
    const response = await axios.patch(endpoint, data);
    return response;
  }

  static updateCustomerMe = async (id, data) => {
    const endpoint = `customers/${id}/`;
    const response = await axios.patch(endpoint, data);
    return response;
  }
}
