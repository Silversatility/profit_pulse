import angular from 'angular';
import uiRouter from 'angular-ui-router';
import adminUsersTemplate from './admin-users.html';
import AdminUsersCtrl from './admin-users.ctrl'
import AdminUserService from '../../services/admin-user.service';
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import ConfirmDeleteService from '../../shared/confirm-delete';
import './admin-user.css';

const module = angular.module('app.states.adminUsers', [uiRouter, AdminUserService, ConfirmDeleteService]);
module.controller('AdminUsersCtrl', AdminUsersCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('adminUsers', {
            url: '/adminUsers',
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
                    controller: 'AdminUsersCtrl',
                    controllerAs: 'vm',
                    template: adminUsersTemplate
                }
            }
        });

});

export default module.name;