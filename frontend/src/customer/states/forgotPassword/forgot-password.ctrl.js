import ErrorHelper from "../../shared/error-helper";

export default class ForgotPasswordCtrl {
    constructor($rootScope, $state, PATTERN, MESSAGES, userService){
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.pattern = PATTERN;
        this.MESSAGES = MESSAGES;
        this.userService = userService;
        this.$rootScope.login = true;
        this.email = null;

        this.done = false;
        this.errorMessage = null;
    }

    onSubmit(form){
        this.userService.forgotPassword(this.email)
            .then(data =>this.success(form))
            .catch(err => this.error(err));
    }

    success(form) {
        this.done = true;
        this.errorMessage = null;
        this.email = null;
        form.$setPristine();
    }

    error(err) {
        this.errorMessage = ErrorHelper.getErrorMessage(err);
    }

    back(){
        this.$state.go('login');
    }
}

ForgotPasswordCtrl.$inject = ['$rootScope', '$state', 'PATTERN', 'MESSAGES', 'userService'];