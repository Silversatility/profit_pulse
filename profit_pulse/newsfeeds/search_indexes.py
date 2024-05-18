from haystack import indexes

from .models import NewsFeed


class NewsFeedIndex(indexes.SearchIndex, indexes.Indexable):
    """
    Search index for :model:`dispense.NewsFeed`
    """
    text = indexes.CharField(document=True, use_template=True)
    subject = indexes.CharField()
    body = indexes.CharField()
    link = indexes.CharField()


    def get_model(self):
        return NewsFeed

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.all()

    def prepare_subject(self, obj):
        return obj.subject

    def prepare_body(self, obj):
        return obj.body

    def prepare_link(self, obj):
        return obj.link
