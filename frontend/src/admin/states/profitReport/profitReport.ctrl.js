import Pagination from "../../services/pagination";
const DATE_FORMAT = 'YYYY-MM-DD';

export default class ProfitReportCtrl {

    constructor($scope, $filter, reportsService) {
        this.$scope = $scope;
        this.$filter = $filter;
        this.reportsService = reportsService

        this.startDateOpened = false;
        this.endDateOpened = false;
        let endDate = new Date();
        let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        this.datepickerDate = {
            startDate: startDate,
            endDate: endDate
        };
        this.pagination = new Pagination();
        this.items = [];
        this.sortParameters='';

        this.fetch();
        this.bindEvents();
    }

    fetch() {
        let page = this.pagination.page;
        let limit = this.pagination.limit;
        let sortParameters = this.sortParameters;
        let startDate = this.$filter('date')(this.datepickerDate.startDate, 'yyyy-MM-dd');
        let endDate = this.$filter('date')(this.datepickerDate.endDate, 'yyyy-MM-dd');
        this.reportsService.list(page, limit, startDate, endDate, sortParameters)
            .then(pagination => this.success(pagination))
            .catch(err => this.error(err));
    }

    bindEvents(){
        this.$scope.$watch('vm.datepickerDate', () => {
            this.pagination.page = 1;
            this.fetch();
        }, false);
    }

    success(pagination) {
        this.pagination = pagination;
        this.items = pagination.results;
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

ProfitReportCtrl.$inject = ['$scope', '$filter', 'reportsService'];
