import angular from 'angular';

const module = angular.module('app.services.api', []);

class ApiService {
    constructor($http, $q, $log, $state, API_BASE_URL, LOGIN_STATE, sessionService) {
        this.$http = $http;
        this.$q = $q;
        this.$log = $log;
        this.$state = $state;
        this.loginState = LOGIN_STATE;

        this.baseUrl = API_BASE_URL;
        this.sessionService = sessionService;
    }

    config(params, headers) {
        let config = {};
        if (params && Object.keys(params).length > 0) {
            config['params'] = params;
        }

        headers = this.getRequestHeaders(headers);
        if (headers && Object.keys(headers).length > 0) {
            config['headers'] = headers;
        }
        return config;
    }

    getRequestHeaders(headers) {
        headers = headers || {};
        return headers;
    }

    getUrl(uri){
        return `${this.baseUrl}/${uri}`;
    }

    success(response) {
        return response.data;
    }

    error(err) {
        this.unauthorizedError(err);
        return err;
    }

    unauthorizedError(err){
        if(!this.loginState){
            return;
        }
        if(err.status && (err.status === 401 || err.status === 403)){
            this.sessionService.clearAll();
            this.$state.go(this.loginState);
        }
    }

    get(uri, params, headers) {
        let url = this.getUrl(uri);

        let deferred = this.$q.defer();
        this.$http.get(url, this.config(params, headers))
            .then((response) => {
                deferred.resolve(this.success(response));
            })
            .catch(err => {
                deferred.reject(this.error(err));
            });

        return deferred.promise;
    }

    post(uri, data, params, headers) {
        let url = this.getUrl(uri);

        let deferred = this.$q.defer();
        this.$http.post(url, data, this.config(params, headers))
            .then((response) => {
                deferred.resolve(this.success(response));
            })
            .catch(err => {
                deferred.reject(this.error(err));
            });

        return deferred.promise;
    }

    put(uri, data, params, headers) {
        let url = this.getUrl(uri);

        let deferred = this.$q.defer();
        this.$http.put(url, data, this.config(params, headers))
            .then((response) => {
                deferred.resolve(this.success(response));
            })
            .catch(err => {
                deferred.reject(this.error(err));
            });

        return deferred.promise;
    }

    patch(uri, data, params, headers) {
        let url = this.getUrl(uri);

        let deferred = this.$q.defer();
        this.$http.patch(url, data, this.config(params, headers))
            .then((response) => {
                deferred.resolve(this.success(response));
            })
            .catch(err => {
                deferred.reject(this.error(err));
            });

        return deferred.promise;
    }

    del(uri, params, headers) {
        let url = this.getUrl(uri);

        let deferred = this.$q.defer();
        this.$http.delete(url, this.config(params, headers))
            .then((response) => {
                deferred.resolve(this.success(response));
            })
            .catch(err => {
                deferred.reject(this.error(err));
            });

        return deferred.promise;
    }
}

ApiService.$inject = ['$http', '$q', '$log', '$state', 'API_BASE_URL', 'LOGIN_STATE', 'sessionService'];

module.service('apiService', ApiService);
export default module.name;