import ErrorHelper from '../../shared/error-helper';

export default class CustomerProfileCtrl {
    constructor($state, $rootScope, $stateParams, customerService, userService, MESSAGES, toast, confirmDeleteService) {
        this.$state = $state;
        this.$rootScope = $rootScope;
        this.stage = $stateParams.stage;
        this.customerService = customerService;
        this.userService = userService;
        this.confirmDeleteService = confirmDeleteService;
        this.MESSAGES = MESSAGES;
        this.toast = toast;
        this.customerID = $stateParams.id;

        this.credentialed = false;
        this.ncpdp_number = '';
        this.organization_npi = '';
        this.express_scripts = '';
        this.psao = '';
        this.caremark = '';
        this.humana = '';
        this.optum = '';
        this.sent = false;
        this.documents = {
            medical_clinic_license: [],
            pic_dea_license: [],
            federal_tax_id: [],
            business_liability_insurance: [],
            owner_pic_drivers_license: [],
            articles_of_incorporation: [],
            professional_liability_insurance: [],
            owners_state_issued_driver_license: [],
        };
        this.customer = {};
        this.owners = [];
        this.errors = [];
        this.validateSubmitButton = null;
        this.submitValidation = false;
        this.documentFormInvalid = false;

        this.fetch();
    }

    downloadCredentialingDocument(url) {
      // this.userService.downloadCredentialingDocument(url);
      // const urlObject = new URL(url);
      // window.open(`${urlObject.origin}/download${urlObject.pathname}`, '_blank');
      window.open(url, '_blank');
    }

    validateSubmit() {
      this.documents_total = 0;
      this.documents.medical_clinic_license.length > 0 && this.documents_total++;
      this.documents.pic_dea_license.length > 0 && this.documents_total++;
      this.documents.federal_tax_id.length > 0 && this.documents_total++;
      this.documents.business_liability_insurance.length > 0 && this.documents_total++;
      this.documents.owner_pic_drivers_license.length > 0 && this.documents_total++;
      this.documents.professional_liability_insurance.length > 0 && this.documents_total++;
      this.documents.owners_state_issued_driver_license.length > 0 && this.documents_total++;
      if (this.documents_total == 7) {
        this.validateSubmitButton = false;
      } else {
        this.validateSubmitButton = true;
      }
    }

    deleteCredentialingDocument(id) {
      let messagesData = {
          title: 'Confirm',
          message: 'Are you sure you want to delete this document?',
          action: "Delete"
      };

      let result = this.confirmDeleteService.openConfirmDeleteModal(messagesData).result;
      result.then(success => {
         this.userService.deleteCredentialingDocument(id)
          .then(() => {
            this.fetch();
            this.toast({
                duration: 5000,
                message: 'Document Deleted Successfully.',
                className: 'alert-success'
            });
          })
          .catch(() => {

          })
      });
    }

    uploadFiles(file, invalidFiles, key) {
        if (! key || ! file) return;
        file.key = key;
        this.userService.uploadCredentialingDocument(file, this.customerID)
          .then(
              (response) => {
                  this.fetch();
                  this.toast({
                      duration: 5000,
                      message: 'Document Uploaded Successfully.',
                      className: 'alert-success'
                  });
              },
              (error) => {

              },
              (event) => {
                  this.documents[file.key].progress = Math.min(100, parseInt(100.0 * event.loaded / event.total));
              }
          )
          .catch((error) => {
              this.hasError = true;
          });
    }


