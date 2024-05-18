import angular from 'angular';
import ApiService from './api.service';

const module = angular.module('app.services.profitability', [ApiService]);

class ProfitabilityService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    getProfitability(filter, customer) {
        let params = {limit: 0};
        if (filter) {
            params['duration'] = filter;
        }
        if (customer) {
            params['customer'] = customer;
        }
        let uri = `physicians/profitability/`;
        return this.apiService.get(uri, params)
    }

    getPracticeOverview() {
        let uri =  `physicians/practice-overview/`;
        return this.apiService.get(uri);
    }

    getPhysicianOverview(customer) {
        let params = {limit: 0};
        if (customer) {
            params['customer'] = customer;
        }
        let uri =  `physicians/overview/`;
        return this.apiService.get(uri, params);
    }

}

ProfitabilityService.$inject = ['apiService'];

module.service('profitabilityService', ProfitabilityService);
export default module.name;
