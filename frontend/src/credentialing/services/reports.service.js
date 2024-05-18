import angular from 'angular';
import ApiService from './api.service';

const module = angular.module('app.services.reports', [ApiService]);

class ReportsService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    list(page, limit, startDate, endDate, sortParameters) {
        let uri = `customers/revenue-reports/`;
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

    list2(page, limit, startDate, endDate, sortParameters) {
        let uri = `customers/revenue-reports-2/`;
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

ReportsService.$inject = ['apiService'];

module.service('reportsService', ReportsService);
export default module.name;
