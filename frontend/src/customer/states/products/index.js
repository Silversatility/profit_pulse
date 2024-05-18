import angular from 'angular';
import uiRouter from 'angular-ui-router';
import productsTemplate from './products.html';
import ProductsCtrl from './products.ctrl'
import productsService from '../../services/products.service'
import dashboardService from '../../services/dashboard.service'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import './products.css';

const module = angular.module('app.states.products', [uiRouter, productsService, dashboardService]);
module.controller('ProductsCtrl', ProductsCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('products', {
            url: '/products',
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
                    controller: 'ProductsCtrl',
                    controllerAs: 'vm',
                    template: productsTemplate
                }
            }
        });

});

export default module.name;
