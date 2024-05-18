import angular from 'angular';
import uiRouter from 'angular-ui-router';
import profitReportTemplate from './profitReport.html';
import ProfitReportCtrl from './profitReport.ctrl'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import ReportsService from '../../services/reports.service';

const module = angular.module('app.states.profitReport', [uiRouter, ReportsService]);
module.controller('ProfitReportCtrl', ProfitReportCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('profitReport', {
            url: '/profitReport',
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
                    controller: 'ProfitReportCtrl',
                    controllerAs: 'vm',
                    template: profitReportTemplate
                }
            }
        });

});

export default module.name;
