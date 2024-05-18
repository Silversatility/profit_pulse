import angular from 'angular';
import uiRouter from 'angular-ui-router';
import angularDateRangePicker from 'angular-daterangepicker';
import newsFeedEditTemplate from './newsFeedEdit.html';
import NewsFeedEditCtrl from './newsFeedEdit.ctrl'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import NewsFeedsService from '../../services/newsfeeds.service';
import 'ng-file-upload';


const module = angular.module('app.states.newsFeedEdit', [uiRouter, NewsFeedsService, angularDateRangePicker, 'ngFileUpload']);
module.controller('NewsFeedEditCtrl', NewsFeedEditCtrl);
module.config(function ($stateProvider) {

  $stateProvider
    .state('newsfeeds.edit', {
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
          controller: NewsFeedEditCtrl,
          controllerAs: 'vm',
          template: newsFeedEditTemplate
        }
      }
    });

});

export default module.name;
