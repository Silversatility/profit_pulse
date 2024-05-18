import angular from 'angular';
import DashboardState from './dashboard/';
import CustomerDocumentsState from './customerDocuments';
import CredentialingState from './credentialing';
import ProfileState from './profile';
import LoginState from './login';
import ForgotPasswordState from './forgotPassword';
import ResetPasswordState from './resetPassword';
import SharedMod from '../shared';

const module = angular.module('app.states', [
    DashboardState,
    CustomerDocumentsState,
    CredentialingState,
    ProfileState,
    LoginState,
    ForgotPasswordState,
    ResetPasswordState,
    SharedMod,
]);


export default module.name;
