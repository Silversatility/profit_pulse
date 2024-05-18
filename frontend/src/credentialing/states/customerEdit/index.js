import angular from 'angular';
import uiRouter from 'angular-ui-router';
import angularDateRangePicker from 'angular-daterangepicker';
import customerEditTemplate from './customerEdit.html';
import CustomerEditCtrl from './customerEdit.ctrl'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import CustomerService from '../../services/customer.service';
import SalesRepService from '../../services/sales-rep.service';
import '../customers/customer.css';

const module = angular.module('app.states.customerEdit', [uiRouter, CustomerService, SalesRepService, angularDateRangePicker]);
module.controller('CustomerEditCtrl', CustomerEditCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('customers.profile.edit', {
            url: '/edit',
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
                    controller: CustomerEditCtrl,
                    controllerAs: 'vm',
                    template: customerEditTemplate
                }
            }
        });

});

export default module.name;