    fetch() {
        this.customerService.get(this.customerID)
            .then((data) => {
                this.customer = data;
                if (data.owners.length > 0) {
                  this.owners = data.owners;
                } else {
                  this.owners.push({
                    name: '',
                    email: '',
                    percent_owned: '',
                    dob: '',
                    social_security_number: '',
                    address_line_1: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    date_became_owner: '',
                  });
                }
                this.documents.medical_clinic_license = data.medical_clinic_license;
                this.documents.pic_dea_license = data.pic_dea_license;
                this.documents.federal_tax_id = data.federal_tax_id;
                this.documents.business_liability_insurance = data.business_liability_insurance;
                this.documents.professional_liability_insurance = data.professional_liability_insurance;
                this.documents.owner_pic_drivers_license = data.owner_pic_drivers_license;
                this.documents.articles_of_incorporation = data.articles_of_incorporation;
                this.documents.owners_state_issued_driver_license = data.owners_state_issued_driver_license;

                this.credentialed = data.credentialed;
                this.ncpdp_number = data.ncpdp_number;
                this.credentialing_stage = data.credentialing_stage;
                this.credentialed_date = data.credentialed_date;
                this.organization_npi = data.organization_npi;
                this.express_scripts = data.express_scripts;
                this.psao = data.psao;
                this.caremark = data.caremark;
                this.humana = data.humana;
                this.optum = data.optum;

                this.documents.facility_liability_insurance = this._getFileName(data.facility_liability_insurance)
                // this.documents.articles_of_incorporation = this._getFileName(data.articles_of_incorporation)
                this.documents.facility_medicare_and_medicaid_member_id = this._getFileName(data.facility_medicare_and_medicaid_member_id)
                this.documents.irs_tax_documentation = this._getFileName(data.irs_tax_documentation)
                this.documents.practice_w9 = this._getFileName(data.practice_w9)
                this.documents.facility_npi = data.facility_npi
                this.documents.professional_liability_policy = this._getFileName(data.professional_liability_policy)
                this.documents.state_medical_license = this._getFileName(data.state_medical_license)
                this.documents.state_license_verification = this._getFileName(data.state_license_verification)
                this.documents.dea_license = this._getFileName(data.dea_license)
                this.documents.home_address = data.home_address
                this.documents.npi_number = data.npi_number

                if (data.ncpdp_number) {
                    this.sent = true;
                }
                this.validateSubmit();
                // this.goToCurrentStage();
                if(data.credentialing_user){
                  this.customer.credentialing_user = data.credentialing_user.user.id;
                }
            });
    }

    addOwner() {
      this.owners.push({
        name: '',
        email: '',
        percent_owned: '',
        dob: '',
        social_security_number: '',
        address_line_1: '',
        city: '',
        state: '',
        postal_code: '',
        date_became_owner: '',
      });
    }

    deleteOwner(index) {
      if(confirm('Are you sure you want to remove')) {
        this.owners.splice(index, 1)
        this.onChange();
      }
    }

    onChange() {
      this.errors = [];
      angular.element('.control-loader').removeClass('loader-backdrop')
      const data = Object.assign({}, this.customer);
      data.owners = this.owners;
      data.yn_e_prescribe_vendor = data.yn_e_prescribe ? data.yn_e_prescribe_vendor : '';
      delete data.medical_clinic_license;
      delete data.pic_dea_license;
      delete data.federal_tax_id;
      delete data.business_liability_insurance;
      delete data.owner_pic_drivers_license;
      delete data.articles_of_incorporation;
      delete data.professional_liability_insurance;
      delete data.owners_state_issued_driver_license;
      this.customerService.update(data.user_id, data)
          .then(success => {
            this.toast({
                duration: 5000,
                message: "Form Updated",
                className: 'alert-info'
            });
          })
          .catch(error => {
              this.credentialingSubmitError(error);
          });
    }

