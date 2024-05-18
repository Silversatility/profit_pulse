from haystack import indexes

from .models import Product


class ProductIndex(indexes.SearchIndex, indexes.Indexable):
    """
    Search index for :model:`products.Product`
    """
    text = indexes.CharField(document=True, use_template=True)
    title = indexes.CharField(model_attr='title')
    ndc = indexes.CharField(model_attr='ndc')

    def get_model(self):
        return Product

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.all()
