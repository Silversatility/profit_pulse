import Pagination from "../../services/pagination";

export default class CustomerProfileCtrl {

    constructor($stateParams, customerService) {
        this.customerService = customerService;
        this.$stateParams = $stateParams;

        this.customerId = $stateParams.id;
        this.data = {};
        this.dispenseHistories = [];


        this.pagination = new Pagination();
        this.items = [];
        this.sortParameters = '';
        this.populate();
    }

    populate(){
        this.loadCustomer();
        this.fetch();
    }

    loadCustomer(){
        this.customerService
            .get(this.customerId)
            .then((data) => {
                this.data = data;
            });
    }

    fetch(){
        let page = this.pagination.page;
        let limit = this.pagination.limit;
        let sortParameters = this.sortParameters;

        this.customerService
            .listDispenseHistory(this.customerId, page, sortParameters)
            .then(data =>{
              this.dispenseHistories=data.results;
              this.count = data.count;
              this.numPages = Math.ceil(data.count/20);
            } );
    }
}

CustomerProfileCtrl.$inject = ['$stateParams','customerService'];