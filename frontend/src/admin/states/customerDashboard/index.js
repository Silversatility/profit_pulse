import angular from 'angular';
import uiRouter from 'angular-ui-router';
import angularChart from 'angular-chart.js';
import angularDateRangePicker from 'angular-daterangepicker';
import customerDashboardTemplate from './customerDashboard.html';
import CustomerDashboardCtrl from './customerDashboard.ctrl'
import CustomerDashboardService from '../../services/customerDashboard.service';
import userService from '../../services/user.service';
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import './customerDashboard.css'

const module = angular.module('app.states.customerDashboard', [
    uiRouter,
    angularChart,
    angularDateRangePicker,
    CustomerDashboardService,
    userService
]);
module.controller('CustomerDashboardCtrl', CustomerDashboardCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('customerDashboard', {
            url: '/customerDashboard',
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
                    controller: 'CustomerDashboardCtrl',
                    controllerAs: 'vm',
                    template: customerDashboardTemplate
                }
            }
        });

});

export default module.name;
