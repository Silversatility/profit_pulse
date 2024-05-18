import angular from 'angular';
import uiRouter from 'angular-ui-router';
import resetPasswordTemplate from './reset-password.html';
import ResetPasswordCtrl from './reset-password.ctrl'
import userService  from '../../services/user.service';

const module = angular.module('app.states.resetPassword', [uiRouter, userService]);
module.controller('ResetPasswordCtrl', ResetPasswordCtrl);
module.config(function($stateProvider) {
    $stateProvider
        .state('resetPassword', {
            url: '/resetPassword/:uidb64/:token',
            views: {
                'content': {
                    controller: 'ResetPasswordCtrl',
                    controllerAs: 'vm',
                    template: resetPasswordTemplate
                }
            }
        });

});

export default module.name;