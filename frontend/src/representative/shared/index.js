import angular from 'angular';
import Header from './header';
import ConfirmDelete from './confirm-delete';
import Spinner from './spinner';

let module = angular.module('app.shared', [Header, ConfirmDelete, Spinner]);
export default module.name;