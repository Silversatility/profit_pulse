# -*- coding: utf-8 -*-
from django.apps import apps


def user_post_save(sender, instance, created, **kwargs):
    """
    Function to be used as signal (post_save) when saving
    :model:`users.User`
    """
    if created and instance.is_superuser:
        Manager = apps.get_model('profiles', 'Manager')
        Manager.objects.create(
            user=instance,
            portal_access=True
        )
