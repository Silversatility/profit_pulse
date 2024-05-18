import angular from 'angular';
import Pagination from './pagination';
import ApiService from './api.service';
import 'ng-file-upload';

const module = angular.module('app.services.customers', [ApiService, 'ngFileUpload']);

class CustomerService {
    constructor(apiService, Upload) {
        this.apiService = apiService;
        this.uploadService = Upload;
    }

    list(page, limit, sortParameters, search, noChildren) {
        let uri = `customers/`;
        let params = {
            page: page,
            limit: limit
        };

        if (noChildren) {
          params['no_children'] = noChildren;
        }
        if (sortParameters) {
            params['ordering'] = sortParameters;
        }
        if(search){
            uri = `customers/search/`;
            params['text__contains'] = search;
        }
        return this.apiService.get(uri, params);
    }

    get(id) {
        let uri = `customers/${id}/`;
        return this.apiService.get(uri);
    }

    create(data) {
        let uri = `customers/`;
        return this.apiService.post(uri, data);
    }

    update(id, data) {
        let uri = `customers/${id}/`;
        return this.apiService.patch(uri, data);
    }

    del(id) {
        let uri = `customers/${id}/`;
        return this.apiService.del(uri);
    }

    listDispenseHistory(id, page, limit, sortParameters) {
        let uri = `customers/${id}/dispense_histories/`;
        let params = {
            page: page
        };
        if (sortParameters) {
            params['ordering'] = sortParameters;
        }
        return this.apiService.get(uri, params).then(data=>this.decodePagination(data, page, limit));
    }

    decodePagination(data, page, limit) {
        let pagination = Pagination.decode(data);
        pagination.page = page;
        pagination.limit = limit;

        return pagination;
    }

    listMinifiedCustomers() {
        let uri = `customers/minified/`;
        return this.apiService.get(uri);
    }

    listStates() {
        let uri = `customers/states/`;
        return this.apiService.get(uri);
    }

    calendar() {
        let uri = `customers/calendar/`;
        return this.apiService.get(uri);
    }

    uploadCredentialingDocument(document, customer) {
        let uri = `customers/credentialing-document-upload/`;
        let url = this.apiService.getUrl(uri);
        url += `?customer=${customer}`;
        let data = {};
        data[document.key] = document;
        return this.uploadService.upload({
            url: url,
            data: data,
            method: 'PUT'
        });
    }
}

CustomerService.$inject = ['apiService', 'Upload'];

module.service('customerService', CustomerService);
export default module.name;
