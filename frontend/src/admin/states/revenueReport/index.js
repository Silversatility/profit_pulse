import angular from 'angular';
import uiRouter from 'angular-ui-router';
import revenueReportTemplate from './revenueReport.html';
import RevenueReportCtrl from './revenueReport.ctrl'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import ReportsService from '../../services/reports.service';
import './revenueReport.css';

const module = angular.module('app.states.revenueReport', [uiRouter, ReportsService]);
module.controller('RevenueReportCtrl', RevenueReportCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('revenueReport', {
            url: '/revenueReport',
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
                    controller: 'RevenueReportCtrl',
                    controllerAs: 'vm',
                    template: revenueReportTemplate
                }
            }
        });

});

export default module.name;
