from haystack import indexes

from .models import Customer, SalesRepresentative


class CustomerIndex(indexes.SearchIndex, indexes.Indexable):
    """
    Search index for :model:`profiles.Customer`
    """
    text = indexes.CharField(document=True, use_template=True)
    first_name = indexes.CharField()
    last_name = indexes.CharField()
    clinic_type = indexes.CharField(model_attr='clinic_type')
    email = indexes.CharField()
    business_name = indexes.CharField(model_attr='business_name')

    def get_model(self):
        return Customer

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.all()

    def prepare_first_name(self, obj):
        return obj.user.first_name

    def prepare_last_name(self, obj):
        return obj.user.last_name

    def prepare_email(self, obj):
        return obj.user.email


class SalesRepresentativeIndex(indexes.SearchIndex, indexes.Indexable):
    """
    Search index for :model:`profiles.SalesRepresentative`
    """
    text = indexes.CharField(document=True, use_template=True)
    first_name = indexes.CharField()
    last_name = indexes.CharField()
    email = indexes.CharField()

    def get_model(self):
        return SalesRepresentative

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.all()

    def prepare_first_name(self, obj):
        return obj.user.first_name

    def prepare_last_name(self, obj):
        return obj.user.last_name

    def prepare_email(self, obj):
        return obj.user.email
