import ErrorHelper from '../../shared/error-helper';
export default class SalesRepEditCtrl {

    constructor($state, $stateParams, salesRepService, MESSAGES, toast) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.salesRepService = salesRepService;
        this.MESSAGES = MESSAGES;
        this.toast = toast;

        this.salesInfo = {};
        this.oldSalesName = '';

        this.populate();
    }

    populate() {
        this.salesRepService.get(this.$stateParams.id)
            .then((result) => {
                this.salesInfo = result;
                this.oldSalesName = result.user.first_name + " " + result.user.last_name;
                let phoneNumber = result.phone_number.replace('+1','');
                this.salesInfo.phone_number = phoneNumber;
            })
    }

    save(salesForm) {
        let data = {
            user: {
                first_name : this.salesInfo.user.first_name,
                last_name : this.salesInfo.user.last_name,
                email : this.salesInfo.user.email
            },
            phone_number: this.salesInfo.phone_number,
            street_address: this.salesInfo.street_address,
            state: this.salesInfo.state,
            city: this.salesInfo.city,
            zip_code: this.salesInfo.zip_code,
            portal_access: this.salesInfo.portal_access,
            new_password1: this.salesInfo.new_password1,
            new_password2: this.salesInfo.new_password2,
        };
        this.salesRepService.update(this.$stateParams.id, data)
            .then(success => {
                this.toast({
                    duration: 5000,
                    message: this.MESSAGES.UPDATE_SUCCESS,
                    className: 'alert-success'
                });

                this.oldSalesName = this.salesInfo.user.first_name + " " + this.salesInfo.user.last_name;
            })
            .catch(error => {
                this.toast({
                    duration: 5000,
                    message: ErrorHelper.getErrorMessage(error),
                    className: 'alert-danger'
                });
            })
    }
}

SalesRepEditCtrl.$inject = ['$state', '$stateParams', 'salesRepService', 'MESSAGES', 'toast'];