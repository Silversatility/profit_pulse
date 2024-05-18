import angular from 'angular';
import ConfirmDeleteService from './confirm-delete.service';
import ConfirmDeleteCtrl from './confirm-delete.ctrl';
import './confirm-delete.css';

var module = angular.module('app.shared.confirmDeleteService', []);
module.controller('confirmDeleteCtrl', ConfirmDeleteCtrl);
module.service('confirmDeleteService', ConfirmDeleteService);

export default module.name;