import NewsFeed from './newsfeeds';
import Pagination from '../../services/pagination';

export default class NewsFeedsCtrl {
  constructor($state, MESSAGES, newsFeedsService, confirmDeleteService, toast) {
    this.newsFeeds = new NewsFeed();
    this.MESSAGES = MESSAGES;
    this.newsFeedsService = newsFeedsService;
    this.confirmDeleteService = confirmDeleteService;
    this.sortParameters = '';
    this.pagination = new Pagination();
    this.newsFeedList = [];
    this.sortParameters = 'date_published';
    this.search = '';
    this.toast = toast;

    this.fetchNewsFeeds();
  }

  fetchNewsFeeds() {
    this.newsFeedsService.list(1, 0, this.sortParameters, this.search)
      .then(results => {
        this.newsFeedList = results;
      })
      .catch(err => console.log(err));
  }

  confirmDelete(uId) {
    let messagesData = {
      title: this.MESSAGES.CONFIRM_DELETE_TITLE,
      message: this.MESSAGES.CONFIRM_DELETE_MESSAGE,
      action: "Delete"
    };

    let result = this.confirmDeleteService.openConfirmDeleteModal(messagesData).result;
    result.then(success => {
      this.newsFeedsService.del(uId)
        .then(success => {
          this.pagination.page = 1;
          this.fetchNewsFeeds();

          this.toast({
            duration: 5000,
            message: this.MESSAGES.DELETE_SUCCESS,
            className: 'alert-success'
          })
        })
        .catch(error => {
          this.toast({
            duration: 5000,
            message: this.MESSAGES.DELETE_FAIL,
            className: 'alert-danger'
          })
        })
    })
  }

  onSearch() {
    this.fetchNewsFeeds();
  }

  pageChanged() {
    this.fetch();
  }
}

NewsFeedsCtrl.$inject = ['$state', 'MESSAGES', 'newsFeedsService', 'confirmDeleteService', 'toast'];