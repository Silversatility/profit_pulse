import factory


class DispenseReportFactory(factory.django.DjangoModelFactory):
    """
    Factory for :model:`DispenseReport`
    """

    class Meta:
        model = 'dispense.DispenseReport'


class DispenseHistoryFactory(factory.django.DjangoModelFactory):
    """
    Factory for :model:`dispense.DispenseHistory`
    """

    class Meta:
        model = 'dispense.DispenseHistory'
