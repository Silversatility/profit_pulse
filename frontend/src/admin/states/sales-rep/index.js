import angular from 'angular';
import uiRouter from 'angular-ui-router';
import angularInputMasks from 'angular-input-masks';
import salesRepTemplate from './sales-rep.html';
import SalesRepCtrl from './sales-rep.ctrl'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import SalesRepService from '../../services/sales-rep.service';
import confirmDeleteService from '../../shared/confirm-delete';
import './sales-rep.css';

const module = angular.module('app.states.salesRep', [uiRouter,angularInputMasks, SalesRepService, confirmDeleteService]);
module.controller('SalesRepCtrl', SalesRepCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('salesRep', {
            url: '/salesRep',
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
                    controller: 'SalesRepCtrl',
                    controllerAs: 'vm',
                    template: salesRepTemplate
                }
            }
        });

});

export default module.name;