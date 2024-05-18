import angular from 'angular';
import uiRouter from 'angular-ui-router';
import angularChart from 'angular-chart.js';
import 'angularjs-gauge/dist/angularjs-gauge.min';
import 'angular-ui-calendar';
import dashboardTemplate from './dashboard.html';
import DashboardCtrl from './dashboard.ctrl';
import DashboardService from '../../services/dashboard.service';
import UserService from '../../services/user.service';
import CustomerService from '../../services/customer.service';
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import './dashboard.css'

const module = angular.module('app.states.dashboard', [uiRouter, angularChart, 'angularjs-gauge', 'ui.calendar', DashboardService, UserService, CustomerService]);
module.controller('DashboardCtrl', DashboardCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('dashboard', {
            url: '/dashboard',
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
                    controller: 'DashboardCtrl',
                    controllerAs: 'vm',
                    template: dashboardTemplate
                }
            }
        });

});

export default module.name;