    validateInputFields(data) {
      let fields = {
        'practice_legal_name' : data.practice_legal_name,
        'practice_ein_tax_id_number' : data.practice_ein_tax_id_number,
        'date_practice_was_incorporated' : data.date_practice_was_incorporated,
        'practice_doing_business_as' : data.practice_doing_business_as,
        'practice_phone_number' : data.practice_phone_number,
        'practice_primary_contact' : data.practice_primary_contact,
        'primary_contact_phone' : data.primary_contact_phone,
        'primary_contact_email' : data.primary_contact_email,
        'physician_in_charge' : data.physician_in_charge,
        'pic_date_of_birth' : data.pic_date_of_birth,
        'pic_social_security' : data.pic_social_security,
        'pic_dea_num' : data.pic_dea_num,
        'pic_phone' : data.pic_phone,
        'pic_license_num' : data.pic_license_num,
        'pic_lic_exp_date' : data.pic_lic_exp_date,
        'pic_dea_expiration' : data.pic_dea_expiration,
        'practice_office_hours' : data.practice_office_hours,
        'facility_type_2_npi' : data.facility_type_2_npi,
        'practice_physical_address' : data.practice_physical_address,
        'ppa_city' : data.ppa_city,
        'ppa_state' : data.ppa_state,
        'ppa_postal_code' : data.ppa_postal_code,
        'years_on_location' : data.years_on_location,
        'different_mailing_address' : data.different_mailing_address,
        'name_printed_on_check' : data.name_printed_on_check,
        'practice_description': data.practice_description,
      }
      if (data.yn_e_prescribe) {
        fields.yn_e_prescribe_vendor = data.yn_e_prescribe_vendor;
      }
      let owners_field = data.owners;
      let physicians_fields = {
        'other_physician_1' : data.other_physician_1,
        'other_physician_2' : data.other_physician_2,
        'other_physician_3' : data.other_physician_3,
        'other_physician_4' : data.other_physician_4,
        'other_physician_5' : data.other_physician_5,
        'other_physician_6' : data.other_physician_6,
        'other_physician_7' : data.other_physician_7,
        'other_physician_8' : data.other_physician_8,
        'other_physician_9' : data.other_physician_9,
        'other_physician_10' : data.other_physician_10,
        'other_physician_11' : data.other_physician_11,
        'other_physician_12' : data.other_physician_12,
      }
      let counter = 0;
      Object.keys(fields).forEach((key) => {
        if (!fields[key]) {
            this.errors.push(this.formatFieldName(key));
            counter++;
        }
      })

      for (let owner in owners_field) {
        let owner_valid_fields = 0;
        Object.keys(owners_field[owner]).forEach((key) =>  {
          if (!owners_field[owner][key]) {
              this.errors.push(
                `OWNER ${parseInt(owner) + 1}` + ' ' + this.formatFieldName(key)
              );
              owner_valid_fields++;
          }
        })
        if (owner_valid_fields > 0) {
          counter++
        }
      }

      let total_physicians = 0;
      Object.keys(physicians_fields).forEach((key) =>  {
        if (!physicians_fields[key]) {
            total_physicians++;
        }
      });
      if (total_physicians == 12) {
        this.errors.push("AT LEAST ONE PHYSICIAN");
        counter++
      }

      if (counter > 0 && this.errors.length > 0) {
        this.toast({
            duration: 5000,
            message: "Please fill out all required fields/documents.",
            className: 'alert-danger'
        });
      } else {
        this.documents_total = 0;
        this.documents.medical_clinic_license.length > 0 && this.documents_total++;
        this.documents.pic_dea_license.length > 0 && this.documents_total++;
        this.documents.federal_tax_id.length > 0 && this.documents_total++;
        this.documents.business_liability_insurance.length > 0 && this.documents_total++;
        this.documents.owner_pic_drivers_license.length > 0 && this.documents_total++;
        this.documents.professional_liability_insurance.length > 0 && this.documents_total++;
        this.documents.owners_state_issued_driver_license.length > 0 && this.documents_total++;
        if (this.documents_total == 7) {
          data.documents_received_color = 'green';
        }
        this.customerService.update(data.user_id, data)
            .then(success => {
                this.credentialingSubmitSuccess(success);
            })
            .catch(error => {
                this.credentialingSubmitError(error);
            });
      }
    }

    formatFieldName(key) {
      return key.split('_').join(' ').toUpperCase();
    }

    submit() {
        angular.element('.control-loader').addClass('loader-backdrop')
        const data = Object.assign({}, this.customer);
        data.owners = this.owners;
        data.yn_e_prescribe_vendor = data.yn_e_prescribe ? data.yn_e_prescribe_vendor : '';
        this.submitValidation = true;
        this.validateInputFields(data);

    }

    credentialingSubmitSuccess(success){
        this.toast({
            duration: 5000,
            message: this.MESSAGES.ENROLLMENT_SUCCESS,
            className: 'alert-success'
        });
    }

    credentialingSubmitError(error){
        this.toast({
            duration: 5000,
            message: ErrorHelper.getErrorMessage(error),
            className: 'alert-danger'
        });
    }

    onHoverExample(imageName) {
      angular.element('.hover-image-container' + imageName).removeClass('hidden')
    }

    offHoverExample(imageName) {
      angular.element('.hover-image-container' + imageName).addClass('hidden')
    }

    onHoverFiles(documentName, imageId, imageURL) {
      let imageName = documentName+"-"+imageId;
      let hoverElement = angular.element('.hover-image-container' + imageName);
      hoverElement.removeClass('hidden');
      hoverElement.find('.dynamic-hover').css({
        'background': 'url(' + imageURL + ')',
        'background-size': 'contain',
        'background-repeat': 'no-repeat',
        'background-position': 'center center',
      })
    }

    offHoverFiles(documentName, imageId) {
      let imageName = documentName+"-"+imageId;
      let hoverElement = angular.element('.hover-image-container' + imageName);
      hoverElement.addClass('hidden');
      hoverElement.find('.dynamic-hover').css({
        'background': '',
        'background-size': '',
        'background-repeat': '',
        'background-position': '',
      })
    }

    _getFileName(fileUrl) {
        if (fileUrl) {
            return {name: fileUrl.split('/').pop(), url: fileUrl};
        }
        else {
            return {};
        }
    }

}

CustomerProfileCtrl.$inject = ['$state', '$rootScope', '$stateParams', 'customerService', 'userService', 'MESSAGES', 'toast', 'confirmDeleteService'];
