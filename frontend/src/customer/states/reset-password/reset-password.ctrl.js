import ErrorHelper from '../../shared/error-helper';

export default class ResetPasswordCtrl {

    constructor($rootScope, $state, $stateParams, userService, MESSAGES) {
        this.$rootScope = $rootScope;
        this.$rootScope.login = true;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.userService = userService;
        this.MESSAGES = MESSAGES;

        this.new_password1='';
        this.new_password1='';
        this.done = false;

        document.addEventListener("keyup", function () {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("submitButton").click();
            }
        })
    }

    onSubmit(resetForm){
        let data = {
            new_password1: this.new_password1,
            new_password2: this.new_password2,
            uid: this.$stateParams.uidb64,
            token: this.$stateParams.token
        };
        this.userService.resetPassword(data)
            .then(()=>{
                this.success(resetForm);
            })
            .catch(error => {
                this.error(error);
            })
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

ResetPasswordCtrl.$inject = ['$rootScope', '$state','$stateParams', 'userService', 'MESSAGES'];