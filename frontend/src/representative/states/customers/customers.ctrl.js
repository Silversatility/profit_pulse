import Customer from './customer';
import ErrorHelper from '../../shared/error-helper';
import Pagination from "../../services/pagination";
import UsStates from '../customers/us-states';

export default class CustomersCtrl {

    constructor($state, customerService, MESSAGES, CUSTOMER_PORTAL_URL, salesRepService, confirmDeleteService, toast) {
        this.$state = $state;
        this.customerService = customerService;
        this.salesRepService = salesRepService;
        this.MESSAGES = MESSAGES;
        this.CUSTOMER_PORTAL_URL = CUSTOMER_PORTAL_URL;
        this.confirmDeleteService = confirmDeleteService;

        this.newCustomer = false;
        this.customer = new Customer();
        this.usStates = new UsStates();

        this.customerList = [];

        this.sortParameters = '-created';
        this.search = '';

        this.toast = toast;

        this.populate();
    }

    populate() {
        this.fetchCustomers();
    }

    fetchCustomers() {
        let search = this.search;

        this.customerService.list(1, 0, this.sortParameters, search, true)
            .then(results => {
                this.customerList = results;
            })
            .catch(err => this.error(err));
    }

    error(err) {
        this.toast({
            duration: 5000,
            message: ErrorHelper.getErrorMessage(err),
            className: 'alert-danger'
        });
    }

    onSearch(){
        this.fetchCustomers();
    }

}

CustomersCtrl.$inject = ['$state', 'customerService', 'MESSAGES', 'CUSTOMER_PORTAL_URL', 'salesRepService', 'confirmDeleteService', 'toast'];
