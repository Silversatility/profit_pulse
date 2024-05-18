import factory


class AdminUserFactory(factory.django.DjangoModelFactory):
    """
    Factory for :model:`users.User`
    """

    email = factory.Faker('email')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True
    is_staff = True
    is_superuser = True

    class Meta:
        model = 'users.User'
        django_get_or_create = ('email',)


class RegularUserFactory(factory.django.DjangoModelFactory):
    """
    Factory for regular :model:`users.User`
    """

    email = factory.Faker('email')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True

    class Meta:
        model = 'users.User'
        django_get_or_create = ('email',)
