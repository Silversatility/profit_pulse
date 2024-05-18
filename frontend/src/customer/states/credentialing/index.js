import angular from 'angular';
import uiRouter from 'angular-ui-router';
import credentialingTemplate from './credentialing.html';
import credentialingCtrl from './credentialing.ctrl'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import userService  from '../../services/user.service';
import 'ng-file-upload';
import './credentialing.css';

const module = angular.module('app.states.credentialing', [uiRouter, userService, 'ngFileUpload']);
module.controller('credentialingCtrl', credentialingCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('credentialing', {
            url: '/credentialing/:stage',
            views: {
                'header': {
                    template: headerTemplate
                },
                'sidebar': {
                    template: sidebarTemplate
                },
                'footer': {
                    template: footerTemplate
                },
                'content@': {
                    controller: credentialingCtrl,
                    controllerAs: 'vm',
                    template: credentialingTemplate
                }
            }
        });

});

export default module.name;
