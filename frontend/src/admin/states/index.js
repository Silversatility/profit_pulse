import angular from 'angular';
import DashboardState from './dashboard/';
import CustomerDashboardState from './customerDashboard/';
import DispenseHistoryState from './dispense-history/';
import ProductsState from './products/';
import SalesRepState from './sales-rep';
import SalesRepProfileState from './sales-rep-profie';
import SalesRepEditState from './sales-rep-edit';
import CustomersState from './customers';
import CustomerProfileState from './customerProfile';
import CustomerDocumentsState from './customerDocuments';
import CustomerEditState from './customerEdit';
import CustomerMergeState from './customerMerge';
import CustomerNotesState from './customerNotes';
import CustomerRevenueState from './customerRevenue';
import RevenueReportState from './revenueReport';
import CredentialingState from './credentialing';
import CredentialingSingleState from './credentialingSingle';
import ProfitabilityState from './profitability';
import NewsFeedsState from './newsfeeds';
import NewsFeedEditState from './newsFeedEdit';
import NewsFeedCreateState from './newsFeedCreate';
import SwitchingFeeState from './switchingFee';

// import ProfitReportState from './profitReport';
import AdminUsersState from './admin-users';
import ProfileState from './profile';
import LoginState from './login';
import SharedMod from '../shared';
import ForgotPasswordState from './forgotPassword';
import ResetPasswordState from './resetPassword';


const module = angular.module('app.states', [
    DashboardState,
    CustomerDashboardState,
    DispenseHistoryState,
    ProductsState,
    SalesRepState,
    SalesRepProfileState,
    SalesRepEditState,
    CustomersState,
    CustomerProfileState,
    CustomerDocumentsState,
    CustomerEditState,
    CustomerMergeState,
    CustomerNotesState,
    CustomerRevenueState,
    RevenueReportState,
    CredentialingState,
    CredentialingSingleState,
    ProfitabilityState,
    NewsFeedsState,
    NewsFeedEditState,
    NewsFeedCreateState,
    SwitchingFeeState,
    // ProfitReportState,
    AdminUsersState,
    ProfileState,
    LoginState,
    SharedMod,
    ForgotPasswordState,
    ResetPasswordState
]);


export default module.name;
