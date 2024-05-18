import angular from 'angular';
import uiRouter from 'angular-ui-router';
import loginTemplate from './login.html';
import loginCtrl from './login.ctrl'
import userService  from '../../services/user.service';
import sessionService from '../../services/session.service';
import './login.css';

const module = angular.module('app.states.login', [uiRouter, userService, sessionService]);
module.controller('LoginCtrl', loginCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('login', {
            url: '/login',
            views: {
                'content': {
                    controller: 'LoginCtrl',
                    controllerAs: 'vm',
                    template: loginTemplate
                }
            }
        });

});

export default module.name;