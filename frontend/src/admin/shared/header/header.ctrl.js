export default class HeaderCtrl {
    constructor($rootScope, $state, $scope, LOGIN_STATE, authService, userService, toast){
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.$scope = $scope;
        this.loginState = LOGIN_STATE;
        this.authService = authService;
        this.userService = userService;
        this.profile = {};

        this.getUserProfile();
    }

    getUserProfile() {
        this.userService.me().then(data => this.profile = data);
    }

    toggleSidebar() {
        this.$rootScope.menuCollapsed = this.$rootScope.menuCollapsed ? !this.$rootScope.menuCollapsed : true;
    }

    logout() {
        this.authService.logout();
        this.$state.go(this.loginState);
    }

    triggerReSync() {
        this.authService.reSync()
            .then((res) => {
                this.$state.reload();
                this.toast({
                    duration: 5000,
                    message: 'Data Re-sync Successful!.',
                    className: 'alert-success'
                });
            })
            .catch(err => {
                this.toast({
                    duration: 5000,
                    message: 'Data Re-sync Failed!',
                    className: 'alert-danger'
                });
            });
    }
}

HeaderCtrl.$inject = ['$rootScope', '$state', '$scope', 'LOGIN_STATE', 'authService', 'userService', 'toast'];
