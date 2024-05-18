import template from './credentialing-update-modal.html';

export default class CredentialingUpdateModalService {
  constructor($uibModal) {
    this.$uibModal = $uibModal;
  }

  openCredentialingUpateModal(messagesData) {
    var modalInstance = this.$uibModal.open({
      backdrop: 'static',
      template: template,
      size: 'md',
      controller: 'credentialingUpdateModalCtrl',
      controllerAs: 'vm',
      windowClass: "custom-modal",
      resolve: {
        messageDatas: function () {
          return messagesData;
        }
      }
    });

    return modalInstance;
  }
}

CredentialingUpdateModalService.$inject = ['$uibModal'];