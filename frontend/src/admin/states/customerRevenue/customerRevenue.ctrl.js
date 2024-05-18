export default class CustomerRevenueCtrl {

    constructor($scope, $filter, reportsService, userService) {
        this.$scope = $scope;
        this.$filter = $filter;
        this.reportsService = reportsService;
        this.userService = userService;
        this.profile = {};

        this.startDateOpened = false;
        this.endDateOpened = false;
        let today = new Date();
        let endDate = new Date(today.getFullYear(), today.getMonth()+1, 0);
        let startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.datepickerDate = {
            startDate: startDate,
            endDate: endDate
        };

        this.items = [];
        this.totals = {
          total_paid: 0,
          margin: 0,
          maintenance_fees: 0,
          net_profit: 0
        };
        this.sortParameters='';

        this.bindEvents();
        this.fetch();
        this.getUserProfile();
    }

    getUserProfile() {
        this.userService.me()
            .then(data => {
                this.profile = data;
            });
    }


    fetch() {
        let sortParameters = this.sortParameters;
        let startDate = this.$filter('date')(this.datepickerDate.startDate, 'yyyy-MM-dd');
        let endDate = this.$filter('date')(this.datepickerDate.endDate, 'yyyy-MM-dd');

        this.reportsService.list2(1, 0, startDate, endDate, sortParameters)
            .then(results => this.success(results));
    }

    bindEvents(){
        this.$scope.$watch('vm.datepickerDate', () => {
            this.fetch();
        }, false);
    }

    success(results) {
        this.items = results;

        this.totals = {
          total_paid: 0,
          margin: 0,
          maintenance_fees: 0,
          net_profit: 0
        };

        this.items.forEach(result => {
          this.totals.total_paid += parseFloat(result.total_paid);
          this.totals.margin += parseFloat(result.margin);
          this.totals.maintenance_fees += parseFloat(result.maintenance_fees);
          this.totals.net_profit += parseFloat(result.margin - result.maintenance_fees);
        })
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
    getNetProfit(margin, fee) {
      return parseFloat(margin - fee);
    }
}

CustomerRevenueCtrl.$inject = ['$scope', '$filter', 'reportsService', 'userService'];
