from django.db.models import F
from django_filters.rest_framework import DjangoFilterBackend
from drf_haystack.viewsets import HaystackViewSet
from rest_framework import viewsets, mixins

from .pagination import DispenseHistoryPagination, FeeStructurePagination
from .permissions import AdminOrCustomerOwner
from .serializers import (
    DispenseHistorySerializer,
    DispenseHistorySearchSerializer,
    FeeStructureSerializer,
)
from ..models import DispenseHistory, FeeStructure
from profit_pulse.core.api.filters import RelatedOrderingFilter


class DispenseHistoryViewSet(mixins.RetrieveModelMixin,
                             mixins.ListModelMixin,
                             viewsets.GenericViewSet):
    """
    Viewset for :model:`dispense.DispenseHistory`
    ---
    retrieve:
        Retrieves a :model:`dispense.DispenseHistory` instance

    list:
        Returns list of all :model:`dispense.DispenseHistory` objects
    """
    queryset = DispenseHistory.objects.filter(
        total_paid__gt=0, quantity__gt=0).annotate(dfbypass_margin=F('total_paid') - F('cost')
    )
    serializer_class = DispenseHistorySerializer
    permission_classes = (AdminOrCustomerOwner, )
    filter_backends = (RelatedOrderingFilter, DjangoFilterBackend)
    ordering = ('-order_date', )
    filter_fields = ('customer', 'customer__state')
    pagination_class = DispenseHistoryPagination

    def get_queryset(self):
        queryset = super(DispenseHistoryViewSet, self).get_queryset()
        if self.request.user.is_admin:
            return queryset
        elif self.request.user.is_customer:
            customer = self.request.user.customer
            return queryset.filter(customer=customer)
        elif self.request.user.is_sales_representative:
            representative = self.request.user.sales_representative
            return queryset.filter(
                customer__sales_representative=representative
            )


class DispenseHistorySearchViewSet(HaystackViewSet):
    """
    Handles search feature for Dispense Histories
    """
    index_models = [DispenseHistory]
    serializer_class = DispenseHistorySearchSerializer
    ordering = ('-order_date', )
    duration_field = 'order_date'
    pagination_class = DispenseHistoryPagination

    def get_base_queryset(self):
        queryset = DispenseHistory.objects.filter(total_paid__gt=0, quantity__gt=0)
        if self.request.user.is_admin:
            return queryset
        elif self.request.user.is_customer:
            customer = self.request.user.customer
            return queryset.filter(customer=customer)
        elif self.request.user.is_sales_representative:
            representative = self.request.user.sales_representative
            return queryset.filter(
                customer__sales_representative=representative
            )

    def get_queryset(self, index_models=[]):
        queryset = super(DispenseHistorySearchViewSet, self).get_queryset(
            index_models
        )
        ids = self.get_base_queryset().values_list('id', flat=True).distinct()
        return queryset.filter(id__in=ids)


class FeeStuctureViewset(viewsets.ModelViewSet):
    serializer_class = FeeStructureSerializer
    ordering = ['-start_date']
    pagination_class = FeeStructurePagination
    queryset = FeeStructure.objects.all()
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('customer',)
