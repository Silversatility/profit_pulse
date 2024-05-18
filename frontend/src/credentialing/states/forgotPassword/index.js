import angular from 'angular';
import uiRouter from 'angular-ui-router';
import ForgotPasswordTemplate from './forgot-password.html';
import ForgotPasswordCtrl from './forgot-password.ctrl';
import UserService from '../../services/user.service';

const module = angular.module('app.states.forgotPassword', [uiRouter, UserService]);
module.controller('forgotPasswordCtrl', ForgotPasswordCtrl);
module.config(function($stateProvider) {
    $stateProvider
        .state('forgotPassword', {
            url: '/forgotPassword',
            views: {
                'content': {
                    controller: 'forgotPasswordCtrl',
                    controllerAs: 'vm',
                    template: ForgotPasswordTemplate
                }
            }
        });

});

export default module.name;