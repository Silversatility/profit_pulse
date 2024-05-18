import NewsFeed from './newsfeed';
import ErrorHelper from '../../shared/error-helper';

export default class NewsFeedCreateCtrl {

  constructor($state, MESSAGES, newsFeedsService, userService, toast) {
    this.$state = $state;
    this.newsFeedsService = newsFeedsService;
    this.userService = userService;
    this.author = null;

    this.MESSAGES = MESSAGES;
    this.newNewsFeed = false;
    this.newsFeed = new NewsFeed();

    this.toast = toast;
    this.getUserProfile();
  }

  getUserProfile() {
    this.userService.me()
      .then(data => {
        this.author = data.user.id;
      });
  }

  chooseFile() {
    let el = document.getElementById('thumbnail');
    el.click();
  }

  onSubmit(newsFeedCreateForm) {
    let object = Object.assign({}, this.newsFeed);
    object.author = this.author;
    if (! object.thumbnail.type) {
      delete object.thumbnail;
    }
    this.newsFeedsService.create(object)
      .then(data => {
        this.$state.go('newsfeeds');
        this.toast({
          duration: 5000,
          message: this.MESSAGES.ADD_NEWS_FEED_OK,
          className: 'alert-success'
        });

        this.newNewsFeed = false;
      })
      .catch(err => this.error(err));
  }

  error(err) {
    this.toast({
      duration: 5000,
      message: ErrorHelper.getErrorMessage(err),
      className: 'alert-danger'
    });
  }

}

NewsFeedCreateCtrl.$inject = [
  '$state',
  'MESSAGES',
  'newsFeedsService',
  'userService',
  'toast',
];
