from haystack import indexes

from .models import DispenseHistory


class DispenseHistoryIndex(indexes.SearchIndex, indexes.Indexable):
    """
    Search index for :model:`dispense.DispenseHistory`
    """
    text = indexes.CharField(document=True, use_template=True)
    physician = indexes.CharField()
    product = indexes.CharField()
    order_date = indexes.DateTimeField(model_attr='order_date')

    def get_model(self):
        return DispenseHistory

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.filter(total_paid__gt=0, quantity__gt=0)

    def prepare_physician(self, obj):
        return obj.physician.name

    def prepare_product(self, obj):
        return obj.product.title
