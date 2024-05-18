import ErrorHelper from "../../shared/error-helper";

export default class ResetPasswordCtrl {

    constructor($rootScope, $stateParams, userService, MESSAGES){
        this.$rootScope = $rootScope;
        this.userService = userService;
        this.$stateParams = $stateParams;
        this.MESSAGES = MESSAGES;
        this.$rootScope.login = true;

        this.done = false;
        this.new_password1 = '';
        this.new_password2 = '';
        this.errorMessage = null;
    }

    onSubmit(resetForm){
        let data = {
            new_password1: this.new_password1,
            new_password2: this.new_password2,
            uid: this.$stateParams.uid,
            token: this.$stateParams.token
        };

        this.userService.confirmPassword(data)
            .then(data =>{
                this.success(resetForm);
            })
            .catch(error => {
                this.error(error);
            });
    }

    success(resetForm){
        this.done = true;
        this.new_password1 = '';
        this.new_password2 = '';
        this.errorMessage = null;
        resetForm.$setPristine();
    }

    error(error){
        this.errorMessage = ErrorHelper.getErrorMessage(error);
    }
}

ResetPasswordCtrl.$inject = ['$rootScope', '$stateParams', 'userService', 'MESSAGES'];