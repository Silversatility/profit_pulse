import angular from 'angular';
import uiRouter from 'angular-ui-router';
import salesRepProfileTemplate from './sales-rep-profile.html';
import SalesRepProfileCtrl from './sales-rep-profile.ctrl'
import salesRepService from '../../services/sales-rep.service'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import '../sales-rep/sales-rep.css';

const module = angular.module('app.states.salesRepProfile', [uiRouter,salesRepService]);
module.controller('SalesRepProfileCtrl', SalesRepProfileCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('salesRep.profile', {
            url: '/:id',
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
                    controller: SalesRepProfileCtrl,
                    controllerAs: 'vm',
                    template: salesRepProfileTemplate
                }
            }
        });

});

export default module.name;