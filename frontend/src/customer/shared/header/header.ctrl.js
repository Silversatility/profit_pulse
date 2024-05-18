export default class HeaderCtrl {
    constructor($rootScope, $state, LOGIN_STATE, authService, userService){
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.loginState = LOGIN_STATE;
        this.authService = authService;
        this.userService = userService;

        this.init();

    }

    init() {
        this.userService
            .currentUser()
            .then((data) => {
                this.$rootScope.customer = data;
            });
        this.userService.checkUser()
            .then()
            .catch((error) => {
                this.authService.logout();
                this.$state.go(this.loginState);
            });
    }

    toggleSidebar() {
        this.$rootScope.menuCollapsed = this.$rootScope.menuCollapsed ? !this.$rootScope.menuCollapsed : true;
    }

    logout() {
        this.authService.logout();
        this.$state.go(this.loginState);
    }
}

HeaderCtrl.$inject = ['$rootScope', '$state', 'LOGIN_STATE', 'authService', 'userService'];
