import ErrorHelper from '../../shared/error-helper';

export default class NewsFeedEditCtrl {

  constructor($state, $stateParams, $filter, MESSAGES, newsFeedsService, toast) {
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$filter = $filter;
    this.MESSAGES = MESSAGES;
    this.sortParameters = '';
    this.newsFeedsService = newsFeedsService;
    this.newsFeeds = [];
    this.oldNewsFeedName = '';
    this.search = '';
    this.toast = toast;

    this.newsFeedsService
      .get(this.$stateParams.id)
      .then((data) => {
        let fileName;
        if (data.thumbnail) {
          fileName = data.thumbnail.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
        } else {
          fileName = 'No file chosen.';
        }
        this.editableData = data;
        this.editableData.thumbnail = {};
        this.editableData.thumbnail.name = fileName;
      });
  }

  fetchNewsFeeds(searchParams) {
    this.newsFeedsService.list(1, 0, this.sortParameters, this.search, true)
      .then((data) => {
        this.newsFeeds = data.results;
      })
      .catch(err => console.log(err));
  }

  chooseFile() {
    let el = document.getElementById('thumbnail');
    el.click();
  }

  save() {
    let object = Object.assign({}, this.editableData);
    if (! object.thumbnail.type) {
      delete object.thumbnail;
    }
    this.newsFeedsService
      .update(this.$stateParams.id, object)
      .then((res) => {
        this.toast({
          duration: 5000,
          message: 'News Feed Updated Successfully.',
          className: 'alert-success'
        });
      })
      .catch(err => {
        this.toast({
          duration: 5000,
          message: ErrorHelper.getErrorMessage(err),
          className: 'alert-danger'
        });
      });
  }

}

NewsFeedEditCtrl.$inject = ['$state', '$stateParams', '$filter', 'MESSAGES', 'newsFeedsService', 'toast'];
