import angular from 'angular';
import Header from './header';
import ConfirmDelete from './confirm-delete';
import CredentialingUpdateModal from './credentialing-update-modal';
import Spinner from './spinner';

let module = angular.module('app.shared', [Header, ConfirmDelete, CredentialingUpdateModal, Spinner]);
export default module.name;