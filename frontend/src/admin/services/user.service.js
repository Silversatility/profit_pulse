import angular from 'angular';
import apiService from './api.service';
import authService from './auth.service';
import 'ng-file-upload';

const module = angular.module('app.services.user', [apiService, authService, 'ngFileUpload']);

class UserService {
    constructor(apiService, authService, $q, $http, Upload) {
        this.apiService = apiService;
        this.authService = authService;
        this.$q = $q;
        this.$http = $http;
        this.uploadService = Upload;
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

    updateCustomer(id, data) {
        const uri = `customers/${id}/`;
        let url = this.apiService.getUrl(uri);
        const customer = new URLSearchParams(location.search).get('customer');
        if (customer) {
            url += `?customer=${customer}`;
        }
        return this.apiService.patch(uri, data);
    }

    updateSalesRepresentative(id, data) {
        let uri = `sales-representatives/${id}/`;
        return this.apiService.patch(uri, data);
    }

    getCredentialingDetails() {
        const uri = `customers/credentialing/`;
        let url = this.apiService.getUrl(uri);
        const customer = new URLSearchParams(location.search).get('customer');
        if (customer) {
            url += `?customer=${customer}`;
        }
        let deferred = this.$q.defer();
        this.$http.get(url)
            .then((response) => {
                deferred.resolve(response.data);
            })
            .catch((error) => {
                deferred.reject(error);
            });

        return deferred.promise;
    }

    downloadCredentialingDocument(url) {
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
            let tempUrl = window.URL.createObjectURL(blob);
            let tempElement = document.createElement('a');
            tempElement.href = tempUrl;
            tempElement.download = url.split('/').slice(-1)[0];
            document.body.appendChild(tempElement);
            tempElement.click();
            tempElement.remove();
        });
    }

    uploadCredentialingDocument(document, customer) {
        let uri = `customers/credentialing-document-upload/`;
        let url = this.apiService.getUrl(uri);
        if (customer) {
            url += `?customer=${customer}`;
        }
        let data = {};
        data[document.key] = document;
        return this.uploadService.upload({
            url: url,
            data: data,
            method: 'PUT'
        });
    }

    deleteCredentialingDocument(id) {
      let uri = `supporting-documents/${id}/`;
      return this.apiService.del(uri);
    }

    updateCredentialingDetails(data, id) {
        let uri = `customers/credentialing/`;
        const customer = new URLSearchParams(location.search).get('customer');
        if (customer) {
            uri += `?customer=${customer}`;
        }
        return this.apiService.put(uri, data)
    }
}

UserService.$inject = ['apiService', 'authService', '$q', '$http', 'Upload'];

module.service('userService', UserService);

export default module.name;
