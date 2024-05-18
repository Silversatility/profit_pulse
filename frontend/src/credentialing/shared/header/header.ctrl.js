export default class HeaderCtrl {
    constructor($rootScope, $state, LOGIN_STATE, authService){
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.loginState = LOGIN_STATE;
        this.authService = authService;
    }

    toggleSidebar() {
        this.$rootScope.menuCollapsed = this.$rootScope.menuCollapsed ? !this.$rootScope.menuCollapsed : true;
    }

    logout() {
        this.authService.logout();
        this.$state.go(this.loginState);
    }
}

HeaderCtrl.$inject = ['$rootScope', '$state', 'LOGIN_STATE', 'authService'];
