import Pagination from "../../services/pagination";

export default class DispenseHistoryCtrl {

    constructor($filter, dispenseHistoryService, userService, dashboardService, $location) {
        this.$filter = $filter;
        this.dispenseHistoryService = dispenseHistoryService;
        this.userService = userService;
        this.dashboardService = dashboardService;
        this.$location = $location;
        this.pagination = new Pagination();
        this.startDateOpened = false;
        this.endDateOpened = false;
        let endDate = new Date();
        let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        this.datepickerDate = {
            startDate: startDate,
            endDate: endDate
        };

        this.items = {};
        this.search = '';

        this.filterCustomer = null;
        this.filterCustomers = [];
        this.userService.me().then(data => {
            this.profile = data;
            if (this.profile.user.is_manager) {
                this.filterCustomer = Number(new URLSearchParams(window.location.search).get('customer')) || null;
                this.dashboardService.getCustomers().then(data => {
                    this.filterCustomers = data;
                });
            }
            this.fetch();
        });
    }


    fetch(){
        let page = this.pagination.page;
        let limit = this.pagination.limit;
        let sortParameters = this.sortParameters;
        let search = this.search;
        let startDate = this.$filter('date')(this.datepickerDate.startDate, 'yyyy-MM-dd');
        let endDate = this.$filter('date')(this.datepickerDate.endDate, 'yyyy-MM-dd');

        this.dispenseHistoryService.list1(page, limit, sortParameters, search, startDate, endDate, this.filterCustomer)
            .then(pagination => this.success(pagination))
            .catch(error => {})
    }

    success(pagination) {
        this.pagination = pagination;
        this.items = pagination.results;
    }

    onSearch(){
        this.pagination.page = 1;
        this.filter = '';
        this.fetch();
    }

    pageChanged(){
        this.fetch();
    }

    openStartDate() {
      this.startDateOpened = true;
    }

    openEndDate() {
      this.endDateOpened = true;
    }

}

DispenseHistoryCtrl.$inject = ['$filter', 'dispenseHistoryService', 'userService', 'DashboardService', '$location'];
