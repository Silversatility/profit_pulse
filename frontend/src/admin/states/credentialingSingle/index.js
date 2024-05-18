import angular from 'angular';
import uiRouter from 'angular-ui-router';
import credentialingSingleTemplate from './credentialingSingle.html';
import credentialingSingleCtrl from './credentialingSingle.ctrl'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import userService  from '../../services/user.service';
import 'ng-file-upload';
import './credentialingSingle.css';

const module = angular.module('app.states.credentialingSingle', [uiRouter, userService, 'ngFileUpload']);
module.controller('credentialingSingleCtrl', credentialingSingleCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('credentialingSingle', {
            url: '/credentialingSingle/:stage',
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
                    controller: credentialingSingleCtrl,
                    controllerAs: 'vm',
                    template: credentialingSingleTemplate
                }
            }
        });

});

export default module.name;
