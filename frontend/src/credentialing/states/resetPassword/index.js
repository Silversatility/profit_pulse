import angular from 'angular';
import uiRouter from 'angular-ui-router';
import ResetPasswordTemplate from './reset-password.html';
import ResetPasswordCtrl from './reset-password.ctrl';
import UserService from '../../services/user.service';

const module = angular.module('app.states.resetPassword', [uiRouter, UserService]);
module.controller('resetPasswordCtrl', ResetPasswordCtrl);
module.config(function($stateProvider) {
    $stateProvider
        .state('resetPassword', {
            url: '/resetPassword/:uid/:token',
            views: {
                'content': {
                    controller: 'resetPasswordCtrl',
                    controllerAs: 'vm',
                    template: ResetPasswordTemplate
                }
            }
        });

});

export default module.name;