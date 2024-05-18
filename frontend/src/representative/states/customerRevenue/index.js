import angular from 'angular';
import uiRouter from 'angular-ui-router';
import CustomerRevenueTemplate from './customerRevenue.html';
import CustomerRevenueCtrl from './customerRevenue.ctrl'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import ReportsService from '../../services/reports.service';
import revenuesService from '../../services/revenues.service';
import './customerRevenue.css';

const module = angular.module('app.states.CustomerRevenue', [uiRouter, revenuesService, ReportsService]);
module.controller('CustomerRevenueCtrl', CustomerRevenueCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('CustomerRevenue', {
            url: '/CustomerRevenue',
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
                    controller: 'CustomerRevenueCtrl',
                    controllerAs: 'vm',
                    template: CustomerRevenueTemplate
                }
            }
        });

});

export default module.name;
