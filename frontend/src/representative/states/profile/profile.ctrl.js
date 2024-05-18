import Profiles from './profile';
import ErrorHelper from '../../shared/error-helper';

export default class ProfileCtrl {

    constructor($q, userService, MESSAGES, toast) {
        this.$q = $q;
        this.userService = userService;
        this.MESSAGES = MESSAGES;
        this.toast = toast;

        this.profiles = new Profiles();
        this.userId = '';

        this.populate();
    }

    populate(){
        this.userService.me()
            .then(data => {
                this.myProfile = data;
                this.profiles.user.first_name = data.user.first_name;
                this.profiles.user.last_name = data.user.last_name;
                this.profiles.user.email = data.user.email;
                this.profiles.phone_number = data.phone_number;
                this.profiles.company_goal = data.company_goal;
                this.profiles.overhead = data.overhead;
                this.profiles.commissions_owed = data.commissions_owed;
                this.userId = data.user.id;
            })
    }

    save(){
        let data = {
            user: this.profiles.user,
            phone_number : this.profiles.phone_number,
            company_goal: this.profiles.company_goal,
            overhead: this.profiles.overhead,
            commissions_owed: this.profiles.commissions_owed
        };

        this.updateSalesRepresentative(this.userId, data);
    }

    updateSalesRepresentative(userID, data){
        this.$q.all([this.userService.updateSalesRepresentative(userID, data), this.changPassword()])
            .then(success => {
                this.updateProfileSuccess(success);
            })
            .catch(error => {
                this.updateProfileError(error);
            });
    }

    changPassword(){
        let data = {
            old_password: this.profiles.old_password,
            new_password1: this.profiles.new_password1,
            new_password2: this.profiles.new_password2
        };

        if(this.profiles.old_password){
            return this.userService.changePassword(data);
        } else{
            return this.$q.resolve(true);
        }

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
        this.profiles.old_password = '';
        this.profiles.new_password1 = '';
        this.profiles.new_password2 = '';
    }
}

ProfileCtrl.$inject = ['$q', 'userService', 'MESSAGES', 'toast'];
