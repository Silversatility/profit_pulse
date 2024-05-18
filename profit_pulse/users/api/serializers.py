from django.contrib.auth import password_validation
from django.utils.translation import ugettext_lazy as _

from rest_framework import serializers

from .mixins import CreateUserMixin
from ..models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for :model:`users.User` CRUD
    """

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'is_owner',
            'is_customer',
            'is_manager',
            'is_admin',
            'created',
        )
        read_only_fields = (
            'id',
            'email',
            'created'
        )

    def update(self, instance, validated_data):
        from profit_pulse.profiles.api.serializers import BasicManagerSerializer

        if self.initial_data.get('manager') and instance.is_manager:
            manager_serializer = BasicManagerSerializer(instance.manager, self.initial_data.get('manager'))
            manager_serializer.is_valid(raise_exception=True)
            manager_serializer.save()
        return super().update(instance, validated_data)


class CreateUserSerializer(CreateUserMixin, serializers.ModelSerializer):
    """
    Serializer for creating :model:`users.User`
    """
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'password1',
            'password2',
            'first_name',
            'last_name',
            'is_owner'
        )
        read_only_fields = ('id', )

    def validate_password1(self, password):
        password_validation.validate_password(password, None)
        return password

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError(
                _("The two password fields didn't match.")
            )
        return data


class CreateUserWithPasswordSerializer(CreateUserMixin,
                                       serializers.ModelSerializer):
    """
    Serializer for creating :model:`users.User` with
    a system generated password
    """
    email = serializers.EmailField(validators=[])

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'is_customer',
            'is_manager',
            'is_admin',
            'has_local_auth',
            'is_sales_representative',
            'created',
        )
        read_only_fields = (
            'id',
            'is_active',
            'is_customer',
            'is_manager',
            'is_admin',
            'created'
        )
        extra_kwargs = {
            'email': {
                'validators': [], 'required': False
            }
        }
