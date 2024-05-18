from decimal import Decimal

from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import (
    GenericAPIView,
    ListAPIView,
    RetrieveAPIView,
)
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from django.db.models import Count, F, Q, Sum
from django.shortcuts import get_object_or_404
from django.utils.translation import ugettext_lazy as _

from .serializers import (
    BasicManagerSerializer,
    CustomerSerializer,
    ManagerSerializer,
    PasswordResetSerializer,
    PhysicianSerializer,
    PhysicianOverviewSerializer,
    PhysicianProfitabilitySerializer,
    PracticeOverviewSerializer,
    CustomerRevenuesSerializer,
    CustomerRevenueReportSerializer,
    CustomerRevenueReportSerializer2,
    SalesRepresentativeSerializer,
    SalesRepresentativeCustomerRevenueReportSerializer2,
)
from ..mixins import new_get_maintenance_fees
from ..models import Customer, Manager, Physician
from profit_pulse.core.api.filters import (
    RelatedOrderingFilter,
    DurationFilter,
    SerializerDurationFilter,
)
from profit_pulse.core.permissions import (
    IsCustomer,
    IsCredentialing,
    IsManager,
    AdminOrManager,
    AdminOrUserParentOwner,
    AdminOrManagerOrSalesRepresentative,
)
from profit_pulse.dispense.api.pagination import DispenseHistoryPagination
from profit_pulse.dispense.api.serializers import DispenseHistorySerializer
from profit_pulse.dispense.models import DispenseHistory
from profit_pulse.dispense.utils import get_duration_filter, calculate_profit
from profit_pulse.products.api.serializers import ProductSerializer
from profit_pulse.products.models import Product
from profit_pulse.switching_fees.models import SwitchingFee
from profit_pulse.users.models import User


class LoggedInCustomer(RetrieveAPIView):
    """
    Returns details about the logged in customer
    """
    model = Customer
    serializer_class = CustomerSerializer
    permission_classes = (IsCustomer, )

    def get_object(self):
        return self.request.user.customer


