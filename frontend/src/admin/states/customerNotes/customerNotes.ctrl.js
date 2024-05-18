import ErrorHelper from '../../shared/error-helper';
import UsStates from '../customers/us-states';

export default class CustomerNotesCtrl {

    constructor($state, $stateParams, $filter, MESSAGES, customerService, toast) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$filter = $filter;
        this.MESSAGES = MESSAGES;
        this.customerService = customerService;
        this.toast = toast;
        this.customerName = '';

        this.customerService
            .get(this.$stateParams.id)
            .then((data)=>{
                this.editableData = { notes: data.notes };
                this.customerName = data.business_name;
            });
    }

    save(){
        let object = { notes: this.editableData.notes };

        this.customerService
            .update(this.$stateParams.id, object)
            .then((res)=>{
                this.toast({
                    duration: 5000,
                    message: 'Customer Notes Updated Successfully.',
                    className: 'alert-success'
                });

                this.oldCustomerName = this.editableData.business_name;
            })
            .catch(err=> {
                this.toast({
                    duration: 5000,
                    message: ErrorHelper.getErrorMessage(err),
                    className: 'alert-danger'
                });
            });
    }
}

CustomerNotesCtrl.$inject = ['$state', '$stateParams', '$filter', 'MESSAGES', 'customerService','toast'];
