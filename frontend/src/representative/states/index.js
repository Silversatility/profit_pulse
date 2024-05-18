import angular from 'angular';
import DashboardState from './dashboard/';
import CustomersState from './customers';
import CustomerRevenue from './customerRevenue';
import CustomerProfileState from './customerProfile';
import ProfileState from './profile';
import LoginState from './login';
import ForgotPasswordState from './forgotPassword';
import ResetPasswordState from './resetPassword';
import SharedMod from '../shared';
import ProductsState from './products/';
import DispenseHistory from './dispense-history/';

const module = angular.module('app.states', [
    DashboardState,
    CustomersState,
    CustomerProfileState,
    ProfileState,
    LoginState,
    ForgotPasswordState,
    ResetPasswordState,
    SharedMod,
    CustomerRevenue,
    ProductsState,
    DispenseHistory,
]);


export default module.name;
