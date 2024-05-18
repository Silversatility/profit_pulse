import angular from 'angular';
import HeaderCtrl from './header.ctrl'
import AuthService from '../../services/auth.service';

let module = angular.module('app.shared.header', [AuthService]);
module.controller('headerCtrl', HeaderCtrl);

export default module.name;