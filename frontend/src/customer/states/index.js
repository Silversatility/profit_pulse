import angular from 'angular';
import DashboardState from './dashboard/';
import DispenseHistoryState from './dispense-history/';
import ProfileState from './profile';
import ProductsState from './products';
import ProfitabilityState from './profitability';
import LoginState from './login';
import ResetPassword from './reset-password';
import SharedMod from '../shared';
import ForgotPassword from './forgotPassword';
import CredentialingState from './credentialing';

const module = angular.module('app.states', [
    DashboardState,
    DispenseHistoryState,
    ProfileState,
    ProductsState,
    ProfitabilityState,
    LoginState,
    ResetPassword,
    SharedMod,
    ForgotPassword,
    CredentialingState,
]);


export default module.name;
