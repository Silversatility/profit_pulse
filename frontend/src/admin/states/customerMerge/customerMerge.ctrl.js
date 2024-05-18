import ErrorHelper from '../../shared/error-helper';
import UsStates from '../customers/us-states';

export default class CustomerMergeCtrl {

    constructor($state, $stateParams, $filter, MESSAGES, customerService, toast) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$filter = $filter;
        this.MESSAGES = MESSAGES;
        this.customerService = customerService;
        this.toast = toast;
        this.customerName = '';
        this.customersPrimary = [];
        this.customersSecondary = [];
        this.sortParameters = '-created';
        this.search = '';
        this.fetchCustomers('');

        this.filterCustomer = {
            user: '',
            business_name: '-- Select Customer --'
        };
    }

    changeCustomerList(input) {
        return input == 'primary' ? this.fetchCustomers('primary') : this.fetchCustomers('secondary');
    }
    
    fetchCustomers(input) {
        if(input == 'primary') {
            this.customerService.listMinifiedCustomers()
                .then(results => {
                    this.customersSecondary = results;
                    let index = this.customersSecondary.findIndex(x => x.user == parseFloat(this.editableData.primary));
                    this.customersSecondary.splice(index, 1);
                });
        } else if (input == 'secondary') {
            this.customerService.listMinifiedCustomers()
                .then(results => {
                    this.customersPrimary = results;
                    let index = this.customersPrimary.findIndex(x => x.user == parseFloat(this.editableData.secondary));
                    this.customersPrimary.splice(index, 1);
                });
        } else {
            this.customerService.listMinifiedCustomers()
                .then(results => {
                    this.customersPrimary = results;
                    this.customersSecondary = results;
                });
        }
    }

    save() {
        this.customerService.mergeCustomer(this.editableData)
            .then((res) => {
                this.$state.go('customers');
                this.toast({
                    duration: 5000,
                    message: 'Merge Successfully.',
                    className: 'alert-success'
                });
            })
            .catch(err => {
                this.toast({
                    duration: 5000,
                    message: ErrorHelper.getErrorMessage(err),
                    className: 'alert-danger'
                });
            });
    }
}

CustomerMergeCtrl.$inject = ['$state', '$stateParams', '$filter', 'MESSAGES', 'customerService', 'toast'];
