import angular from 'angular';
import uiRouter from 'angular-ui-router';
import profileTemplate from './profile.html';
import ProfileCtrl from './profile.ctrl'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import './profile.css';

const module = angular.module('app.states.profile', [uiRouter]);
module.controller('ProfileCtrl', ProfileCtrl);
module.config(function($stateProvider) {

    $stateProvider
        .state('profile', {
            url: '/profile',
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
                    controller: 'ProfileCtrl',
                    controllerAs: 'vm',
                    template: profileTemplate
                }
            }
        });

});

export default module.name;