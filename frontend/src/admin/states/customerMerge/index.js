import angular from 'angular';
import uiRouter from 'angular-ui-router';
import angularDateRangePicker from 'angular-daterangepicker';
import customerMergeTemplate from './customerMerge.html';
import customerMergeCtrl from './customerMerge.ctrl';
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import CustomerService from '../../services/customer.service';
import SalesRepService from '../../services/sales-rep.service';
import '../customers/customer.css';

const module = angular.module('app.states.customerMerge', [uiRouter, CustomerService, SalesRepService, angularDateRangePicker]);
module.controller('customerMergeCtrl', customerMergeCtrl);
module.config(function ($stateProvider) {

    $stateProvider
        .state('customers.merge-customer', {
            url: '/:id/merge-customer',
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
                    controller: customerMergeCtrl,
                    controllerAs: 'vm',
                    template: customerMergeTemplate
                }
            }
        });

});

export default module.name;
