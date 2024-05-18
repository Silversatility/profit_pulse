export default class LoginCtrl {

    constructor($rootScope, $state, userService, sessionService, MESSAGES, toast) {
        this.$rootScope = $rootScope;
        this.$rootScope.login = true;
        this.userService = userService;
        this.sessionService = sessionService;
        this.$state = $state;
        this.toast = toast;
        this.email='';
        this.password='';
        this.error = MESSAGES.LOGIN_ERROR;

        document.addEventListener("keyup", function () {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("submitButton").click();
            }
        })
    }

    login(){
        let data = {
            username : this.email,
            password: this.password
        };

        this.userService.login(data)
        .then(()=>{
            this.userService.me()
              .then( data => {
                if (data.user.is_sales_representative || data.user.is_customer || data.user.is_admin) {
                  this.$rootScope.login = false;
                  this.$state.go('dashboard');
                } else {
                  this.toast({
                      duration: 5000,
                      message: "Unauthorized User",
                      className: 'alert-danger'
                  });
                  return this.userService.logout();
                }
              })
              .catch(error => {
                this.toast({
                    duration: 5000,
                    message: "Unauthorized User",
                    className: 'alert-danger'
                });
                return this.userService.logout();
              })
        })
        .catch(error =>{
            this.hasError = true;
        });
    }
}

LoginCtrl.$inject = ['$rootScope', '$state', 'userService', 'sessionService', 'MESSAGES', 'toast'];
