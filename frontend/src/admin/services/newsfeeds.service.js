import angular from 'angular';
import Pagination from './pagination';
import ApiService from './api.service';
import 'ng-file-upload';

const module = angular.module('app.services.newsfeeds', [ApiService, 'ngFileUpload']);

class NewsFeedsService {
  constructor(apiService, Upload) {
    this.apiService = apiService;
    this.uploadService = Upload;
  }

  list(page, limit, sortParameters, search) {
    let uri = `newsfeeds/`;
    let params = {
      page: page,
      limit: limit
    };

    if (sortParameters) {
      params['ordering'] = sortParameters;
    }

    if (search) {
      uri = `newsfeeds/search/`;
      params['text__contains'] = search;
    }

    return this.apiService.get(uri, params);
  }

  get(id) {
    let uri = `newsfeeds/${id}/`;
    return this.apiService.get(uri);
  }

  create(data) {
    let url = this.apiService.getUrl('newsfeeds/');
    if (data.thumbnail) {
      return this.uploadService.upload({
        url,
        data: data,
      });
    } else {
      return this.apiService.post('newsfeeds/', data);
    }
  }

  update(id, data) {
    let url = this.apiService.getUrl(`newsfeeds/${id}/`);
    if (data.thumbnail) {
      return this.uploadService.upload({
        url,
        data: data,
        method: 'PUT',
      });
    } else {
      return this.apiService.patch(`newsfeeds/${id}/`, data);
    }
  }

  del(id) {
    let uri = `newsfeeds/${id}/`;
    return this.apiService.del(uri);
  }

  createWithImage(data, imageFile) {
    let uri = `newsfeeds/`;
    data['image'] = imageFile;
    let url = this.apiService.getUrl(uri);
    return this.uploadService.upload({
      url: url,
      data: data
    });
  }
}

NewsFeedsService.$inject = ['apiService', 'Upload'];

module.service('newsFeedsService', NewsFeedsService);
export default module.name;
