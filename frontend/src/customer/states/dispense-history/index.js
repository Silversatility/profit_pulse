import angular from 'angular';
import uiRouter from 'angular-ui-router';
import dispenseHistory from './dispense-history.html';
import DispenseHistoryCtrl from './dispense-history.ctrl.js'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import DispenseHistoryService from '../../services/dispense-history.service';
import DashboardService from '../../services/dashboard.service';
import userService from '../../services/user.service';
import './dispense-history.css';

const module = angular.module('app.states.dispenseHistory', [
    uiRouter,
    DispenseHistoryService,
    DashboardService,
    userService
]);

module.controller('DispenseHistory', DispenseHistoryCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('dispenseHistory', {
            url: '/dispenseHistory',
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
                    controller: 'DispenseHistory',
                    template: dispenseHistory,
                    controllerAs: 'vm'
                }
            }
        });

});

export default module.name;
