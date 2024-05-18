import ErrorHelper from '../../shared/error-helper';
export default class CredentialingUpdateModalCtrl {
  constructor($uibModalInstance, messageDatas, $filter) {
    this.uibModal = $uibModalInstance;
    this.messagesData = messageDatas;
    this.$filter = $filter;
    this.credentialing = [];
    this.notes = [];
    this.showPassword = false;
    this.showPin = false;

    if (this.messagesData.note.length > 0) {
      this.notes = this.messagesData.note.sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
      })
    } else {
      this.notes.push({
        date: new Date(),
        text: ''
      });
    }

    if (['organization_npi', 'ncpdp_number', 'psao'].includes(this.messagesData.dataType)) {
      this.credentialing.data = this.messagesData.data;
    } else {
        if (this.messagesData.data) {
        this.credentialing.data = this.messagesData.data;
      }
    }

    if (['express_scripts', 'ncpdp_number', 'psao'].includes(this.messagesData.dataType)) {
      this.credentialing.credentials = this.messagesData.credentials;
    }
  }

  closeModal(data, note, credentials) {
    let tempData = {};
    if (data == 'ncpdp_number') {
      tempData[data] = this.credentialing.data;
      tempData[note] = this.notes;
      tempData[credentials[0]] = this.credentialing.credentials.ncpdp_number_username;
      tempData[credentials[1]] = this.credentialing.credentials.ncpdp_number_password;
      tempData[credentials[2]] = this.credentialing.credentials.ncpdp_number_pin;
    } else if (data == 'express_scripts') {
      tempData[data] = this.$filter('date')(this.notes[0] ? this.notes[0].date : new Date(), 'yyyy-MM-dd');
      tempData[note] = this.notes;
      tempData[credentials[3]] = this.credentialing.credentials.express_scripts_username;
      tempData[credentials[4]] = this.credentialing.credentials.express_scripts_password;
    } else if (data == 'psao') {
      tempData[data] = this.$filter('date')(this.notes[0] ? this.notes[0].date : new Date(), 'yyyy-MM-dd');
      tempData[note] = this.notes;
      tempData[credentials[5]] = this.credentialing.credentials.psao_username;
      tempData[credentials[6]] = this.credentialing.credentials.psao_password;
    } else if (data == 'caremark' || data == 'software_and_supplies'){
      tempData[data] = this.$filter('date')(this.notes[0] ? this.notes[0].date : new Date(), 'yyyy-MM-dd');
      tempData[note] = this.notes;
    } else if (data !== 'organization_npi' && data !== 'ncpdp_number' && data !== 'documents_received') {
      tempData[data] = this.$filter('date')(this.notes[0] ? this.notes[0].date : new Date(), 'yyyy-MM-dd');
      tempData[note] = this.notes;
    } else {
      tempData[data] = this.credentialing.data;
      tempData[note] = this.notes;
    }
    this.uibModal.close(tempData);
  }

  dismissModal() {
    this.uibModal.dismiss();
  }

  addNote() {
    this.notes.unshift({
      date: new Date(),
      text: '',
    });
  }

  deleteNote(index) {
    if (confirm('Are you sure you want to remove')) {
        this.notes.splice(index, 1)
    }
  }

  toggleshowDetails(type) {
    if (type == 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showPin = !this.showPin;

    }
  }
}

CredentialingUpdateModalCtrl.$inject = ['$uibModalInstance', 'messageDatas', '$filter'];
