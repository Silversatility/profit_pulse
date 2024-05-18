import angular from 'angular';
import Pagination from './pagination';
import ApiService from './api.service';

const module = angular.module('app.services.products', [ApiService]);


class ProductsService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    list(page, limit, sortParameters) {
        let uri = `products/active/`;
        let params = {
            page: page,
            page_size: limit
        };

        if (sortParameters) {
            params['ordering'] = sortParameters;
        }

        return this.apiService.get(uri, params)
            .then((data)=>{
                return Pagination.decode(data);
            });
    }

    get(id) {
        let uri = `products/${id}/`;
        return this.apiService.get(uri);
    }

    create(data) {
        let uri = `products/`;
        return this.apiService.post(uri, data);
    }

    update(id, data) {
        let uri = `products/${id}/`;
        return this.apiService.patch(uri, data);
    }
}

ProductsService.$inject = ['apiService'];

module.service('productsService', ProductsService);
export default module.name;
