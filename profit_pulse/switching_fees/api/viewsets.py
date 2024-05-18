from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, viewsets

from ..models import SwitchingFee
from .serializers import (
    SwitchingFeeSerializer,
)

from profit_pulse.core.permissions import AdminOrUserOwner
from profit_pulse.core.api.filters import RelatedOrderingFilter


class SwitchingFeeViewSet(mixins.RetrieveModelMixin,
                          mixins.ListModelMixin,
                          viewsets.GenericViewSet):
    queryset = SwitchingFee.objects.all()
    serializer_class = SwitchingFeeSerializer
    permission_classes = (AdminOrUserOwner, )
    filter_backends = (RelatedOrderingFilter, DjangoFilterBackend)
    filter_fields = ('customer',)
    ordering = ('-created',)
