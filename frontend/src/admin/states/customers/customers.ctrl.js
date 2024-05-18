import Customer from './customer';
import ErrorHelper from '../../shared/error-helper';
import Pagination from "../../services/pagination";
import UsStates from '../customers/us-states';

export default class CustomersCtrl {

    constructor(
        $state,
        customerService,
        userService,
        MESSAGES,
        CUSTOMER_PORTAL_URL,
        salesRepService,
        confirmDeleteService,
        toast
        ) {
        this.$state = $state;
        this.customerService = customerService;
        this.userService = userService;
        this.salesRepService = salesRepService;
        this.MESSAGES = MESSAGES;
        this.toast = toast;
        this.CUSTOMER_PORTAL_URL = CUSTOMER_PORTAL_URL;
        this.confirmDeleteService = confirmDeleteService;

        this.newCustomer = false;
        this.customer = new Customer();
        this.usStates = new UsStates();

        this.sortParameters = '-created';
        this.search = '';

        this.customerList = [];
        this.profile = {};


        this.populate();
    }

    populate() {
        this.fetchCustomers();
        this.fetchSalesRep();
        this.getUserProfile();
    }

    getUserProfile() {
        this.userService.me()
            .then(data => {
                this.profile = data;
            });
    }

    fetchCustomers() {
        let search = this.search;
        this.customerService.adminList(1, 0, this.sortParameters, search)
            .then(results => {
                this.customerList = results;
            })
            .catch(err => this.error(err));
    }

    fetchSalesRep(){
        this.salesRepService
            .list(1, 100)
            .then((data) => {
                this.salesRep = data.results;
            })
    }

    onSubmit(customerCreateForm) {
        this.customerService.create(this.customer)
            .then(data => {
                this.toast({
                    duration: 5000,
                    message: this.MESSAGES.ADD_CUSTOMER_OK,
                    className: 'alert-success'
                });

                this.newCustomer = false;
                this.populate();
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

    confirmDelete(uId){
        let messagesData = {
            title: this.MESSAGES.CONFIRM_DELETE_TITLE,
            message: this.MESSAGES.CONFIRM_DELETE_MESSAGE,
            action: "Delete"
        };

        let result = this.confirmDeleteService.openConfirmDeleteModal(messagesData).result;
        result.then(success => {
            this.customerService.del(uId)
                .then(success => {
                    this.pagination.page = 1;
                    this.fetchCustomers();

                    this.toast({
                        duration: 5000,
                        message: this.MESSAGES.DELETE_SUCCESS,
                        className: 'alert-success'
                    })
                })
                .catch(error => {
                    this.toast({
                        duration: 5000,
                        message: this.MESSAGES.DELETE_FAIL,
                        className: 'alert-danger'
                    })
                })
        })
    }
}

CustomersCtrl.$inject = [
    '$state',
    'customerService',
    'userService',
    'MESSAGES',
    'CUSTOMER_PORTAL_URL',
    'salesRepService',
    'confirmDeleteService', 'toast'
];
