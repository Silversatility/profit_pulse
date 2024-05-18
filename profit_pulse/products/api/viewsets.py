from collections import OrderedDict
from drf_haystack.viewsets import HaystackViewSet
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
    JSONParser,
)
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.db.models import Count, DecimalField, ExpressionWrapper, F, Min, Q, Sum
from django.shortcuts import get_object_or_404

from .serializers import ProductSerializer, ProductSearchSerializer
from ..models import Product
from profit_pulse.profiles.models import Customer
from profit_pulse.core.api.filters import RelatedOrderingFilter
from profit_pulse.core.permissions import AdminOrManager
from profit_pulse.dispense.utils import get_duration_filter


class PageSizePageNumberPagination(PageNumberPagination):
    page_size_query_param = 'page_size'

    def get_paginated_response(self, data):
        current_page = self.request.query_params.get(self.page_query_param, 1)
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('current_page', current_page),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data),
        ]))


class ProductViewSet(viewsets.ModelViewSet):
    """
    Viewset for :model:`products.Product`
    ---
    create:
        Creates :model:`products.Product` object

    update:
        Updates :model:`products.Product` object

    partial_update:
        Updates one or more fields of an existing product object

    retrieve:
        Retrieves a :model:`products.Product` instance

    list:
        Returns list of all :model:`products.Product` objects
        that were not removed

    delete:
        soft deletes a :model:`products.Product` instance.

    """
    queryset = Product.objects.filter(is_datascan_import=False)
    serializer_class = ProductSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = PageSizePageNumberPagination
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    filter_backends = (RelatedOrderingFilter, )
    ordering = ('created', )

    def get_permissions(self):
        ACCEPTED_METHOD = ['POST', 'PUT', 'PATCH', 'DELETE']
        if self.request.method in ACCEPTED_METHOD:
            return [AdminOrManager()]
        return super(ProductViewSet, self).get_permissions()

    def calculate_percentage(self, amount, total):
        return (amount / total) * 100 if total else 0

    @action(detail=False, url_path='top', ordering=('-dispense_history_count',))
    def top_performing(self, request, *args, **kwargs):
        """
        Returns the 10 top performing products identified by having
        more positive entries in the DispenseHistory model.
        Filtered by ?duration=today/yesterday/this_week/this_month/year_to_date/last_year_to_date/last_3_years
        """
        queryset = Product.all_objects.all()

        if request.query_params.get('customer'):
            customer = get_object_or_404(Customer, user_id=request.query_params.get('customer'))
            if customer.children.exists():
                queryset = queryset.filter(dispense_histories__customer__parent=customer)
            else:
                queryset = queryset.filter(dispense_histories__customer=customer)

        if request.user.is_sales_representative:
            sales_representative = request.user.sales_representative
            queryset = queryset.filter(
                dispense_histories__customer__sales_representative=sales_representative
            ).distinct()

        queryset = queryset.annotate(
            dispense_history_count=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    request.query_params.get('duration', 'this_month'),
                    'dispense_histories__order_date'
                )
            )),
            cost_min=Min('dispense_histories__cost', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
            )),
            total_quantity=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    request.query_params.get('duration', 'this_month'),
                    'dispense_histories__order_date'
                )
            )),
            total_margin=Sum('dispense_histories__total_paid', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    request.query_params.get('duration', 'this_month'),
                    'dispense_histories__order_date'
                )
            )) - Sum('dispense_histories__cost', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    request.query_params.get('duration', 'this_month'),
                    'dispense_histories__order_date'
                )
            )),
        ).annotate(
            average_margin=ExpressionWrapper(
                F('total_margin') / F('total_quantity'),
                output_field=DecimalField(max_digits=7, decimal_places=2)
            ),
        ).filter(dispense_history_count__gt=0)

        ranks = {}
        for index, count in enumerate(
            queryset.order_by('-dispense_history_count').values_list('dispense_history_count', flat=True)
        ):
            ranks.setdefault(count, index + 1)
        top_total = queryset.aggregate(total=Sum('dispense_history_count'))['total']
        queryset = queryset.annotate(
            performance_percentage=F('dispense_history_count') / float(top_total or 0) * 100,
        )

        filter_ = OrderingFilter()
        filter_.ordering_fields = ('title', 'ndc', 'dispense_history_count', 'cost_min', 'average_margin')
        queryset = filter_.filter_queryset(request, queryset, self)

        paginated = self.paginate_queryset(queryset)
        for product in paginated:
            product.rank = ranks[product.dispense_history_count]
        serializer = self.get_serializer(paginated, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False)
    def active(self, request, *args, **kwargs):
        """
        Returns all active products that were not removed.
        """
        active_queryset = self.get_queryset().filter(is_active=True)

        queryset = self.filter_queryset(active_queryset)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ProductSearchViewSet(HaystackViewSet):
    """
    Handles search feature for products.
    """
    index_models = [Product]
    serializer_class = ProductSearchSerializer

    def get_base_queryset(self):
        queryset = Product.objects.all()
        return queryset

    def get_queryset(self, index_models=[]):
        queryset = super(ProductSearchViewSet, self).get_queryset(
            index_models
        )
        ids = self.get_base_queryset().values_list('id', flat=True).distinct()
        return queryset.filter(id__in=ids)

    def list(self, request, *args, **kwargs):
        duration = request.query_params.get('duration', 'this_month')
        index_queryset = self.filter_queryset(self.get_queryset())

        queryset = Product.objects.filter(id__in=index_queryset.values_list('pk', flat=True))
        if request.user.is_sales_representative:
            if request.query_params.get('customer'):
                queryset = queryset.filter(
                    dispense_histories__customer=request.query_params.get('customer')
                ).distinct()
            else:
                sales_representative = request.user.sales_representative
                queryset = queryset.filter(
                    dispense_histories__customer__sales_representative=sales_representative
                ).distinct()
        for product in queryset:
            product.rank = getattr(product, '{}_rank'.format(duration))
            product.average_margin = getattr(product, '{}_average_margin'.format(duration))
        queryset = [product for product in queryset if product.average_margin]
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(queryset, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
