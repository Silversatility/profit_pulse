import Pagination from "../../services/pagination";

export default class ProductsMarginCtrl {

    constructor(dashboardService, alertService, MESSAGES, confirmDeleteService) {
        this.dashboardService = dashboardService;
        this.alertService = alertService;
        this.confirmDeleteService = confirmDeleteService;
        this.MESSAGES = MESSAGES;

        this.filterResource = [
            {
                name: 'Today',
                value: 'today'
            },
            {
                name: 'Yesterday',
                value: 'yesterday'
            },
            {
                name: 'Weekly',
                value: 'this_week'
            },
            {
                name: 'Monthly',
                value: 'this_month'
            },
            {
                name: 'YTD',
                value: 'year_to_date'
            },
            {
                name: 'LYTD',
                value: 'last_year_to_date'
            },
            {
                name: '3Y',
                value: 'last_3_years'
            }
        ];

        this.filter = {
            name: 'Monthly',
            value: 'this_month'
        };

        this.pagination = new Pagination();
        this.pagination.limit = 20;
        this.products = [];

        this.sortParameters = '-created';
        this.search = '';
        this.fetch();
    }

    fetch(searchParams) {
        let page = this.pagination.page;
        let limit = this.pagination.limit;
        let search = this.search;

        this.dashboardService.getTopPerformingProducts(this.filter.value, false, page, limit, this.sortParameters, search)
            .then(pagination => this.success(pagination))
            .catch(err => this.error(err));
    }

    success(pagination) {
        this.pagination = pagination;
        this.products = pagination.results;
    }

    error(err){
        console.log('ERROR: ', err);
    }

    pageChanged() {
        this.fetch();
    }

    confirmDelete(productID){
        let messagesData = {
            title:  this.MESSAGES.CONFIRM_DELETE_TITLE,
            message: this.MESSAGES.CONFIRM_DELETE_MESSAGE,
            action: "Delete"
        };

        let result = this.confirmDeleteService.openConfirmDeleteModal(messagesData).result;
        result.then(close => {
            this.delProduct(productID);
        })
    }

    onSearch(){
        this.pagination.page = 1;
        this.fetch();
    }

    changeFilter(item) {
        this.filter = item;
        this.pagination.page = 1;
        this.fetch();
    }
}

ProductsMarginCtrl.$inject = ['DashboardService', 'MESSAGES', 'confirmDeleteService'];
