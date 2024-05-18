import Pagination from "../../services/pagination";
import ErrorHelper from '../../shared/error-helper';

export default class CustomerProfileCtrl {

    constructor($stateParams, customerService, toast) {
        this.customerService = customerService;
        this.$stateParams = $stateParams;

        this.customerId = $stateParams.id;
        this.data = {};
        this.dispenseHistories = [];
        this.feeStructureForm = false;
        this.toast = toast;
        this.pagination = new Pagination();
        this.items = [];
        this.sortParameters = '';
        this.feeStructures = [];
        this.startDateOpened = false;
        this.endDateOpened = false;
        this.feeStructure = {};
        this.populate();
    }

    populate() {
        this.loadCustomer();
        this.loadFeeStructures();
        this.fetch();
    }

    updateFeeStructure(feeStructure) {
      this.feeStructure = Object.assign({}, feeStructure);
      this.feeStructureForm = true;
      if (this.feeStructure.start_date) {
        this.feeStructure.start_date = new Date(this.feeStructure.start_date);
      }
      if (this.feeStructure.end_date) {
        this.feeStructure.end_date = new Date(this.feeStructure.end_date);
      }
    }

    deleteFeeStructure(id) {
      this.customerService.deleteFeeStructure(id)
        .then(() => {
          this.toast({
              duration: 5000,
              message: 'Fee Structure Deleted Successfully.',
              className: 'alert-success'
          });
          this.loadFeeStructures()
        })
        .catch((error) => {
          this.toast({
              duration: 5000,
              message: ErrorHelper.getErrorMessage(error),
              className: 'alert-danger'
          });
        })
    }

    onSubmitFeeStructure() {
      const data = Object.assign({}, this.feeStructure, { customer: this.customerId });
      if (data.start_date) {
        data.start_date = moment(this.feeStructure.start_date).format('YYYY-MM-DD')
      }
      if (data.end_date) {
        data.end_date = moment(this.feeStructure.end_date).format('YYYY-MM-DD')
      }
      if (data.id) {
        this.customerService.updateFeeStructure(data)
          .then(() => {
            this.toast({
                duration: 5000,
                message: 'Fee Structure Updated Successfully.',
                className: 'alert-success'
            });
            this.loadFeeStructures()
            this.feeStructureForm = false;
            this.feeStructure = {};
          })
          .catch((error) => {
            this.toast({
                duration: 5000,
                message: ErrorHelper.getErrorMessage(error),
                className: 'alert-danger'
            });
          })
      } else {
        this.customerService.createFeeStructure(data)
        .then((response) => {
          this.toast({
            duration: 5000,
            message: 'Fee Structure Added Successfully.',
            className: 'alert-success'
          });
          this.feeStructureForm = false;
          this.feeStructure = {};
          this.loadFeeStructures();
        })
        .catch((error) => {
          this.toast({
            duration: 5000,
            message: ErrorHelper.getErrorMessage(error),
            className: 'alert-danger'
          });
        })
      }

    };

    loadFeeStructures() {
      this.customerService
        .listFeeStructures(this.customerId)
          .then((data) => {
            this.feeStructures = data.results;
          });
    }

    loadCustomer() {
        this.customerService
            .get(this.customerId)
            .then((data) => {
                this.data = data;
            });
    }

    fetch(){
        let page = this.pagination.page;
        let limit = this.pagination.limit;
        let sortParameters = this.sortParameters;

        this.customerService
            .listDispenseHistory(this.customerId, page, sortParameters)
            .then(data =>{
              this.dispenseHistories=data.results;
              this.count = data.count;
              this.numPages = Math.ceil(data.count/20);
            } );
    }
}

CustomerProfileCtrl.$inject = ['$stateParams','customerService', 'toast'];
