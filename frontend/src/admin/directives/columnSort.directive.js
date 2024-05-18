import angular from 'angular';

const module = angular.module('app.directives.columnSort', []);

module.directive('sortedColumn', function() {
  return {
    restrict: 'A',
    transclude: true,
    scope:{
      name: '@sortedField',
      parameters: '=sortedColumn',
      fetch: '&updateFunction'
    },
    link: function(scope, element) {
      element.on('click', function() {
        scope.$apply(function (){
          if (scope.parameters == scope.name) {
            // reverse search
            scope.parameters = '-' + scope.name;
          } else {
            scope.parameters = scope.name;
          }
        });
        scope.fetch();
      });
    },
    template: '<span ng-transclude></span>' +
              '<i class="fa fa-sort" ng-show="!parameters.includes(name)"></i>' +
              '<i class="fa fa-sort-down" ng-show="parameters == name"></i>' +
              '<i class="fa fa-sort-up" ng-show="parameters == \'-\'+name"></i>'
 };
});

export default module.name;
