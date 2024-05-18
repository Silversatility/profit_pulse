import angular from 'angular';
import uiRouter from 'angular-ui-router';

const module = angular.module('app.router', [uiRouter]);

module
  .config(function($stateProvider, $urlRouterProvider, $locationProvider){

  // this is required for the root url to direct to /#/
  $urlRouterProvider.otherwise('/dashboard');

  // use the HTML5 History API
  // $locationProvider.html5Mode({
  //   requireBase: false,
  //   enabled: true
  // });

});
export default module.name;