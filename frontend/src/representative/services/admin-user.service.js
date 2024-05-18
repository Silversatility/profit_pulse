import angular from 'angular';
import Pagination from './pagination';
import ApiService from './api.service';

const module = angular.module('app.services.adminUser', [ApiService]);

class AdminUserService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    list(page, limit) {
        let uri = `managers/`;
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

    get(id) {
        let uri = `managers/${id}/`;
        return this.apiService.get(uri);
    }

    create(data) {
        let uri = `users/`;
        return this.apiService.post(uri, data);
    }

    update(id, data) {
        let uri = `users/${id}/`;
        return this.apiService.patch(uri, data);
    }

    del(id){
        let uri = `users/${id}/`;
        return this.apiService.del(uri);
    }
}

AdminUserService.$inject = ['apiService'];

module.service('adminUserService', AdminUserService);
export default module.name;
