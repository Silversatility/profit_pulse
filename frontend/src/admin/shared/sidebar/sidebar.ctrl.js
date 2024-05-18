export default class SideBarCtrl {
  constructor(
    $rootScope,
    $state,
    $scope,
    LOGIN_STATE,
    authService,
    userService,
    ) {
    this.$rootScope = $rootScope;
    this.$state = $state;
    this.$scope = $scope;
    this.loginState = LOGIN_STATE;
    this.authService = authService;
    this.profile = {};
    this.userService = userService;
    
    this.populate();
  }
  populate() {
    this.getUserProfile();
  }

  getUserProfile() {
    this.userService.me()
      .then(data => {
        this.profile = data;
      });
  }
}

SideBarCtrl.$inject = [
  '$rootScope',
  '$state',
  '$scope',
  'LOGIN_STATE',
  'authService',
  'userService',
];
