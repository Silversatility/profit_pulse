import Pagination from "../../services/pagination";

export default class SalesRepProfileCtrl {

    constructor($state, $stateParams, salesRepService, MESSAGES) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.salesRepService = salesRepService;
        this.MESSAGES = MESSAGES;
        this.customers = [];

        this.pagination = new Pagination();
        this.populate();
    }

    populate() {
        this.loadSalesRep();
        this.loadCustomers();
    }

    loadSalesRep() {
        this.salesRepService.get(this.$stateParams.id)
            .then((result) => {
                this.data = result
            });
    }

    loadCustomers() {
        let page = this.pagination.page;
        let limit = this.pagination.limit;

        this.salesRepService.listCustomers(this.$stateParams.id, page, limit)
            .then(pagination => {
                this.pagination = pagination;
                this.customers = pagination.results;
            });
    }

    pageChanged() {
        this.loadCustomers();
    }
}

SalesRepProfileCtrl.$inject = ['$state', '$stateParams', 'salesRepService', 'MESSAGES'];