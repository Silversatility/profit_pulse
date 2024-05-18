import angular from 'angular';
import uiRouter from 'angular-ui-router';
import angularDateRangePicker from 'angular-daterangepicker';
import dispenseHistory from './dispense-history.html';
import DispenseHistoryCtrl from './dispense-history.ctrl';
import DispenseHistoryService from '../../services/dispense-history.service';
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import customerService from '../../services/dispense-history.service';
import './dispense-history.css'

const module = angular.module('app.states.dispenseHistory', [
    uiRouter, 
    DispenseHistoryService, 
    angularDateRangePicker, 
    customerService
]);

module.controller('DispenseHistoryCtrl', DispenseHistoryCtrl);
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
                    controller: "DispenseHistoryCtrl",
                    template: dispenseHistory,
                    controllerAs: 'vm'
                }
            }
        });

});

export default module.name;