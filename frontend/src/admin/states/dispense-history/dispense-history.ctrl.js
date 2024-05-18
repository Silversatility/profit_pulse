import Pagination from "../../services/pagination";

export default class DispenseHistoryCtrl {

    constructor($scope, dispenseHistoryService, customerService) {
        this.$scope = $scope;
        this.dispenseHistoryService = dispenseHistoryService;
        this.customerService = customerService;

        this.pagination = new Pagination();
        this.pagination.limit = 20;

        this.items = [];
        this.totals = {};
        this.sortParameters='';

        this.search = '';
        this.states = [];
        this.customers = [];

        this.filterCustomer = {
            user: '',
            business_name: '-- Select Customer --'
        };

        this.startDateOpened = false;
        this.endDateOpened = false;
        let endDate = new Date();
        let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

        this.filterForm = {
            state: '',
            customer:'',
            dateRange: {
                startDate: startDate,
                endDate: endDate
            }
        };
        this.populate();
        this.bindEvents();
    }

    populate() {
        this.fetch();
        this.fetchCustomers();
        this.fetchStates();
    }

    fetch() {
        let page = this.pagination.page;
        let limit = this.pagination.limit;
        let sortParameters = this.sortParameters;

        this.dispenseHistoryService.list(page, limit, sortParameters, this.search, this.filterForm)
            .then(data => {
                this.success(data);

                this.totals = this.items.reduce((acc, item) => {
                    acc.quantity += Number(item.quantity);
                    acc.cost += Number(item.cost);
                    acc.total_paid += Number(item.total_paid);
                    acc.margin += Number(item.margin);
                    return acc;
                }, {
                    quantity: 0,
                    cost: 0,
                    total_paid: 0,
                    margin: 0
                });
            })
            .catch(err => this.error(err));
    }

    fetchCustomers() {
        this.customerService.listMinifiedCustomers()
            .then(results => {
                this.customers = results;
            });
    }

    fetchStates() {
        this.customerService.listStates()
            .then(results => {
                this.states = results;
            });
    }


    success(pagination) {
        this.pagination = pagination;
        this.items = pagination.results;
    }

    error(err) {
        console.log('ERROR: ', err);
    }

    pageChanged() {
        this.fetch();
    }

    onSearch(){
        this.pagination.page = 1;
        this.fetch();
    }

    bindEvents() {
        this.$scope.$watch('vm.filterForm.dateRange', () => {
            this.pagination.page = 1;
            this.fetch();
        }, false);
    }

    openStartDate() {
        this.startDateOpened = true;
    }

    openEndDate() {
        this.endDateOpened = true;
    }

    changeCustomer(customer) {
        this.filterCustomer = customer;
        this.filterForm.customer = customer.user;
        this.onSearch();
    }
}

DispenseHistoryCtrl.$inject = ['$scope', 'dispenseHistoryService', 'customerService'];
