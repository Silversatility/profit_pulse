import angular from 'angular';
import uiRouter from 'angular-ui-router';
import customerProfileTemplate from './customerProfile.html';
import CustomerProfileCtrl from './customerProfile.ctrl'
import customerService from '../../services/customer.service'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import '../customers/customer.css';

const module = angular.module('app.states.customerProfile', [uiRouter, customerService]);
module.controller('CustomerProfileCtrl', CustomerProfileCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('customers.profile', {
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
                    controller: CustomerProfileCtrl,
                    controllerAs: 'vm',
                    template: customerProfileTemplate
                }
            }
        });

});

export default module.name;