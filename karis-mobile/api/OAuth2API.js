import axios from 'axios';

import KarisConfig from '../constants/KarisConfig';
import Storage from './Storage';


export default class OAuth2API {
  static instance = axios.create({
    baseURL: KarisConfig.API_BASE_URL,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  static changePassword = async ({ old_password, new_password1, new_password2 }) => {
    const uri = 'api-auth/password/change/';
    const response = axios.post(
      uri,
      {
        old_password,
        new_password1,
        new_password2,
      }
    );
    return response;
  }

  static login = async ({ username, password }) => {
    const endpoint = 'o/token/';
    const data = {
      username,
      password,
      grant_type: 'password',
      client_id: KarisConfig.CLIENT_ID,
      client_secret: KarisConfig.CLIENT_SECRET,
    };
    let formData = this._serializeFormData(data);
    const response = await this.instance.post(endpoint, formData);
    await this._asyncPersistOAuth2Data(response.data);
    return response;
  };

  static refreshToken = async (config) => {
    let uri = 'o/token/';
    let authData = await Storage.getItem(Storage.Keys.OAUTH2_DATA);

    let data = {
      refresh_token: authData.refresh_token,
      grant_type: 'refresh_token',
      client_id: KarisConfig.CLIENT_ID,
      client_secret: KarisConfig.CLIENT_SECRET,
    };
    let formData = this._serializeFormData(data);

    const response = await this.instance.post(uri, formData);
    await this._asyncPersistOAuth2Data(response.data);
    config.headers.Authorization = `Bearer ${response.data.access_token}`;
    // return response;
  };

  static _serializeFormData = (data) => {
    return Object.entries(data)
      .map((pair) => {
        return pair.map(encodeURIComponent).join('=');
      })
      .join('&');
  };

  static _asyncPersistOAuth2Data = async (data) => {
    let expiresIn = data.expires_in || 0;
    // before 5 seconds
    data.expires_in = (new Date().getTime() + (1000 * expiresIn) - 5000);
    await Storage.setItem(Storage.Keys.OAUTH2_DATA, data);
  };

  static forgotPassword = async (data) => {
    const endpoint = 'api-auth/password/forgot-password/';
    const response = await axios.post(endpoint, data);
    return response;
  };

  static confirmPassword = async (data) => {
    const endpoint = 'api-auth/password/reset-password/';
    const response = await axios.post(endpoint, data);
    return response;
  };
}
