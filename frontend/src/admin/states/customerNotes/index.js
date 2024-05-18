import angular from 'angular';
import uiRouter from 'angular-ui-router';
import angularDateRangePicker from 'angular-daterangepicker';
import customerNotesTemplate from './customerNotes.html';
import CustomerNotesCtrl from './customerNotes.ctrl';
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import CustomerService from '../../services/customer.service';
import SalesRepService from '../../services/sales-rep.service';
import '../customers/customer.css';

const module = angular.module('app.states.customerNotes', [uiRouter, CustomerService, SalesRepService, angularDateRangePicker]);
module.controller('CustomerNotesCtrl', CustomerNotesCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('customers.notes', {
            url: '/:id/notes',
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
                    controller: CustomerNotesCtrl,
                    controllerAs: 'vm',
                    template: customerNotesTemplate
                }
            }
        });

});

export default module.name;
