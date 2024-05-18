import angular from 'angular';
import Pagination from './pagination';
import ApiService from './api.service';

const module = angular.module('app.services.customerDashboard', [ApiService]);

class CustomerDashboardService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    getParams(filter, filterCustomer) {
        let params = {};
        if (filter) {
            params['duration'] = filter;
        }
        if (filterCustomer) {
            params['customer'] = filterCustomer;
        }
        return params;
    }

    getCustomers(){
        let uri = `customers/?limit=0`;
        return this.apiService.get(uri)
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

    getMyTopPerformingProducts(filter, filterCustomer){
        let uri = `customers/me/top-products/`;
        return this.apiService.get(uri, this.getParams(filter, filterCustomer))
    }

    getPhysiciansTop(filter, filterCustomer){
        let uri = `physicians/top/`;
        return this.apiService.get(uri, this.getParams(filter, filterCustomer))
    }

    getDispenseHistoryReport(filter, filterCustomer){
        let uri =  `dispense-histories/customer-reports/`;
        return this.apiService.get(uri, this.getParams(filter, filterCustomer));
    }

    getTotalRevenues(filter, filterCustomer){
        let uri = `dispense-histories/customer-revenues/`;
        return this.apiService.get(uri, this.getParams(filter, filterCustomer))
    }

    getTotalProfits(filter, filterCustomer) {
        let uri = `dispense-histories/customer-profits/`;
        return this.apiService.get(uri, this.getParams(filter, filterCustomer))
    }

}

CustomerDashboardService.$inject = ['apiService'];

module.service('CustomerDashboardService', CustomerDashboardService);
export default module.name;
