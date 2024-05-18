import angular from 'angular';
import Pagination from './pagination';
import ApiService from './api.service';

const module = angular.module('app.services.dashboard', [ApiService]);

class DashboardService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    getParams(filter) {
        let params = {};
        if (filter) {
            params['duration'] = filter;
        }
        return params;
    }

    getTopPerformingProducts(filter, excludeZeros, page, limit, sortParameters, search){
        let uri = `products/top/`;
        let params = this.getParams(filter);

        if (excludeZeros) {
          params['exclude_zeros'] = true
        }

        if (page) {
            params['page'] = page;
        }
        if (limit) {
            params['page_size'] = limit;
        }
        if (sortParameters) {
            params['ordering'] = sortParameters;
        }
        if (search){
            uri = `products/search/`;
            params['text__contains'] = search;
        }

        return this.apiService.get(uri, params)
            .then(data => this.decodePagination(data, page, limit));
    }

    decodePagination(data, page, limit) {
        let pagination = Pagination.decode(data);
        pagination.page = page;
        pagination.limit = limit;
        return pagination;
    }

    getDispenseHistoryReport(filter){
        let uri = `dispense-histories/admin-reports/`;
        return this.apiService.get(uri, this.getParams(filter))
    }

    getTopCustomers(filter){
        let uri=`customers/top/`;
        return this.apiService.get(uri, this.getParams(filter))
    }

    getAllCustomers(filter){
        let uri = `customers/`;
        let params = this.getParams(filter);
        params.page = 1;
        params.limit = 0;

        return this.apiService.get(uri, params);
    }

    getTotalRevenues(filter){
        let uri = `dispense-histories/admin-revenues/`;
        return this.apiService.get(uri, this.getParams(filter))
    }
    
    getTotalProfits(filter){
        let uri = `dispense-histories/admin-total-profits/`;
        return this.apiService.get(uri, this.getParams(filter))
    }

    getTopPhysicians(filter){
        let uri = `physicians/top/`;
        return this.apiService.get(uri, this.getParams(filter))
    }
}

DashboardService.$inject = ['apiService'];

module.service('DashboardService', DashboardService);
export default module.name;
