from rest_framework import viewsets
from rest_framework.filters import OrderingFilter

from .serializers import UserSerializer, CreateUserSerializer
from ..models import User
from profit_pulse.core.permissions import AdminOrUserOwner
from profit_pulse.profiles.models import Manager


class UserViewSet(viewsets.ModelViewSet):
    """
    Viewset for :model:`users.User`
    ---
    create:
        Creates :model:`users.User` object

    update:
        Updates :model:`users.User` object

    partial_update:
        Updates one or more fields of an existing user object

    retrieve:
        Retrieves a :model:`users.User` instance

    list:
        Returns list of all :model:`users.User` objects

    delete:
        soft deletes a :model:`users.User` instance.
    """
    queryset = User.objects.filter(is_removed=False)
    serializer_class = UserSerializer
    permission_classes = (AdminOrUserOwner, )
    filter_backends = (OrderingFilter, )
    ordering = ('created', )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateUserSerializer
        return super(UserViewSet, self).get_serializer_class()

    def get_queryset(self):
        if not self.request.user.is_admin:
            return User.objects.filter(id=self.request.user.id)
        return super(UserViewSet, self).get_queryset()

    def perform_create(self, serializer):
        user = serializer.save()
        manager_data = self.request.data.get('manager', {})
        credentialing_only = manager_data.get('credentialing_only', False)
        Manager.objects.create(user=user, portal_access=True, credentialing_only=credentialing_only)
