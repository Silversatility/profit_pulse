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

    currentUser() {
        const uri = `customers/current-user/`;
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

    checkUser() {
        const uri = `customers/check-user/`;
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

    updateCustomer(id, data) {
        const uri = `customers/${id}/`;
        let url = this.apiService.getUrl(uri);
        const customer = new URLSearchParams(location.search).get('customer');
        if (customer) {
            url += `?customer=${customer}`;
        }
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

    uploadCredentialingDocument(document) {
        let uri = `customers/credentialing-document-upload/`;
        let url = this.apiService.getUrl(uri);
        const customer = new URLSearchParams(location.search).get('customer');
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

    login(credential) {
        return this.authService.login(credential);
    }

    logout() {
        return this.authService.logout();
    }

    resetPassword(data){
        let uri = `api-auth/password/reset/`;
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        let formData = $.param(data);
        return this.apiService.post(uri, formData, '', headers)
            .then((data)=> {
                 return data
            })
    }

    forgotPassword(email) {
        let data = {
            email: email
        };
        let uri = `customers/password/reset/`;
        return this.apiService.post(uri, data);
    }

    me(){
        let uri = `customers/me/`;
        return this.apiService.get(uri);
    }

    isManager(){
        return this.$http.get(`${this.baseUrl}/managers/me/`).then((response) => {
            return true;
        }).catch(err => {
            return false;
        });
    }

}

UserService.$inject = ['apiService', 'authService', '$q', '$http', 'Upload'];

module.service('userService', UserService);

export default module.name;
