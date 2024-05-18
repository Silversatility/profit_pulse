import angular from 'angular';
import uiRouter from 'angular-ui-router';
import angularChart from 'angular-chart.js';
import profitabilityTemplate from './profitability.html';
import ProfitabilityCtrl from './profitability.ctrl'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import profitabilityService from '../../services/profitability.service';
import userService from '../../services/user.service';
import dashboardService from '../../services/dashboard.service';
import './profitability.css'

const module = angular.module('app.states.profitability', [uiRouter, angularChart, profitabilityService, userService, dashboardService]);
module.controller('ProfitabilityCtrl', ProfitabilityCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('profitability', {
            url: '/profitability',
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
                    controller: 'ProfitabilityCtrl',
                    controllerAs: 'vm',
                    template: profitabilityTemplate
                }
            }
        });

});

export default module.name;
