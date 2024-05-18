import angular from 'angular';
import ngCookies from 'angular-cookies';
import ngSanitize from 'angular-sanitize';
import ngAnimate from 'angular-animate';
import router from './router';
import bootstrap from 'angular-ui-bootstrap';
import bootstrapDatetimePicker from 'bootstrap-ui-datetime-picker';
import 'angularjs-toast';
import appStates from './states';
import authService from './services/auth.service';
import MESSAGES from './message.constant';
import PATTERN from './pattern.constant';
import directives from './directives/columnSort.directive';
import config from './config';

let env = process.env.NODE_ENV || 'production';
if (!config[env]) {
    env = 'local';
}
let API_BASE_URL = config[env]['API_BASE_URL'];
let CLIENT_ID = config[env]['CLIENT_ID'];
let CLIENT_SECRET = config[env]['CLIENT_SECRET'];
let ADMIN_PORTAL_URL = config[env]['ADMIN_PORTAL_URL'];

angular.module('app', [ngCookies, router, bootstrap, bootstrapDatetimePicker, 'angularjsToast', appStates, authService, directives])
    .constant('API_BASE_URL', API_BASE_URL)
    .constant('CLIENT_ID', CLIENT_ID)
    .constant('CLIENT_SECRET', CLIENT_SECRET)
    .constant('ADMIN_PORTAL_URL', ADMIN_PORTAL_URL)
    .constant('PAGE_SIZE', 20)
    .constant('LOGIN_STATE', 'login')
    .constant('MESSAGES', MESSAGES)
    .constant('PATTERN', PATTERN)
    .run(run);


angular.element(document).ready(function(){
    angular.bootstrap(document, ['app']);
});

function run($rootScope, $state, authService){
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        let publicRoutes = ['login', 'forgotPassword', 'resetPassword'];
        let currentState = toState.name;
        if (!authService.authenticated() && publicRoutes.indexOf(currentState)===-1 ) {
            $state.go('login');
            event.preventDefault();
        }

    });
}
run.$inject = ['$rootScope', '$state', 'authService']
