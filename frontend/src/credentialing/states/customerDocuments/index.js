import angular from 'angular';
import uiRouter from 'angular-ui-router';
import customerDocumentsTemplate from './customerDocuments.html';
import CustomerDocumentsCtrl from './customerDocuments.ctrl'
import customerService from '../../services/customer.service'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import './customerDocuments.css';

const module = angular.module('app.states.customerDocuments', [uiRouter, customerService]);
module.controller('CustomerDocumentsCtrl', CustomerDocumentsCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('customerdocuments', {
            url: '/documents/:id',
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
                    controller: CustomerDocumentsCtrl,
                    controllerAs: 'vm',
                    template: customerDocumentsTemplate
                }
            }
        });

});

export default module.name;
