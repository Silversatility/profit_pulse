import angular from 'angular';
import Pagination from './pagination';
import ApiService from './api.service';

const module = angular.module('app.services.dispense-histories', [ApiService]);
const DATE_FORMAT = 'YYYY-MM-DD';

class DispenseHistoryService {
    constructor(apiService, $filter) {
        this.apiService = apiService;
        this.$filter = $filter;
    }

    list(page, limit, sortParameters, search, filterForm) {
        let uri = `dispense-histories/dated/`;
        let params = {
            page: page,
            page_size: limit
        };

        if (sortParameters) {
            params['ordering'] = sortParameters;
        }
        if (filterForm.state) {
            params['customer__state'] = filterForm.state;
        }
        if (filterForm.customer) {
            params['customer'] = filterForm.customer;
        }
        if (search) {
            params['search'] = search;
        }
        Object.assign(params, this.filterDateParams(filterForm));
        return this.apiService.get(uri, params)
            .then(data => this.decodePagination(data, page, limit));
    }

    filterDateParams(filterForm) {
        let params = {};
        if (!filterForm) {
            return params;
        }
        if (filterForm.dateRange && filterForm.dateRange.startDate) {
            params['sdate'] = this.$filter('date')(filterForm.dateRange.startDate, 'yyyy-MM-dd');
        }
        if (filterForm.dateRange && filterForm.dateRange.endDate) {
            params['edate'] = this.$filter('date')(filterForm.dateRange.endDate, 'yyyy-MM-dd');
        }

        return params;
    }

    decodePagination(data, page, limit) {
        let pagination = Pagination.decode(data);
        pagination.page = page;
        pagination.limit = limit;

        return pagination;
    }

    get(id) {
        let uri = `dispense-histories/${id}/`;
        return this.apiService.get(uri);
    }
}

DispenseHistoryService.$inject = ['apiService', '$filter'];

module.service('dispenseHistoryService', DispenseHistoryService);
export default module.name;
