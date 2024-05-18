import angular from 'angular';
import SideBarCtrl from './sidebar.ctrl'
import AuthService from '../../services/auth.service';

let module = angular.module('app.shared.sidebar', [AuthService]);
module.controller('sideBarCtrl', SideBarCtrl);

export default module.name;