import template from './confirm-delete.html';
export default class ConfirmDeleteService {
    constructor($uibModal) {
        this.$uibModal = $uibModal;
    }

    openConfirmDeleteModal(messagesData) {
        var modalInstance = this.$uibModal.open({
            template: template,
            controller: 'confirmDeleteCtrl',
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

ConfirmDeleteService.$inject = ['$uibModal'];