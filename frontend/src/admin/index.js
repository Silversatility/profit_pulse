import angular from 'angular';
import ngCookies from 'angular-cookies';
import ngSanitize from 'angular-sanitize';
import ngAnimate from 'angular-animate';
import uiMask from 'angular-ui-mask';
import router from './router';
import bootstrap from 'angular-ui-bootstrap';
import bootstrapDatetimePicker from 'bootstrap-ui-datetime-picker';
import 'angular-bootstrap-checkbox';
import 'angularjs-toast';
import appStates from './states';
import authService from './services/auth.service';
import directives from './directives';
import MESSAGES from './message.constant';
import PATTERN from './pattern.constant';
import config from './config';

function appRun($rootScope, $state, authService) {
  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
    let publicRoutes = ['login', 'forgotPassword', 'resetPassword'];
    let currentState = toState.name;
    if (!authService.authenticated() && publicRoutes.indexOf(currentState)===-1 ) {
      $state.go('login');
      event.preventDefault();
    }
  });
}
appRun.$inject = ['$rootScope', '$state', 'authService'];

let env = process.env.NODE_ENV || 'production';
if(!config[env]){
  env = 'local';
}
let API_BASE_URL = config[env]['API_BASE_URL'];
let CLIENT_ID = config[env]['CLIENT_ID'];
let CLIENT_SECRET = config[env]['CLIENT_SECRET'];
let CUSTOMER_PORTAL_URL = config[env]['CUSTOMER_PORTAL_URL'];

angular.module('app', [ngCookies, uiMask, router, bootstrap, bootstrapDatetimePicker, 'ui.checkbox', 'angularjsToast', appStates, authService, directives])
  .constant('API_BASE_URL', API_BASE_URL)
  .constant('CLIENT_ID', CLIENT_ID)
  .constant('CLIENT_SECRET', CLIENT_SECRET)
  .constant('CUSTOMER_PORTAL_URL', CUSTOMER_PORTAL_URL)
  .constant('PAGE_SIZE', 10)
  .constant('LOGIN_STATE', 'login')
  .constant('MESSAGES', MESSAGES)
  .constant('PATTERN', PATTERN)
  .run(appRun)
  .config(['uiMask.ConfigProvider', function(uiMaskConfigProvider) {
    uiMaskConfigProvider.maskDefinitions({'A': /[a-z]/, '*': /[a-zA-Z0-9]/});
    uiMaskConfigProvider.clearOnBlur(false);
    uiMaskConfigProvider.eventsToHandle(['input', 'keyup', 'click']);
  }])


angular.element(document).ready(function(){
  angular.bootstrap(document, ['app']);
});
