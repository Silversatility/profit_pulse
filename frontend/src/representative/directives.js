import angular from 'angular';
import columnSort from './directives/columnSort.directive';

const module = angular.module('app.directives', [
    columnSort
]);

export default module.name;