class LoggedInUser(RetrieveAPIView):
    """
    Returns details about the logged in manager
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        instance = request.user
        if hasattr(instance, 'credentialing_only'):
            return Response(BasicManagerSerializer(instance=instance.manager).data)
        if instance.is_manager:
            return Response(ManagerSerializer(instance.manager).data)
        if instance.is_customer:
            return Response(CustomerSerializer(instance=instance.customer).data)
        if instance.is_sales_representative:
            return Response(SalesRepresentativeSerializer(instance=instance.sales_representative).data)
        return Response(status.HTTP_401_UNAUTHORIZED)


class LoggedInCredentialing(RetrieveAPIView):
    """
    Returns details about the logged in manager
    """
    model = Manager
    serializer_class = ManagerSerializer
    permission_classes = (IsCredentialing,)

    def get_object(self):
        return self.request.user.manager


class PasswordResetMixin(object):
    """
    Send email containing instructions to reset a user's password
    """
    serializer_class = PasswordResetSerializer
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        context = {
            'detail': _('Check email for instructions to reset password.')
        }
        return Response(context)


class CustomerPasswordReset(PasswordResetMixin, GenericAPIView):
    """
    Send email containing instructions to reset a customer's password
    """

    def get_serializer_context(self):
        context = super(CustomerPasswordReset, self).get_serializer_context()
        context.update({
            'user_type': 'customer'
        })
        return context


class CustomerDispenseHistory(RetrieveAPIView):
    """
    return a list of dispense histories related to the given customer.
    """
    queryset = Customer.objects.all()
    serializer_class = DispenseHistorySerializer
    # permission_classes = (AdminOrUserParentOwner, )
    pagination_class = DispenseHistoryPagination
    filter_backends = (RelatedOrderingFilter, )
    ordering = ('-order_date', )
    lookup_field = 'user'

    def get_dispense_histories(self):
        instance = self.get_object()
        return instance.dispense_histories.filter(total_paid__gt=0, quantity__gt=0)

    def retrieve(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_dispense_histories())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ManagerPasswordReset(PasswordResetMixin, GenericAPIView):
    """
    Send email containing instructions to reset a manager's password
    """

    def get_serializer_context(self):
        context = super(ManagerPasswordReset, self).get_serializer_context()
        context.update({
            'user_type': 'manager'
        })
        return context


class PhysicianOverview(ListAPIView):
    """
    Returns list of physicians of the logged in user along
    with their corresponding profits categorized by date:
        - today
        - week
        - month
        - year to date
    """
    queryset = Physician.objects.all()
    permission_classes = (IsAuthenticated, )
    serializer_class = PhysicianOverviewSerializer
    filter_backends = (RelatedOrderingFilter, )
    ordering = ('created', )

    def get_queryset(self):
        if self.request.user.is_admin:
            if 'customer' in self.request.GET:
                customer = get_object_or_404(Customer, user_id=self.request.GET['customer'])
                if customer.children.exists():
                    return Physician.objects.filter(customers__parent=customer).distinct()
                else:
                    return customer.physicians.all()
            else:
                return super(PhysicianOverview, self).get_queryset()
        elif self.request.user.is_customer:
            customer = self.request.user.customer
            if customer.children.exists():
                return Physician.objects.filter(customers__parent=customer).distinct()
            else:
                return customer.physicians.all()
        elif self.request.user.is_sales_representative:
            return Physician.objects.filter(
                Q(customer__sales_representative=self.request.user.sales_representative) |
                Q(customer__parent__sales_representative=self.request.user.sales_representative)
            )


class PracticeOverview(RetrieveAPIView):
    """
    Returns the number of physicians with transactions for a given
    date/date range along with its corresponding total profit.
    """
    model = User
    permission_classes = (IsAuthenticated, )
    serializer_class = PracticeOverviewSerializer

    def get_object(self):
        return self.request.user


class CustomerRevenueReports(ListAPIView):
    """
    View that returns revenue reports for customers
    """
    queryset = Customer.objects.filter(children__isnull=True)
    permission_classes = (AdminOrManager, )
    serializer_class = CustomerRevenueReportSerializer
    filter_backends = (RelatedOrderingFilter, DurationFilter)
    ordering = ('created', )
    second_duration_field = 'order_date'
    duration_default = 'this_week'

    def filter_queryset(self, queryset):
        """
        Override filter_queryset method so it won't call filter the main
        queryset by duration.
        """
        for backend in list(self.filter_backends):
            if backend == DurationFilter:
                continue

            queryset = backend().filter_queryset(
                self.request,
                queryset,
                self
            )
        return queryset

    def filter_second_queryset(self, queryset):
        """
        Given a queryset, filter it with whichever filter backend is in use.

        You are unlikely to want to override this method, although you may need
        to call it either from a list view, or from a custom `get_object`
        method if you want to apply the configured filtering backend to the
        default queryset.
        """
        queryset = DurationFilter().filter_second_queryset(
            self.request,
            queryset,
            self
        )
        return queryset

    def _get_transactions(self):
        transactions = DispenseHistory.objects.filter(total_paid__gt=0, quantity__gt=0)
        queryset = self.filter_second_queryset(transactions)
        return queryset

    def _get_switching_fees(self):
        switching_fees = SwitchingFee.objects.all()
        queryset = self.filter_second_queryset(switching_fees)
        return queryset

    def get_serializer_context(self):
        context = super(CustomerRevenueReports, self).get_serializer_context()
        filter_ = DurationFilter()
        context.update({
            'transactions': self._get_transactions(),
            'switching_fees': self._get_switching_fees(),
            'start_date': filter_.get_start_date(self.request),
            'end_date': filter_.get_end_date(self.request),
        })
        return context

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        custom_ordering_fields = [
            'transaction_fee',
            'enrollment_fee',
            'maintenance_fee',
            'switching_charges',
            'total_revenue',
        ]
        if 'ordering' in self.request.query_params:
            ordering_field = self.request.query_params['ordering']
            field_name_only = ordering_field.lstrip('-')
            if field_name_only in custom_ordering_fields:
                data = sorted(
                    data,
                    key=lambda x: x[field_name_only],
                    reverse=ordering_field.startswith('-'),
                )
        return Response(data)


class CustomerRevenueReports2(ListAPIView):
    """
    View that returns revenue reports for customers
    """
    queryset = Customer.objects.filter(children__isnull=True)
    permission_classes = (AdminOrManagerOrSalesRepresentative, )
    serializer_class = CustomerRevenueReportSerializer2
    filter_backends = (RelatedOrderingFilter, DurationFilter)
    second_duration_field = 'order_date'
    duration_default = 'this_week'
    ordering = ('created', )

    def get_serializer_class(self):
        if self.request.user.is_sales_representative:
            return SalesRepresentativeCustomerRevenueReportSerializer2
        return self.serializer_class

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_sales_representative:
            queryset = queryset.filter(sales_representative=self.request.user.sales_representative)
        return queryset

    def filter_queryset(self, queryset):
        """
        Override filter_queryset method so it won't call filter the main
        queryset by duration.
        """
        for backend in list(self.filter_backends):
            if backend == DurationFilter:
                continue

            queryset = backend().filter_queryset(
                self.request,
                queryset,
                self
            )

        for obj in queryset:
            if obj.children.exists():
                transactions = self._get_transactions().filter(customer__parent=obj)
            else:
                transactions = self._get_transactions().filter(customer=obj)

            total = transactions.aggregate(paid=Sum('total_paid'))
            obj.total_paid = total['paid'] or Decimal('0.00')
            obj.margin = calculate_profit(transactions)

            filter_ = DurationFilter()
            start_date = filter_.get_start_date(self.request).date()
            end_date = filter_.get_end_date(self.request).date()
            obj.maintenance_fees = new_get_maintenance_fees(
                start_date, end_date, transactions, obj, exclude_enrollment=True)

            obj.net_profit = obj.margin - obj.maintenance_fees

        if 'ordering' in self.request.query_params:
            ordering_field = self.request.query_params['ordering']
            field_name_only = ordering_field.lstrip('-')
            if field_name_only in ['total_paid', 'margin', 'maintenance_fees', 'net_profit']:
                queryset = sorted(
                    queryset,
                    key=lambda x: float(getattr(x, field_name_only)),
                    reverse=ordering_field.startswith('-'),
                )

        return queryset

    def filter_second_queryset(self, queryset):
        """
        Given a queryset, filter it with whichever filter backend is in use.

        You are unlikely to want to override this method, although you may need
        to call it either from a list view, or from a custom `get_object`
        method if you want to apply the configured filtering backend to the
        default queryset.
        """
        queryset = DurationFilter().filter_second_queryset(
            self.request,
            queryset,
            self
        )
        return queryset

    def _get_transactions(self):
        transactions = DispenseHistory.objects.filter(total_paid__gt=0, quantity__gt=0)
        queryset = self.filter_second_queryset(transactions)
        return queryset

    def get_serializer_context(self):
        context = super(CustomerRevenueReports2, self).get_serializer_context()
        filter_ = DurationFilter()
        context.update({
            'transactions': self._get_transactions(),
            'start_date': filter_.get_start_date(self.request),
            'end_date': filter_.get_end_date(self.request),
        })
        return context


class CustomerRevenues(ListAPIView):
    """
    View that returns revenue reports for customers
    """
    queryset = Customer.objects.filter(children__isnull=True)
    permission_classes = (AdminOrManager, )
    serializer_class = CustomerRevenuesSerializer
    filter_backends = (RelatedOrderingFilter, DurationFilter)
    ordering = ('created', )
    second_duration_field = 'order_date'
    duration_default = 'this_week'

    def filter_queryset(self, queryset):
        """
        Override filter_queryset method so it won't call filter the main
        queryset by duration.
        """
        for backend in list(self.filter_backends):
            if backend == DurationFilter:
                continue

            queryset = backend().filter_queryset(
                self.request,
                queryset,
                self
            )
        return queryset

    def filter_second_queryset(self, queryset):
        """
        Given a queryset, filter it with whichever filter backend is in use.

        You are unlikely to want to override this method, although you may need
        to call it either from a list view, or from a custom `get_object`
        method if you want to apply the configured filtering backend to the
        default queryset.
        """
        queryset = DurationFilter().filter_second_queryset(
            self.request,
            queryset,
            self
        )
        return queryset

    def _get_customers(self):
        queryset = Customer.objects.all()
        return queryset

    def _get_transactions(self):
        transactions = DispenseHistory.objects.filter(total_paid__gt=0, quantity__gt=0)
        queryset = self.filter_second_queryset(transactions)
        return queryset

    def get_serializer_context(self):
        context = super(CustomerRevenues, self).get_serializer_context()
        filter_ = DurationFilter()
        context.update({
            'customers': self._get_customers(),
            'transactions': self._get_transactions(),
            'start_date': filter_.get_start_date(self.request),
            'end_date': filter_.get_end_date(self.request),
        })
        return context


class CustomerTopProducts(RetrieveAPIView):
    """
    View that returns the top 5 products of the logged in customer.
    """
    model = User
    serializer_class = ProductSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        user = self.get_object()
        if user.is_manager:
            if 'customer' in self.request.GET:
                customer = get_object_or_404(Customer, user_id=self.request.GET['customer'])
                if customer.children.exists():
                    queryset = Product.all_objects.filter(dispense_histories__customer__parent=customer)
                else:
                    queryset = Product.all_objects.filter(dispense_histories__customer=customer)
            else:
                queryset = Product.objects.all()
        elif user.is_customer:
            customer = user.customer
            if customer.children.exists():
                queryset = Product.all_objects.filter(dispense_histories__customer__parent=customer)
            else:
                queryset = Product.all_objects.filter(dispense_histories__customer__user=user)
        return queryset

    def get_object(self):
        return self.request.user

    def calculate_percentage(self, amount, total):
        return (amount / total) * 100 if total else 0

    def retrieve(self, request, *args, **kwargs):
        queryset = self.get_queryset().annotate(
            dispense_history_count=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    request.query_params.get('duration', 'this_month'),
                    'dispense_histories__order_date'
                )
            ))
        ).filter(dispense_history_count__gt=0)

        ranks = {}
        for index, count in enumerate(
            queryset.order_by('-dispense_history_count').values_list('dispense_history_count', flat=True)
        ):
            ranks.setdefault(count, index + 1)
        top_total = queryset.aggregate(total=Sum('dispense_history_count'))['total'] or 0
        queryset = queryset.annotate(
            performance_percentage=F('dispense_history_count') / float(top_total) * 100,
        ).order_by('-dispense_history_count')

        top_total = queryset.aggregate(total=Sum('dispense_history_count'))['total']
        queryset = queryset.annotate(
            performance_percentage=F('dispense_history_count') / float(top_total or 0) * 100,
        )

        paginated = list(queryset[:10])
        for product in paginated:
            product.rank = ranks[product.dispense_history_count]
        serializer = ProductSerializer(paginated, many=True, context={'request': request, 'view': self})
        return Response(data=serializer.data)


class PhysicianProfitability(ListAPIView):
    """
    View that returns all physicians related to the logged in
    customer. Physicians data will include total profits for a
    certain duration. Duration types are as follows:
    - this_week
    - this_month
    - last_month
    - year_to_date
    - last_year_to_date
    - last_3_years

    Default duration is: this_week
    """
    queryset = Physician.objects.all()
    permission_classes = (IsAuthenticated, )
    serializer_class = PhysicianProfitabilitySerializer
    filter_backends = (RelatedOrderingFilter, SerializerDurationFilter)
    ordering = ('created', )

    def get_queryset(self):
        if self.request.user.is_admin:
            if 'customer' in self.request.GET:
                customer = get_object_or_404(Customer, user_id=self.request.GET['customer'])
                if customer.children.exists():
                    return Physician.objects.filter(customers__parent=customer).distinct()
                else:
                    return customer.physicians.all()
            else:
                return super(PhysicianProfitability, self).get_queryset()
        elif self.request.user.is_customer:
            customer = self.request.user.customer
            if customer.children.exists():
                return Physician.objects.filter(customers__parent=customer).distinct()
            else:
                return customer.physicians.all()
        elif self.request.user.is_sales_representative:
            return Physician.objects.filter(
                customer__sales_representative=self.request.user.sales_representative)


class TopCustomers(ListAPIView):
    """
    View that returns the top 5 performing customers based on the given
    duration. Duration types are as follows:
    - today
    - yesterday
    - this_week
    - last_week
    - this_month
    - last_month
    - year_to_date
    - last_year_to_date
    - last_3_years

    Default duration is: this_month
    """
    # permission_classes = (AdminOrManagerOrSalesRepresentative, )
    permission_classes = (IsAuthenticated, )
    serializer_class = CustomerSerializer
    filter_backends = (DurationFilter, )
    duration_field = 'order_date'
    duration_default = 'this_month'

    def _get_dispense_histories(self):
        transactions = DispenseHistory.objects.all()
        return self.filter_queryset(transactions)

    def get_queryset(self):
        transactions = self._get_dispense_histories()
        transaction_ids = transactions.values_list('id', flat=True).distinct()
        ids = transactions.values_list('customer', flat=True).distinct()
        queryset = Customer.objects.filter(user_id__in=ids).annotate(
            count=Count('dispense_histories',
                        filter=Q(dispense_histories__id__in=transaction_ids))
        )
        if self.request.user.is_sales_representative:
            queryset = queryset.filter(sales_representative=self.request.user.sales_representative)
        return queryset

    def list(self, request, *args, **kwargs):
        print()
        """
        Modify list method so it won't filter the queryset method
        """
        queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        sorted_data = sorted(serializer.data, key=lambda x: x['profit'], reverse=True)[:5]
        return Response(sorted_data)


class TopPhysicians(ListAPIView):
    """
    View that returns the top 5 performing physicians based on the given
    duration. Duration types are as follows:
    - today
    - yesterday
    - this_week
    - last_week
    - this_month
    - last_month
    - year_to_date
    - last_year_to_date
    - last_3_years

    Default duration is: this_month
    """
    permission_classes = (IsAuthenticated, )
    serializer_class = PhysicianSerializer
    filter_backends = (DurationFilter, )
    duration_field = 'order_date'
    duration_default = 'this_month'

    def _get_dispense_histories(self):
        user = self.request.user
        if user.is_admin:
            if 'customer' in self.request.GET:
                customer = get_object_or_404(Customer, user_id=self.request.GET['customer'])
                if customer.children.exists():
                    transactions = DispenseHistory.objects.filter(customer__parent=customer, total_paid__gt=0, quantity__gt=0)
                else:
                    transactions = customer.dispense_histories.filter(total_paid__gt=0, quantity__gt=0)
            else:
                transactions = DispenseHistory.objects.filter(total_paid__gt=0, quantity__gt=0)
        elif user.is_customer:
            customer = user.customer
            if customer.children.exists():
                transactions = DispenseHistory.objects.filter(customer__parent=customer, total_paid__gt=0, quantity__gt=0)
            else:
                transactions = customer.dispense_histories.filter(total_paid__gt=0, quantity__gt=0)
        elif user.is_sales_representative:
            customer_ids = user.sales_representative.customers.values_list('user', flat=True).distinct()
            transactions = DispenseHistory.objects.filter(customer__in=customer_ids)

        return self.filter_queryset(transactions)

    def get_queryset(self):
        transactions = self._get_dispense_histories()
        transaction_ids = transactions.values_list('id', flat=True).distinct()
        ids = transactions.values_list('physician', flat=True).distinct()
        return Physician.objects.filter(id__in=ids).annotate(
            count=Count('dispense_histories',
                        filter=Q(dispense_histories__id__in=transaction_ids))
        ).order_by('-count')

    def list(self, request, *args, **kwargs):
        """
        Modify list method so it won't filter the queryset method
        """
        queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        sorted_data = sorted(serializer.data, key=lambda x: x['profit'], reverse=True)[:10]
        return Response(sorted_data)
