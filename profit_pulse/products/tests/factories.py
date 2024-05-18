import factory


class ProductFactory(factory.django.DjangoModelFactory):
    """
    Factory for :model:`products.Product`
    """

    class Meta:
        model = 'products.Product'
