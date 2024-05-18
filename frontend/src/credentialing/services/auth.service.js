import angular from 'angular';
import sessionService from './session.service';
import oauth2 from './oauth2';

const module = angular.module('app.services.auth', [oauth2]);

class AuthService {
    constructor(oauth2Service) {
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
}

AuthService.$inject = ['oauth2Service'];

module.service('authService', AuthService);
export default module.name;