import angular from 'angular';
import apiService from './api.service';
import authService from './auth.service';

const module = angular.module('app.services.user', [apiService, authService]);

class UserService {
    constructor(apiService, authService) {
        this.apiService = apiService;
        this.authService = authService;
    }

    login(credential) {
        return this.authService.login(credential);
    }

    logout(){
        return this.authService.logout();
    }

    list(page, limit) {
        let uri = `users/`;
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

    create(data) {
        let uri = `users/`;
        return this.apiService.post(uri, data);
    }

    update(id, data) {
        let uri = `users/${id}/`;
        return this.apiService.patch(uri, data);
    }

    changePassword(data) {
        let uri = `api-auth/password/change/`;
        return this.apiService.post(uri, data);
    }

    updateManager(id, data) {
        let uri = `managers/${id}/`;
        return this.apiService.patch(uri, data);
    }

    updateSalesRepresentative(id, data) {
        let uri = `sales-representatives/${id}/`;
        return this.apiService.patch(uri, data);
    }

    me(){
        let uri = `me/`;
        return this.apiService.get(uri);
    }

    resetPassword(email) {
        let data = {
            email: email
        };
        let uri = `managers/password/reset/`;
        return this.apiService.post(uri, data);
    }

    confirmPassword(data) {
        let uri = `api-auth/password/reset/`;
        return this.apiService.post(uri, data);
    }
}

UserService.$inject = ['apiService', 'authService'];

module.service('userService', UserService);

export default module.name;
