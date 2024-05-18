import angular from 'angular';
import uiRouter from 'angular-ui-router';
import productsTemplate from './products.html';
import ProductsCtrl from './products.ctrl.js';
import ProductService from '../../services/products.service';
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import DashboardService from '../../services/dashboard.service';
import ConfirmDeleteService from '../../shared/confirm-delete';
import 'ng-file-upload';
import './products.css';

const module = angular.module('app.states.products', [uiRouter, ProductService, DashboardService, ConfirmDeleteService, 'ngFileUpload']);
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
                    controller: ProductsCtrl,
                    controllerAs: 'vm',
                    template: productsTemplate
                }
            }
        });

});

export default module.name;
