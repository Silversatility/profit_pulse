import ErrorHelper from '../../shared/error-helper';
import UsStates from '../customers/us-states';

export default class CustomerEditCtrl {

    constructor($state, $stateParams, $filter, MESSAGES, customerService, salesRepService, toast) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$filter = $filter;
        this.MESSAGES = MESSAGES;
        this.customerService = customerService;
        this.salesRepService=salesRepService;
        this.oldEmail='';
        this.customers = [];
        this.enrollmentDateOpened = false;
        this.monthlyFeeStartDateOpened = false;
        this.softwareInstallOpened = false;
        this.activeDateOpened = false;
        this.credentialedDateOpened = false;
        this.oldCustomerName = '';

        this.usStates = new UsStates();

        this.toast = toast;

        this.customerService
            .get(this.$stateParams.id)
            .then((data)=>{
                this.oldEmail = data.user.email;
                this.oldCustomerName = data.business_name;
                this.editableData = data;
                this.editableData.enrollment_date = this.editableData.enrollment_date && new Date(this.editableData.enrollment_date);
                this.editableData.monthly_fee_start_date = this.editableData.monthly_fee_start_date && new Date(this.editableData.monthly_fee_start_date);
                this.editableData.software_install = this.editableData.software_install && new Date(this.editableData.software_install);
                this.editableData.active_date = this.editableData.active_date && new Date(this.editableData.active_date);
                this.editableData.credentialed_date = this.editableData.credentialed_date && new Date(this.editableData.credentialed_date);
                if(data.sales_representative){
                  this.editableData.sales_representative = data.sales_representative.user.id;
                }
            });

        this.salesRepService
            .list(this.page, this.limit)
            .then((data)=>{
                this.salesRep = data.results;
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
        object.enrollment_date = this.$filter('date')(this.editableData.enrollment_date, 'yyyy-MM-dd');
        object.monthly_fee_start_date = this.$filter('date')(this.editableData.monthly_fee_start_date, 'yyyy-MM-dd');
        object.software_install = this.$filter('date')(this.editableData.software_install, 'yyyy-MM-dd');
        object.active_date = this.$filter('date')(this.editableData.active_date, 'yyyy-MM-dd');
        object.credentialed_date = this.$filter('date')(this.editableData.credentialed_date, 'yyyy-MM-dd');

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

CustomerEditCtrl.$inject = ['$state', '$stateParams', '$filter', 'MESSAGES', 'customerService','salesRepService', 'toast'];
