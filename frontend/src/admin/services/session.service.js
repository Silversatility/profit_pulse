import angular from 'angular';
import 'angular-local-storage';


const module = angular.module('app.services.session', ['LocalStorageModule']);

class SessionService {
    constructor(localStorageService) {
        this.storage = localStorageService;
    }

    setItem(key, value) {
        this.storage.set(key, value);
    }

    getItem(key) {
        return this.storage.get(key);
    }

    remove(key){
        return this.storage.remove(key);
    }

    clearAll(){
        return this.storage.clearAll();
    }
}

SessionService.$inject = ['localStorageService'];

module.service('sessionService', SessionService);
module.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('PROFIT_PULSE')
        .setStorageType('localStorage')
        .setNotify(true, true)
});
export default module.name;