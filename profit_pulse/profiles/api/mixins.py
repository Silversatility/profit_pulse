from rest_framework import serializers

from django.utils.translation import ugettext_lazy as _

from profit_pulse.users.models import User
from profit_pulse.users.api.serializers import CreateUserWithPasswordSerializer


class UserChildMixin(object):
    """
    Custom mixin for parent models of :model:`users.User`.
    This will handle creation/update of parent objects along with
    the user child object.
    """

    def validate_user(self, value):
        email = value.get('email')
        lookup = User.objects.filter(email=email)
        if self.instance is not None:
            lookup = lookup.exclude(id=self.instance.user.id)

        if lookup.exists():
            raise serializers.ValidationError({
                'email': _('Email already exists.')
            })
        return value

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        serializer = CreateUserWithPasswordSerializer(data=user_data)
        serializer.is_valid()
        user = serializer.save()
        representative = self.Meta.model.objects.create(
            user=user,
            **validated_data
        )
        return representative

    def update(self, instance, validated_data):
        if 'user' in validated_data:
            user_data = validated_data.pop('user')

            # Save to User instance first
            user = instance.user

            for field, value in user_data.items():
                setattr(user, field, value)
            user.save()

        # Save to SalesRepresentative instance
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
