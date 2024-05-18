import Pagination from "../../services/pagination";

export default class SwitchingFeeCtrl {

  constructor($scope, $filter, customerService, SwitchingFeeService) {
    this.$scope = $scope;
    this.$filter = $filter;
    this.customerService = customerService;
    this.SwitchingFeeService = SwitchingFeeService;

    this.pagination = new Pagination();

    this.items = [];
    this.customers = [];
    this.search = '';
    this.sortParameters = '';

    this.filterCustomer = {
      user: '',
      business_name: '-- Select Customer --'
    };

    this.filterForm = {
      customer: '',
    };

    this.populate();
  }

  populate() {
    this.fetch();
    this.fetchCustomers();
  }

  fetch() {
    let page = this.pagination.page;
    let limit = this.pagination.limit;

    this.SwitchingFeeService.list(page, limit, this.sortParameters, this.search, this.filterForm)
      .then(data => {
        this.items = data.results;
      })
      .catch(err => console.log(err));
  }

  fetchCustomers() {
    this.customerService.listMinifiedCustomers()
      .then(results => {
        this.customers = results;
      });
  }

  pageChanged() {
    this.fetch();
  }

  changeCustomer(customer) {
    this.pagination.page = 1;
    this.filterCustomer = customer;
    this.filterForm.customer = customer.user;
    this.fetch();
  }

}

SwitchingFeeCtrl.$inject = ['$scope', '$filter', 'customerService', 'SwitchingFeeService'];
