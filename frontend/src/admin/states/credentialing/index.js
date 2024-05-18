import angular from 'angular';
import uiRouter from 'angular-ui-router';
import angularInputMasks from 'angular-input-masks';
import credentialingTemplate from './credentialing.html';
import CredentialingCtrl from './credentialing.ctrl';
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import CustomerService from '../../services/customer.service';
import './credentialing.css';;

const module = angular.module('app.states.credentialing', [uiRouter,angularInputMasks, CustomerService]);
module.controller('CredentialingCtrl', CredentialingCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('credentialing', {
            url: '/credentialing',
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
                'content': {
                    controller: 'CredentialingCtrl',
                    controllerAs: 'vm',
                    template: credentialingTemplate
                }
            }
        });

});

export default module.name;
