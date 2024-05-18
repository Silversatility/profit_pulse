import angular from 'angular';
import Pagination from './pagination';
import ApiService from './api.service';
import 'ng-file-upload';

const module = angular.module('app.services.products', [ApiService, 'ngFileUpload']);

// module.service('ProductsService', function($http, $q, $log) {
//     this.get = (page, sortParameters)=>{
//         let deferred = $q.defer();
//         let url = `http://apglabs-env.npnmsv2esp.us-west-2.elasticbeanstalk.com/products/?page=${page}`;
//         if (sortParameters) {
//             url = url + `&ordering=${sortParameters}`;
//         }
//         $http.get(url)
//             .then((res) => {
//                 $log.log('products', res.data);
//                 deferred.resolve(res.data);
//             })
//             .catch((res) => {
//                 deferred.reject(res.data);
//                 $log.error(res.data);
//             });

//         return deferred.promise;

//     }

// });

class ProductService {
    constructor(apiService, Upload) {
        this.apiService = apiService;
        this.uploadService = Upload;
    }

    list(page, limit, sortParameters, search) {
        let uri = `products/`;
        let params = {
            page: page,
            page_size: limit
        };

        if (sortParameters) {
            params['ordering'] = sortParameters;
        }

        if (search){
            uri = `products/search/`;
            params['text__contains'] = search;
        }

        return this.apiService.get(uri, params)
            .then(data=> this.decodePagination(data, page, limit));
    }

    decodePagination(data, page, limit) {
        let pagination = Pagination.decode(data);
        pagination.page = page;
        pagination.limit = limit;
        return pagination;
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

    del(id) {
        let uri = `products/${id}/`;
        return this.apiService.del(uri);
    }
    
    createWithImage(data, imageFile) {
        let uri = `products/`;
        data['image']=imageFile;
        let url = this.apiService.getUrl(uri);
        return this.uploadService.upload({
            url: url,
            data: data
        });
    }
}

ProductService.$inject = ['apiService', 'Upload'];

module.service('productService', ProductService);
export default module.name;
