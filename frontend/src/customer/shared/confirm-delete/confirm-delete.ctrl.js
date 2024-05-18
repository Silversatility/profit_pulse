export default class ConfirmDeleteCtrl {
    constructor($uibModalInstance, messageDatas) {
        this.uibModal = $uibModalInstance;
        this.messagesData = messageDatas;
    }

    closeModal() {
        this.uibModal.close();
    }

    dismissModal() {
        this.uibModal.dismiss();
    }
}

ConfirmDeleteCtrl.$inject = ['$uibModalInstance', 'messageDatas'];