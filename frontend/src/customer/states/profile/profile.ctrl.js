import Profile from './profile';
import ErrorHelper from '../../shared/error-helper';

export default class ProfileCtrl {

    constructor($q, userService, MESSAGES, toast) {
        this.$q = $q;
        this.userService = userService;
        this.MESSAGES = MESSAGES;

        this.toast = toast;

        this.profile = new Profile();
        this.userId = '';

        this.populate();
    }

    populate(){
        this.userService.currentUser()
            .then(data => {
                this.myProfile = data;
                this.profile.user.first_name = data.user.first_name;
                this.profile.user.last_name = data.user.last_name;
                this.profile.user.email = data.user.email;
                this.profile.business_name = data.business_name;
                this.profile.phone_number = data.phone_number;
                this.profile.clinic_type = data.clinic_type;
                this.userId = data.user.id;
            })
    }

    save(){
        let data = {
            user: this.profile.user,
            business_name: this.profile.business_name,
            phone_number: this.profile.phone_number,
            clinic_type: this.profile.clinic_type,
            old_password: this.profile.old_password,
            new_password1: this.profile.new_password1,
            new_password2: this.profile.new_password2,
        };

        this.updateProfileManager(this.userId, data);
    }

    updateProfileManager(userID, data){
        this.userService.updateCustomer(userID, data)
            .then(success => {
                this.updateProfileSuccess(success);
            })
            .catch(error => {
                this.updateProfileError(error);
            });
    }

    updateProfileSuccess(success){
        this.toast({
            duration: 5000,
            message: this.MESSAGES.UPDATE_SUCCESS,
            className: 'alert-success'
        });

        this.clearPasswordFrom();
    }

    updateProfileError(error){
        this.toast({
            duration: 5000,
            message: ErrorHelper.getErrorMessage(error),
            className: 'alert-danger'
        });
    }

    clearPasswordFrom(){
        this.profile.old_password = '';
        this.profile.new_password1 = '';
        this.profile.new_password2 = '';
    }
}

ProfileCtrl.$inject = ['$q', 'userService', 'MESSAGES', 'toast'];
