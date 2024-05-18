import angular from 'angular';
import uiRouter from 'angular-ui-router';
import angularInputMasks from 'angular-input-masks';
import customersTemplate from './customers.html';
import CustomersCtrl from './customers.ctrl';
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import ConfirmDeleteService from '../../shared/confirm-delete';
import CustomerService from '../../services/customer.service';
import salesRepService from '../../services/sales-rep.service';
import './customer.css';

const module = angular.module('app.states.customers', [uiRouter,angularInputMasks, CustomerService, salesRepService, ConfirmDeleteService]);
module.controller('CustomersCtrl', CustomersCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('customers', {
            url: '/customers',
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
                    controller: 'CustomersCtrl',
                    controllerAs: 'vm',
                    template: customersTemplate
                }
            }
        });

});

export default module.name;