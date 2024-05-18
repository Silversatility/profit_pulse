import angular from 'angular';
import Pagination from './pagination';
import ApiService from './api.service';

const module = angular.module('app.services.dispense-histories', [ApiService]);

class DispenseHistoryService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    list1(page, limit, sortParameters, search, startDate, endDate, customer) {

        let uri = `dispense-histories/dated/`;
        if(search){
            uri = `dispense-histories/search/`;
        }
        let params = {
            page: page,
            page_size: limit,
            sdate: startDate,
            edate: endDate
        };
        if (sortParameters) {
            params['ordering'] = sortParameters;
        }
        if(search){
            params['text__contains'] = search;
        }
        if(customer){
            params['customer'] = customer;
        }
        return this.apiService.get(uri, params)
            .then(data => this.decodePagination(data, page, limit));
    }

    list2(page, limit, sortParameters, search, duration, customer) {
        let uri = `dispense-histories/`;
        if(search){
            uri = `dispense-histories/search/`;
        }
        let params = {
            page: page,
            page_size: limit,
            duration: duration
        };
        if (sortParameters) {
            params['ordering'] = sortParameters;
        }
        if(search){
            params['text__contains'] = search;
        }
        if(customer){
            params['customer'] = customer;
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
}

DispenseHistoryService.$inject = ['apiService'];

module.service('dispenseHistoryService', DispenseHistoryService);
export default module.name;
