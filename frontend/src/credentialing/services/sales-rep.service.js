import angular from 'angular';
import Pagination from './pagination';
import ApiService from './api.service';

const module = angular.module('app.services.salesw', [ApiService]);

class SalesRepService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    list(page, limit, sortParameters, search) {
        let uri = `sales-representatives/`;
        let params = {
            page: page,
            page_size: limit
        };
        if (sortParameters) {
            params['ordering'] = sortParameters;
        }

        if(search){
            uri = `sales-representatives/search/`;
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

    get(id) {
        let uri = `sales-representatives/${id}/`;
        return this.apiService.get(uri);
    }

    create(data) {
        let uri = `sales-representatives/`;
        return this.apiService.post(uri, data);
    }

    update(id, data) {
        let uri = `sales-representatives/${id}/`;
        return this.apiService.patch(uri, data);
    }

    del(id) {
        let uri = `sales-representatives/${id}/`;
        return this.apiService.del(uri);
    }

    listCustomers(salesRepId, page, limit) {
        let uri = `sales-representatives/${salesRepId}/customers/`;
        let params = {
            page: page,
            page_size: limit
        };
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

SalesRepService.$inject = ['apiService'];

module.service('salesRepService', SalesRepService);
export default module.name;
