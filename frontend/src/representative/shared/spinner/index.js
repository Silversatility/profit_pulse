import angular from 'angular';
import spinnerInterceptor from './spinner.interceptor';
import './spinner.css';

export default
    angular.module('app.shared.spinner', [])
        .factory('spinnerInterceptor', spinnerInterceptor)
        .directive('loadingWidget', () => {
            return {
                restrict: 'A',
                link: function ($scope, $element, attrs) {
                    const show = ()  => {
                        angular.element($element).css('display', 'block');
                    };
                    const hide = () => {
                        angular.element($element).css('display', 'none');
                    };
                    $scope.$on('spinnerActive', show);
                    $scope.$on('spinnerInactive', hide);
                    hide();
                }
            };
        })
        .config(['$httpProvider', ($httpProvider) => {
            $httpProvider.interceptors.push('spinnerInterceptor');
        }])
        .name;