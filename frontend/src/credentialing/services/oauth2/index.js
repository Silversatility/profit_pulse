import angular from 'angular';
import sessionService from '../session.service';
import oauth2Service from './oauth2.service';
import oauth2Interceptor from './oauth2.interceptor';

export default angular.module('app.services.oauth2', [sessionService])
    .service('oauth2Service', oauth2Service)
    .factory('oauth2Interceptor', oauth2Interceptor)
    .config(['$httpProvider', ($httpProvider)=> {
        $httpProvider.interceptors.push('oauth2Interceptor');
    }])
    .name;