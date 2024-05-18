import ErrorHelper from '../../shared/error-helper';
import UsStates from '../customers/us-states';

export default class CustomerEditCtrl {

    constructor($state, $stateParams, $filter, MESSAGES, customerService, salesRepService, adminUserService, toast) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$filter = $filter;
        this.MESSAGES = MESSAGES;
        this.customerService = customerService;
        this.salesRepService = salesRepService;
        this.adminUserService = adminUserService;
        this.oldEmail='';
        this.customers = [];
        this.enrollmentDateOpened = false;
        this.monthlyFeeStartDateOpened = false;
        this.softwareInstallOpened = false;
        this.activeDateOpened = false;
        this.credentialedDateOpened = false;
        this.expressScriptsDateOpened = false;
        this.PSAODateOpened = false;
        this.caremarkDateOpened = false;
        this.humanaDateOpened = false;
        this.optumDateOpened = false;

        this.oldCustomerName = '';

        this.usStates = new UsStates();

        this.toast = toast;

        this.customerService
            .get(this.$stateParams.id)
            .then((data)=>{
                this.oldEmail = data.user.email;
                this.oldCustomerName = data.business_name;
                this.editableData = data;

                delete this.editableData.facility_liability_insurance;
                delete this.editableData.articles_of_incorporation;
                delete this.editableData.facility_medicare_and_medicaid_member_id;
                delete this.editableData.irs_tax_documentation;
                delete this.editableData.practice_w9;
                delete this.editableData.professional_liability_policy;
                delete this.editableData.state_medical_license;
                delete this.editableData.state_license_verification;
                delete this.editableData.dea_license;
                delete this.editableData.medical_clinic_license;
                delete this.editableData.pic_dea_license;
                delete this.editableData.federal_tax_id;
                delete this.editableData.professional_liability_insurance;
                delete this.editableData.business_liability_insurance;
                delete this.editableData.owner_pic_drivers_license;

                this.editableData.enrollment_date = this.editableData.enrollment_date && moment(this.editableData.enrollment_date).toDate();
                this.editableData.monthly_fee_start_date = this.editableData.monthly_fee_start_date && moment(this.editableData.monthly_fee_start_date).toDate();
                this.editableData.software_install = this.editableData.software_install && moment(this.editableData.software_install).toDate();
                this.editableData.active_date = this.editableData.active_date && moment(this.editableData.active_date).toDate();
                this.editableData.credentialed_date = this.editableData.credentialed_date && moment(this.editableData.credentialed_date).toDate();
                this.editableData.express_scripts = this.editableData.express_scripts && moment(this.editableData.express_scripts).toDate();
                this.editableData.psao = this.editableData.psao && moment(this.editableData.psao).toDate();
                this.editableData.caremark = this.editableData.caremark && moment(this.editableData.caremark).toDate();
                this.editableData.humana = this.editableData.humana && moment(this.editableData.humana).toDate();
                this.editableData.optum = this.editableData.optum && moment(this.editableData.optum).toDate();

                if(data.sales_representative){
                  this.editableData.sales_representative = data.sales_representative.user.id;
                }
                if(data.credentialing_user){
                  this.editableData.credentialing_user = data.credentialing_user.user.id;
                }
            });

        this.salesRepService
          .list(this.page, this.limit)
          .then((data) => {
              this.salesRep = data.results;
          });

        this.adminUserService
          .credentialingOnly(this.page, this.limit)
          .then((data) => {
              this.credUser = data.results;
          });

        this.populate();
    }
    populate() {
      this.fetchCustomers();
    }

    fetchCustomers() {
        this.customerService.listMinifiedCustomers()
            .then(results => {
                this.customers = results;
            });
    }

    openEnrollmentDate() {
        this.enrollmentDateOpened = true;
    }

    openMonthlyFeeStartDate() {
        this.monthlyFeeStartDateOpened = true;
    }

    openSoftwareInstall() {
        this.softwareInstallOpened = true;
    }

    openActiveDate() {
        this.activeDateOpened = true;
    }

    openCredentialedDate() {
        this.credentialedDateOpened = true;
    }

    save(){
        let object = Object.assign({}, this.editableData);
        if(this.oldEmail===object.user.email){
            delete object.user.email
        }

        object.enrollment_date = this.editableData.enrollment_date ? moment(this.editableData.enrollment_date).format('YYYY-MM-DD') : null;
        object.enrollment_date = this.editableData.enrollment_date? moment(this.editableData.enrollment_date).format('YYYY-MM-DD') : null;
        object.monthly_fee_start_date = this.editableData.monthly_fee_start_date ? moment(this.editableData.monthly_fee_start_date).format('YYYY-MM-DD') : null;
        object.software_install = this.editableData.software_install ? moment(this.editableData.software_install).format('YYYY-MM-DD') : null;
        object.active_date = this.editableData.active_date ? moment(this.editableData.active_date).format('YYYY-MM-DD') : null;
        object.credentialed_date = this.editableData.credentialed_date ? moment(this.editableData.credentialed_date).format('YYYY-MM-DD') : null;
        object.express_scripts = this.editableData.express_scripts ? moment(this.editableData.express_scripts).format('YYYY-MM-DD') : null;
        object.psao = this.editableData.psao ? moment(this.editableData.psao).format('YYYY-MM-DD') : null;
        object.caremark = this.editableData.caremark ? moment(this.editableData.caremark).format('YYYY-MM-DD') : null;
        object.humana = this.editableData.humana ? moment(this.editableData.humana).format('YYYY-MM-DD') : null;
        object.optum = this.editableData.optum ? moment(this.editableData.optum).format('YYYY-MM-DD') : null;

        this.customerService
            .update(this.$stateParams.id, object)
            .then((res)=>{
                this.toast({
                    duration: 5000,
                    message: 'Customer Updated Successfully.',
                    className: 'alert-success'
                });

                this.oldCustomerName = this.editableData.business_name;
            })
            .catch(err=> {
                this.toast({
                    duration: 5000,
                    message: ErrorHelper.getErrorMessage(err),
                    className: 'alert-danger'
                });
            });
    }
}

CustomerEditCtrl.$inject = ['$state', '$stateParams', '$filter', 'MESSAGES', 'customerService','salesRepService', 'adminUserService', 'toast'];
