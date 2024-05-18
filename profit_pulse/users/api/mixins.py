from ..models import User


class CreateUserMixin(object):
    """
    Custom mixin for :model:`users.User` for making sure
    that a user has a password when created.
    """

    def create(self, validated_data):
        if 'password1' in validated_data \
           and 'password2' in validated_data:
            password = validated_data.pop('password1')
            validated_data.pop('password2')
        else:
            password = User.objects.make_random_password()
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
