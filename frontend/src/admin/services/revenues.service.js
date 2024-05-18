import angular from 'angular';
import Pagination from './pagination';
import ApiService from './api.service';

const module = angular.module('app.services.revenues', [ApiService]);

class RevenuesService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    list(page, limit, startDate, endDate, sortParameters) {
        let uri = `customers/revenues/`;
        let params = {
            page: page,
            limit: limit,
            sdate: startDate,
            edate: endDate
        };
        if (sortParameters) {
            params['ordering'] = sortParameters;
        }
        return this.apiService.get(uri, params);
    }
}

RevenuesService.$inject = ['apiService'];

module.service('revenuesService', RevenuesService);
export default module.name;
