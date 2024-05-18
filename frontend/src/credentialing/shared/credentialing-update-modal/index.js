import angular from 'angular';
import CredentialingUpdateModalService from './credentialing-update-modal.service';
import CredentialingUpdateModalCtrl from './credentialing-update-modal.ctrl';
import './confirm-delete.css';

var module = angular.module('app.shared.credentialingUpdateModalService', []);
module.controller('credentialingUpdateModalCtrl', CredentialingUpdateModalCtrl);
module.service('credentialingUpdateModalService', CredentialingUpdateModalService);

export default module.name;