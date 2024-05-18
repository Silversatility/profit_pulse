import ErrorHelper from '../../shared/error-helper';

export default class CustomersCtrl {

  constructor(
    $scope,
    $state,
    $filter,
    customerService,
    toast,
    MESSAGES,
    credentialingUpdateModalService) {
        this.$scope = $scope;
        this.$state = $state;
        this.$filter = $filter;
        this.customerService = customerService;
        this.toast = toast;
        this.credentialingUpdateModalService = credentialingUpdateModalService;
        this.MESSAGES = MESSAGES;
        this.customerList = [];
        this.sortParameters = 'enrollment_date';
        this.search = '';
        this.colors = [
          { value: 'red', text: 'RED' },
          { value: 'green', text: 'GREEN' },
          { value: 'orange', text: 'ORANGE' },
          { value: 'blue', text: 'BLUE' },
          { value: 'purple', text: 'PURPLE' },
        ],
        this.filterColor = {
          id: 0,
          color: 'none',
          display: '',
        };

        this.fetch();
    }

    fetch() {
        let search = this.search;
        this.customerService.list(1, 0, this.sortParameters, search, true)
            .then((results) => {
                this.customerList = results;
                this.customerList.forEach((customer) => {
                  customer.colors = this.colors;
                  customer.documents_received = 0
                  customer.medical_clinic_license.length > 0 && customer.documents_received++;
                  customer.pic_dea_license.length > 0 && customer.documents_received++;
                  customer.federal_tax_id.length > 0 && customer.documents_received++;
                  customer.business_liability_insurance.length > 0 && customer.documents_received++;
                  customer.professional_liability_insurance.length > 0 && customer.documents_received++;
                  customer.owner_pic_drivers_license.length > 0 && customer.documents_received++;
                  customer.articles_of_incorporation.length > 0 && customer.documents_received++;
                  customer.owners_state_issued_driver_license.length > 0 && customer.documents_received++;

                  let noteTypes = [
                    customer.ncpdp_number_note,
                    customer.organization_npi_note,
                    customer.express_scripts_note,
                    customer.psao_note,
                    customer.caremark_note,
                    customer.software_and_supplies_note,
                    customer.humana_note,
                    customer.optum_note,
                    customer.documents_received_note,
                  ]
                  noteTypes.forEach((notes) => {
                    notes.sort((a, b) => {
                      return new Date(b.date) - new Date(a.date);
                    })
                  })
                })
            })
            .catch(err => this.error(err));
    }

    pageChanged() {
        angular.element('.control-loader').addClass('loader-backdrop')
        this.fetch();
    }

    error(err) {
        this.toast({
            duration  : 5000,
            message   : ErrorHelper.getErrorMessage(err),
            className : "alert-danger"
        });
    }

    onSearch(){
        angular.element('.control-loader').addClass('loader-backdrop')
        this.fetch();
    }

    isVerifyVisible(customer) {
        return customer.documents_received === 7 && !customer.credentialed;
    }

    verify(customer) {
        if (confirm(`Are you sure you want to verify ${customer.business_name} credentials?`)) {
            this.verifyCredentialing(customer);
        }
    }

    verifyCredentialing(customer) {
        angular.element('.control-loader').addClass('loader-backdrop')
        const credentialed_date = this.$filter('date')(new Date(), 'yyyy-MM-dd');
        const data = {credentialed: true, credentialed_date: credentialed_date};
        this.customerService
            .update(customer.user.id, data)
            .then((data) => {
                this.fetch();
                this.toast({
                    duration  : 5000,
                    message   : "Verified successfully!",
                    className : "alert-success"
                });
            });
    }

    openCredentialingUpateModal(uId, credentialing, dataField, noteField) {
      let label = {};
      if (dataField == 'organization_npi') {
        label.data = dataField.split('organization_').join('').toUpperCase();
      } else {
        label.data = dataField.split('_').join(' ').toUpperCase();
      }
      let messagesData = {
        title: this.MESSAGES.UPDATE_TITLE,
        label: label,
        dataType: dataField,
        noteType: noteField,
        credentialsField: [
          'ncpdp_number_username',
          'ncpdp_number_password',
          'ncpdp_number_pin',
          'express_scripts_username',
          'express_scripts_password',
          'psao_username',
          'psao_password',
        ],
        data: credentialing.data,
        note: credentialing.note,
        credentials: credentialing.credentials,
        action: "Update"
      };
      let result = this.credentialingUpdateModalService.openCredentialingUpateModal(messagesData).result;
      result.then((response) => {
        angular.element('.control-loader').addClass('loader-backdrop')
        this.customerService.update(uId, response)
          .then(success => {
            this.fetch();
            this.toast({
              duration: 5000,
              message: this.MESSAGES.UPDATE_SUCCESS,
              className: 'alert-success'
            })
          })
          .catch(error => {
            this.toast({
              duration: 5000,
              message: this.MESSAGES.UPDATE_FAIL,
              className: 'alert-danger'
            })
          })
      }, (error) => {
          angular.element('.control-loader').removeClass('loader-backdrop')
          this.fetch();
      });
    }

    changeColor(customer, model, color) {
      angular.element('.control-loader').addClass('loader-backdrop')
      let colorObj = color ? color : '';
      if (model == 'ncpdp_number') customer.ncpdp_number_color = colorObj;
      if (model == 'organization_npi') customer.organization_npi_color = colorObj;
      if (model == 'express_scripts') customer.express_scripts_color = colorObj;
      if (model == 'psao') customer.psao_color = colorObj;
      if (model == 'caremark') customer.caremark_color = colorObj;
      if (model == 'software_and_supplies') customer.software_and_supplies_color = colorObj;
      if (model == 'humana') customer.humana_color = colorObj;
      if (model == 'optum') customer.optum_color = colorObj;
      if (model == 'documents_received') customer.documents_received_color = colorObj;

      if (customer.credentialing_user) {
        customer.credentialing_user = customer.credentialing_user.user.id;
      }
      if (customer.sales_representative) {
        customer.sales_representative = customer.sales_representative.user.id;
      }
      this.customerService
        .update(customer.user.id, customer)
        .then((res) => {
          this.fetch();
          this.toast({
            duration: 5000,
            message: this.MESSAGES.UPDATE_SUCCESS,
            className: 'alert-success'
          });
        })
    }

}

CustomersCtrl.$inject = [
  '$scope',
  '$state',
  '$filter',
  'customerService',
  'toast',
  'MESSAGES',
  'credentialingUpdateModalService'
];
