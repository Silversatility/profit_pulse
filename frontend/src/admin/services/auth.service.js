import angular from 'angular';
import sessionService from './session.service';
import ApiService from './api.service';
import oauth2 from './oauth2';

const module = angular.module('app.services.auth', [ApiService, oauth2]);

class AuthService {
    constructor(apiService, oauth2Service) {
        this.apiService = apiService;
        this.oauth2Service = oauth2Service;
    }

    authenticated(){
        return this.oauth2Service.authenticated();
    }

    logout(){
        return this.oauth2Service.logout();
    }

    login(credential) {
        return this.oauth2Service.login(credential);
    }

    reSync() {
        let uri = `customers/re-sync/`;
        return this.apiService.get(uri);
    }
}

AuthService.$inject = ['apiService', 'oauth2Service'];

module.service('authService', AuthService);
export default module.name;