import angular from 'angular';
import Header from './header';
import SideBar from './sidebar';
import ConfirmDelete from './confirm-delete';
import CredentialingUpdateModal from './credentialing-update-modal';
import Spinner from './spinner';

let module = angular.module('app.shared', [Header, ConfirmDelete, CredentialingUpdateModal, Spinner, SideBar]);
export default module.name;