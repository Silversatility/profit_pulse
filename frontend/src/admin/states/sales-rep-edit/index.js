import angular from 'angular';
import uiRouter from 'angular-ui-router';
import salesRepEditTemplate from './sales-rep-edit.html';
import SalesRepEditCtrl from './sales-rep-edit.ctrl'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import SalesRepService from '../../services/sales-rep.service';
import '../sales-rep/sales-rep.css';

const module = angular.module('app.states.salesRepEdit', [uiRouter, SalesRepService]);
module.controller('SalesRepEditCtrl', SalesRepEditCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('salesRep.profile.edit', {
            url: '/edit',
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
                    controller: SalesRepEditCtrl,
                    controllerAs: 'vm',
                    template: salesRepEditTemplate
                }
            }
        });

});

export default module.name;