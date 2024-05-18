import Sales from './sales';
import ErrorHelper from '../../shared/error-helper';
import Pagination from '../../services/pagination';
export default class SalesRepCtrl {

    constructor(salesRepService, MESSAGES, confirmDeleteService, toast) {
        this.sales = new Sales();
        this.isOpenDropDown = false;
        this.salesRepService = salesRepService;
        this.confirmDeleteService = confirmDeleteService;
        this.MESSAGES = MESSAGES;
        this.toast = toast;

        this.sortParameters='';
        this.pagination = new Pagination();

        this.salesList = [];
        this.sortParameters = '-user__created';
        this.errorMessage = '';
        this.search = '';

        this.newSalesRep = false;
        this.fetch();
    }

    fetch() {
        let page = this.pagination.page;
        let limit = this.pagination.limit;
        let search = this.search;

        this.salesRepService.list(page, limit, this.sortParameters, search)
            .then(pagination=>this.success(pagination))
            .catch(err=>this.error(err));
    }

    success(pagination) {
        this.pagination = pagination;
        this.salesList = pagination.results;
    }

    onSubmit(saleForm){
        this.salesRepService.create(this.sales)
            .then(data => {
                this.createSuccess(saleForm);

                this.toast({
                    duration: 5000,
                    message: this.MESSAGES.ADD_SALES_REP_OK,
                    className: 'alert-success'
                });
            })
            .catch(err => {
                this.toast({
                    duration: 5000,
                    message: ErrorHelper.getErrorMessage(err),
                    className: 'alert-danger'
                });
            });
    }

    createSuccess(saleForm){
        this.sales = new Sales();
        saleForm.$setPristine();
        this.newSalesRep = false;
        this.fetch();
    }

    confirmDelete(id){
        let messagesData = {
            title: this.MESSAGES.CONFIRM_DELETE_TITLE,
            message: this.MESSAGES.CONFIRM_DELETE_MESSAGE,
            action: "Delete"
        };

        let result = this.confirmDeleteService.openConfirmDeleteModal(messagesData).result;
        result.then(success => {
            this.salesRepService.del(id)
                .then(success => {
                    this.pagination.page = 1;
                    this.fetch();

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
        });
    }

    pageChanged() {
        this.fetch();
    }

    onSearch(){
        this.pagination.page = 1;
        this.fetch();
    }
}

SalesRepCtrl.$inject = ['salesRepService', 'MESSAGES', 'confirmDeleteService', 'toast'];
