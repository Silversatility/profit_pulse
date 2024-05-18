import angular from 'angular';
import uiRouter from 'angular-ui-router';
import angularInputMasks from 'angular-input-masks';
import switchingFeeTemplate from './switchingFee.html';
import SwitchingFeeCtrl from './switchingFee.ctrl';
import headerTemplate from '../../layout/header.html';
import sidebarTemplate from '../../layout/sidebar.html';
import footerTemplate from '../../layout/footer.html';
import SwitchingFeeService from '../../services/switching-fee.service';

const module = angular.module('app.states.switching-fee', [uiRouter, angularInputMasks, SwitchingFeeService]);
module.controller('SwitchingFeeCtrl', SwitchingFeeCtrl);
module.config(function ($stateProvider) {

  $stateProvider
    .state('switchingFee', {
      url: '/switchingFee',
      views: {
        'header': {
          template: headerTemplate
        },
        'sidebar': {
          template: sidebarTemplate
        },
        'footer': {
          template: footerTemplate
        },
        'content': {
          controller: 'SwitchingFeeCtrl',
          controllerAs: 'vm',
          template: switchingFeeTemplate
        }
      }
    });

});

export default module.name;