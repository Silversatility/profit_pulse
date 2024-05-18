import angular from 'angular';
import uiRouter from 'angular-ui-router';
import NewsFeedsTemplate from './newsfeeds.html';
import NewsFeedsCtrl from './newsfeeds.ctrl.js';
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import NewsFeedsService from '../../services/newsfeeds.service';

const module = angular.module('app.states.newsfeeds', [uiRouter, NewsFeedsService]);
module.controller('NewsFeedsCtrl', NewsFeedsCtrl);
module.config(function ($stateProvider) {

  $stateProvider
    .state('newsfeeds', {
      url: '/newsfeeds',
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
          controller: NewsFeedsCtrl,
          controllerAs: 'vm',
          template: NewsFeedsTemplate
        }
      }
    });

});

export default module.name;
