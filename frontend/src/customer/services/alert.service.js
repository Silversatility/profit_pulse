import angular from 'angular';

export const WARNING = 'warning';
export const ERROR = 'danger';
export const SUCCESS = 'success';
export const INFO = 'info';

export class AlertMessage {

    constructor(type, message){
        this.type = type;
        this.message = message;
    }
}

export class AlertService {
    constructor () {
        this.alerts = [];
    }

    warning(message){
        this.alerts.push(new AlertMessage(WARNING, message));
    }

    error(message){
        this.alerts.push(new AlertMessage(ERROR, message));
    }

    danger(message) {
        this.alerts.push(new AlertMessage(ERROR, message));
    }

    success(message){
        this.alerts.push(new AlertMessage(SUCCESS, message));
    }

    info(message){
        this.alerts.push(new AlertMessage(INFO, message));
    }

    clearAll() {
        this.alerts =[];
    }
}

AlertService.$inject = [];

var module = angular.module('app.services.alert', []);
module.service('alertService', AlertService);
export default module.name;
