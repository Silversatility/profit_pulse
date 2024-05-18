from rest_framework.generics import (
    CreateAPIView,
)
from rest_framework.permissions import AllowAny

from profit_pulse.profiles.api.serializers import CustomerSerializer
from profit_pulse.profiles.models import Customer


class CustomerEnrollment(CreateAPIView):
    """
    Enables users to enroll as a customer
    """
    model = Customer
    serializer_class = CustomerSerializer
    permission_classes = (AllowAny, )
