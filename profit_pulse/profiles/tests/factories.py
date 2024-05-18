import factory


class PhysicianFactory(factory.django.DjangoModelFactory):
    """
    Factory for :model:`profiles.Physician`
    """

    class Meta:
        model = 'profiles.Physician'


class CustomerFactory(factory.django.DjangoModelFactory):
    """
    Factory for :model:`profiles.Customer`
    """

    class Meta:
        model = 'profiles.Customer'
        django_get_or_create = ('user', )


class SalesRepresentativeFactory(factory.django.DjangoModelFactory):
    """
    Factory for :model:`profiles.SalesRepresentative`
    """

    class Meta:
        model = 'profiles.SalesRepresentative'
        django_get_or_create = ('user', )


class ManagerFactory(factory.django.DjangoModelFactory):
    """
    Factory for :model:`profiles.Manager`
    """

    class Meta:
        model = 'profiles.Manager'
        django_get_or_create = ('user', )
