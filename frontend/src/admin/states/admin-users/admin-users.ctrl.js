import User from './user';
import ErrorHelper from '../../shared/error-helper';
import Pagination from '../../services/pagination';
export default class AdminUsersCtrl {

    constructor($state, adminUserService, PATTERN, MESSAGES, confirmDeleteService, toast) {
        this.$state = $state;
        this.adminUserService = adminUserService;
        this.pattern = PATTERN;
        this.MESSAGES = MESSAGES;
        this.confirmDeleteService = confirmDeleteService;
        this.toast = toast;

        this.pagination = new Pagination();
        this.managers = [];
        this.user = new User();
        this.isOpenDropDown = false;
        this.errorMessage = '';
        this.populate();
    }

    populate() {
        this.fetch();
    }

    fetch() {
        let page = this.pagination.page;
        let limit = this.pagination.limit;

        this.adminUserService.list(page, limit)
            .then(pagination => this.success(pagination))
            .catch(err => this.error(err));
    }

    success(pagination) {
        this.pagination = pagination;
        this.managers = pagination.results;
        this.managers.isOpenPopup = false;
    }

    error(err) {
        console.log('ERROR: ', err);
    }

    pageChanged() {
        this.fetch();
    }

    onCreateUser(adminForm) {
        this.adminUserService.create(this.user)
            .then(data => {
                this.createSuccess(adminForm);
            })
            .catch(err => {
                this.createError(err);
            });
    }

    createSuccess(adminForm){
        this.toast({
            duration: 5000,
            message: this.MESSAGES.CREATE_SUCCESS,
            className: 'alert-success'
        });

        this.clearCreateForm(adminForm);
        this.isOpenDropDown = false;
        this.populate();
    }

    clearCreateForm(adminForm){
        console.log('adminForm', adminForm);
        adminForm.$setPristine();
        this.user = new User();
    }

    createError(err){
        this.toast({
            duration: 5000,
            message: ErrorHelper.getErrorMessage(err),
            className: 'alert-danger'
        });
    }

    confirmDelete(userID){
        let messagesData = {
            title: this.MESSAGES.CONFIRM_DELETE_TITLE,
            message: this.MESSAGES.CONFIRM_DELETE_USER_MESSAGE,
            action: "Delete"
        };

        let result = this.confirmDeleteService.openConfirmDeleteModal(messagesData).result;
        result.then(success => {
           this.onDel(userID);
        });
    }

    onDel(userID) {
        this.adminUserService.del(userID)
            .then(data => {
                this.deleteSuccess();
            })
            .catch(err => {
                this.deleteError(err);
            });
    }

    deleteSuccess(){
        this.toast({
            duration: 5000,
            message: this.MESSAGES.DELETE_SUCCESS,
            className: 'alert-success'
        });

        this.populate();
    }

    deleteError(err){
        this.toast({
            duration: 5000,
            message: ErrorHelper.getErrorMessage(err),
            className: 'alert-danger'
        });
    }

    onUpdateUser(manager) {
        let id = manager.user.id;
        let user = {
            first_name: manager.user.first_name,
            last_name:  manager.user.last_name,
            is_owner: manager.user.is_owner,
            manager: {
              credentialing_only: manager.credentialing_only
            }
        };

        this.adminUserService.update(id, user)
            .then(data => {
                // ALERT
                this.populate();
            })
            .catch(err => {
                // ALERT
            });
    }
}

AdminUsersCtrl.$inject = ['$state', 'adminUserService', 'PATTERN', 'MESSAGES', 'confirmDeleteService', 'toast'];
