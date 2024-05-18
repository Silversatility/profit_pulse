import axios from 'axios';

import Storage from './Storage';
import OAuth2API from './OAuth2API';
import KarisConfig from '../constants/KarisConfig';
import NavigationService from '../navigation/NavigationService';

export OAuth2API from './OAuth2API';
export DispenseHistoryAPI from './DispenseHistoryAPI';
export CustomerAPI from './CustomerAPI';
export UserAPI from './UserAPI';
export Storage from './Storage';


axios.defaults.baseURL = KarisConfig.API_BASE_URL;
axios.interceptors.request.use(async (config) => {
  // Do something before request is sent
  const authData = await Storage.getItem(Storage.Keys.OAUTH2_DATA);

  if (! authData) {
    return config;
  }

  if (
    authData &&
    authData.access_token &&
    authData.expires_in &&
    (authData.expires_in > (new Date).getTime() || config.url.endsWith('/o/token/'))
  ) {
    config.headers.Authorization = `Bearer ${authData.access_token}`;
  } else {
    // const response = await OAuth2API.refreshToken();
    await OAuth2API.refreshToken(config);
    // config.headers.Authorization = `Bearer ${response.data.access_token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

axios.interceptors.response.use((response) => {
    return response;
  }, async (error) => {
    if (error.response) {
      if (error.response.status == 401) {
        await Storage.removeItem(Storage.Keys.OAUTH2_DATA);
        NavigationService.navigate('Auth');
      }
    }
    return Promise.reject(error);
  });
