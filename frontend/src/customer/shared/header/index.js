import angular from 'angular';
import HeaderCtrl from './header.ctrl'
import AuthService from '../../services/auth.service';
import userService  from '../../services/user.service';

let module = angular.module('app.shared.header', [AuthService, userService]);
module.controller('headerCtrl', HeaderCtrl);

export default module.name;