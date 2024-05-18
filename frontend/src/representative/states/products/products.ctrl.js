import Product from './product';
import ErrorHelper from '../../shared/error-helper';
import Pagination from "../../services/pagination";

export default class ProductsCtrl {

    constructor(productService, dashboardService, MESSAGES, confirmDeleteService, toast) {
        this.productService = productService;
        this.dashboardService = dashboardService;
        this.confirmDeleteService = confirmDeleteService;
        this.MESSAGES = MESSAGES;
        this.toast = toast;
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
                name: 'This Week',
                value: 'this_week'
            },
            {
                name: 'Last Week',
                value: 'last_week'
            },
            {
                name: 'This Month',
                value: 'this_month'
            },
            {
                name: 'Last Month',
                value: 'last_month'
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
            name: 'This Month',
            value: 'this_month'
        };

        this.pagination = new Pagination();
        this.pagination.limit = 20;
        this.products = [];

        this.sortParameters = '-created';
        this.search = '';

        this.newProduct = false;
        this.product = new Product();
        this.imageFile = null;

        this.fetch();
    }

    fetch() {
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

    delProduct(productID){
        this.productService.del(productID)
            .then(data => {
                this.delSuccess();
            })
            .catch(error => {
                this.delFail();
            })
    }

    delSuccess(){
        // ALERT
        this.fetch();
    }

    delFail(){
        // ALERT
    }

    productActivate($event, productId){
        let data={
            is_active: $event.target.checked
        };

        this.productService.update(productId, data)
            .then(data => {
                if(data.is_active===false){
                    // ALERT
                }else{
                    // ALERT
                }
            })
            .catch()
    }

    confirmActivate($event, productId){
        let message, action;
        if($event.target.checked===true){
            message=this.MESSAGES.CONFIRM_ENABLE_MESSAGE;
            action="Enable"
        }else{
            message=this.MESSAGES.CONFIRM_DISABLE_MESSAGE;
            action="Disable"
        }
        let messagesData = {
            title:  this.MESSAGES.CONFIRM_DELETE_TITLE,
            message: message,
            action: action
        };
        let result = this.confirmDeleteService.openConfirmDeleteModal(messagesData).result;
        result.then(close => {
            this.productActivate($event, productId);
        }).catch(dismiss =>{
            if($event.target.checked===true){
                $event.target.checked=false
            } else {
                $event.target.checked=true
            }
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

    onSubmit() {
        if (this.imageFile){
            this.productService.createWithImage(this.product, this.imageFile)
                .then((data) => {
                    this.imageFile = null;
                    this.toast({
                        duration  : 5000,
                        message   : this.MESSAGES.ADD_PRODUCT_OK,
                        className : "alert-success"
                    });

                    this.newProduct = false;
                })
                .catch(err => {
                    this.toast({
                        duration  : 5000,
                        message   : ErrorHelper.getErrorMessage(err),
                        className : "alert-danger"
                    });
                });
        } else {
            this.productService.create(this.product)
                .then((data) => {
                    this.imageFile = null;
                    this.toast({
                        duration  : 5000,
                        message   : this.MESSAGES.ADD_PRODUCT_OK,
                        className : "alert-success"
                    });

                    this.newProduct = false;
                }).catch(err => {
                    this.toast({
                        duration  : 5000,
                        message   : ErrorHelper.getErrorMessage(err),
                        className : "alert-danger"
                    });
                });
        }
    }
}

ProductsCtrl.$inject = ['productService', 'DashboardService', 'MESSAGES', 'confirmDeleteService', 'toast'];
