import angular from 'angular';
import Pagination from './pagination';
import ApiService from './api.service';

const module = angular.module('app.services.switching-fee', [ApiService]);
const DATE_FORMAT = 'YYYY-MM-DD';

class SwitchingFeeService {
  constructor(apiService, $filter) {
    this.apiService = apiService;
    this.$filter = $filter;
  }

  list(page, limit, sortParameters, search, filterForm) {
    let uri = `switching-fees/`;
    let params = {
      page: page,
      limit: limit
    };

    if (sortParameters) {
      params['ordering'] = sortParameters;
    }
    if (filterForm.customer) {
      params['customer'] = filterForm.customer;
    }
    if (search) {
      uri = `switching-fees/search/`;
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
    let uri = `switching-fees/${id}/`;
    return this.apiService.get(uri);
  }
}

SwitchingFeeService.$inject = ['apiService', '$filter'];

module.service('SwitchingFeeService', SwitchingFeeService);
export default module.name;
