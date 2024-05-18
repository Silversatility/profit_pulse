export default class RevenueReportCtrl {

    constructor($scope, $filter, reportsService) {
        this.$scope = $scope;
        this.$filter = $filter;
        this.reportsService = reportsService;

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
          gross_revenue: 0,
          transaction_fee: 0,
          maintenance_fee: 0,
          enrollment_fee: 0,
          total_revenue: 0
        };
        this.sortParameters='';

        this.fetch();
        this.bindEvents();
    }

    fetch() {
        let sortParameters = this.sortParameters;
        let startDate = this.$filter('date')(this.datepickerDate.startDate, 'yyyy-MM-dd');
        let endDate = this.$filter('date')(this.datepickerDate.endDate, 'yyyy-MM-dd');

        this.reportsService.list(1, 0, startDate, endDate, sortParameters)
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
          gross_revenue: 0,
          transaction_fee: 0,
          maintenance_fee: 0,
          enrollment_fee: 0,
          switching_charges: 0,
          total_revenue: 0
        };

        this.items.forEach(result => {
          this.totals.gross_revenue += result.gross_revenue;
          this.totals.transaction_fee += result.transaction_fee;
          this.totals.maintenance_fee += result.maintenance_fee;
          this.totals.enrollment_fee += result.enrollment_fee;
          this.totals.switching_charges += result.switching_charges;
          this.totals.total_revenue += result.total_revenue;
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
}

RevenueReportCtrl.$inject = ['$scope', '$filter', 'reportsService'];
