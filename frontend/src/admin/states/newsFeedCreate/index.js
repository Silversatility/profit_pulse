import angular from 'angular';
import uiRouter from 'angular-ui-router';
import angularDateRangePicker from 'angular-daterangepicker';
import newsFeedCreateTemplate from './newsFeedCreate.html';
import NewsFeedCreateCtrl from './newsFeedCreate.ctrl'
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import NewsFeedsService from '../../services/newsfeeds.service';
import 'ng-file-upload';


const module = angular.module('app.states.newsFeedCreate', [uiRouter, NewsFeedsService, angularDateRangePicker, 'ngFileUpload']);
module.controller('NewsFeedCreateCtrl', NewsFeedCreateCtrl);
module.config(function ($stateProvider) {

  $stateProvider
    .state('newsfeeds.create', {
      url: '',
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
          controller: NewsFeedCreateCtrl,
          controllerAs: 'vm',
          template: newsFeedCreateTemplate
        }
      }
    });

});

export default module.name;
