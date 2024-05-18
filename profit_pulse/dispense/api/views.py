import calendar

from datetime import datetime, date, time, timedelta
from dateutil.relativedelta import relativedelta
from decimal import Decimal

from django.contrib.humanize.templatetags.humanize import intcomma
from django.db.models import F, Sum
from django.shortcuts import get_object_or_404
from django.template.defaultfilters import floatformat
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.generics import (
    GenericAPIView,
    ListAPIView,
    RetrieveAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .pagination import DispenseHistoryPagination
from .permissions import AdminOrCustomerOwner
from .serializers import DispenseHistorySerializer
from ..utils import calculate_profit
from ..models import DispenseHistory
from profit_pulse.core.api.filters import DurationFilter, RelatedOrderingFilter
from profit_pulse.core.permissions import AdminOrManager
from profit_pulse.profiles.api.serializers import (
    AdminReportSerializer,
    BasicAdminReportSerializer,
    CustomerReportSerializer,
)
from profit_pulse.profiles.mixins import new_get_maintenance_fees
from profit_pulse.profiles.models import Customer
from profit_pulse.profiles.utils import get_transaction_fee, get_switching_charges, get_software_fee
from profit_pulse.users.models import User


class DatedDispenseHistory(ListAPIView):
    """
    Filters the dispense history response based on the given
    pre-configured duration format. The following values are accepted
    for the filtering:
     - today
     - yesterday
     - this_week
     - last_week
     - this_month
     - last_month
     - year_to_date
     - last_year_to_date
     - last_3_years

    parameters:
     - name: duration
       description: A pre-configured duration format.
       required: false
       type: string
       paramType: query
       default: "last_month"

    """
    queryset = DispenseHistory.objects.filter(total_paid__gt=0, quantity__gt=0).annotate(dfbypass_margin=F('total_paid') - F('cost'))
    serializer_class = DispenseHistorySerializer
    permission_classes = (AdminOrCustomerOwner, )
    filter_backends = (
        RelatedOrderingFilter,
        DurationFilter,
        DjangoFilterBackend,
        SearchFilter,
    )
    ordering = ('-order_date', )
    duration_field = 'order_date'
    filter_fields = ('customer__state',)
    search_fields = ('physician__last_name', 'physician__first_name', 'product__ndc', 'product__title')
    pagination_class = DispenseHistoryPagination

    def get_queryset(self):
        queryset = super(DatedDispenseHistory, self).get_queryset()
        if self.request.user.is_admin:
            if 'customer' in self.request.GET:
                customer = get_object_or_404(Customer, user_id=self.request.GET['customer'])
                if customer.children.exists():
                    return queryset.filter(customer__parent=customer)
                else:
                    return queryset.filter(customer=customer)
            else:
                return queryset
        elif self.request.user.is_customer:
            customer = self.request.user.customer
            if customer.children.exists():
                return queryset.filter(customer__parent=customer)
            else:
                return queryset.filter(customer=customer)
        elif self.request.user.is_sales_representative:
            representative = self.request.user.sales_representative
            queryset = queryset.filter(
                customer__sales_representative=representative
            )
            if 'customer' in self.request.GET:
                customer = get_object_or_404(Customer, user_id=self.request.GET['customer'])
                if customer.children.exists():
                    return queryset.filter(customer__parent=customer)
                else:
                    return queryset.filter(customer=customer)
            else:
                return queryset
            return queryset


class DashboardReportsMixin(object):
    """
    Mixin for returning reports data in dashboard pages
    """
    model = User
    permission_classes = (IsAuthenticated, )
    filter_backends = (DurationFilter, )
    duration_field = 'order_date'

    def get_object(self):
        return self.request.user

    def _get_dispense_histories(self):
        obj = self.get_object()
        if obj.is_admin:
            if 'customer' in self.request.GET:
                customer = get_object_or_404(Customer, user_id=self.request.GET['customer'])
                if customer.children.exists():
                    transactions = DispenseHistory.objects.filter(customer__parent=customer, total_paid__gt=0, quantity__gt=0)
                else:
                    transactions = customer.dispense_histories.filter(total_paid__gt=0, quantity__gt=0)
            else:
                transactions = DispenseHistory.objects.filter(total_paid__gt=0, quantity__gt=0)
        elif obj.is_customer:
            customer = obj.customer
            if customer.children.exists():
                transactions = DispenseHistory.objects.filter(customer__parent=customer, total_paid__gt=0, quantity__gt=0)
            else:
                transactions = customer.dispense_histories.filter(total_paid__gt=0, quantity__gt=0)
        else:
            transactions = DispenseHistory.objects.none()
        return self.filter_queryset(transactions)

    def get_serializer_context(self):
        context = super(DashboardReportsMixin, self).get_serializer_context()
        context.update({
            'transactions': self._get_dispense_histories()
        })
        return context


class DashboardReports(DashboardReportsMixin, RetrieveAPIView):
    """
    Base view for returning reports data in dashboard pages
    """


class CustomerReports(DashboardReports):
    """
    Returns reports needed to be displayed in the customer portal
    like the following:
     - Total Paid
     - Margin
     - Physicians count
     - Net Profit
    """
    serializer_class = CustomerReportSerializer


class AdminReports(DashboardReports):
    """
    Returns reports needed to be displayed in the admin portal.
    Returns the calculated values of the following:
     - total insurance paid
     - total insurance profit
     - monthly maintenance revenue
     - monthly maintenance profit
     - enrollment revenue
     - enrollment profit
     - total revenue
     - total profit
     - financial
    """
    serializer_class = AdminReportSerializer
    # permission_classes = (AdminOrManager, )
    permission_classes = (IsAuthenticated, )
    second_duration_field = 'created'

    def get_serializer_class(self):
        if not self.request.user.is_admin:
            return BasicAdminReportSerializer
        return super().get_serializer_class()

    def _get_total_paid(self, transactions):
        insurance = transactions.aggregate(total=Sum('total_paid'))
        total = insurance['total'] or Decimal('0.00')
        return total

    def _get_insurance_paid(self, transactions):
        insurance = transactions.aggregate(total=Sum('insurance_paid'))
        total = insurance['total'] or Decimal('0.00')
        return total

    def filter_second_queryset(self, queryset):
        """
        Given a queryset, filter it with whichever filter backend is in use.

        You are unlikely to want to override this method, although you may need
        to call it either from a list view, or from a custom `get_object`
        method if you want to apply the configured filtering backend to the
        default queryset.
        """
        for backend in list(self.filter_backends):
            queryset = backend().filter_second_queryset(
                self.request,
                queryset,
                self
            )
        return queryset

    def _get_customers(self):
        queryset = Customer.objects.all()
        # TODO: Remove code below when filtering of customers is not needed
        # queryset = self.filter_second_queryset(customers)
        return queryset

    def get_serializer_context(self):
        context = super(AdminReports, self).get_serializer_context()
        transactions = context.get('transactions')
        context.update({
            'customers': self._get_customers() if self.request.user.is_admin else None,
            'total_paid': self._get_total_paid(transactions) if self.request.user.is_admin else None,
            'insurance_paid': self._get_insurance_paid(transactions) if self.request.user.is_admin else None,
        })
        return context


class AdminRevenues(GenericAPIView):
    """
    Returns data used to plot points in the revenue graph
    in admin dashboard. The data consists of total revenues
    based on the selected time duration.
    """
    queryset = DispenseHistory.objects.filter(total_paid__gt=0, quantity__gt=0)
    permission_classes = (AdminOrManager, )
    filter_backends = (DurationFilter, )
    duration_field = 'order_date'
    duration_default = 'this_month'

    def get_revenue_by_date(self, queryset, day):
        context = {
            'order_date__date': day
        }
        transactions = queryset.filter(**context)
        total = transactions.aggregate(revenue=Sum('total_paid'))
        return total['revenue'] or Decimal('0.00')

    def get_revenue_by_date_range(self, queryset, start_date, end_date):
        context = {
            'order_date__range': (start_date, end_date)
        }
        transactions = queryset.filter(**context)
        total = transactions.aggregate(revenue=Sum('total_paid'))
        return total['revenue'] or Decimal('0.00')

    def get_revenue_by_month_year(self, queryset, month, year):
        context = {
            'order_date__month': month,
            'order_date__year': year
        }
        transactions = queryset.filter(**context)
        total = transactions.aggregate(revenue=Sum('total_paid'))
        return total['revenue'] or Decimal('0.00')

    def get_revenue_by_year(self, queryset, year):
        context = {
            'order_date__year': year
        }
        transactions = queryset.filter(**context)
        total = transactions.aggregate(revenue=Sum('total_paid'))
        return total['revenue'] or Decimal('0.00')

    def get_revenues_by_last_week(self, queryset):
        """
        Returns revenues for the last 7 days
        """
        revenues = []
        now = timezone.now()
        monday = now - relativedelta(days=6)
        start_date = datetime.combine(monday.date(), time.min)
        end_date = datetime.combine(now.date(), time.max)
        day_count = (end_date - start_date).days + 1
        for single_date in (start_date + timedelta(n)
                            for n in range(day_count)):
            day = single_date.date()
            revenue = self.get_revenue_by_date(queryset, day)
            revenues.append({
                day.strftime('%m/%d/%Y'): revenue
            })
        return revenues

    def get_revenues_by_this_month(self, queryset):
        revenues = []
        now = timezone.now()
        end_date = datetime.combine(now.date(), time.max)
        for num in range(4):
            sdate = end_date - relativedelta(days=6)
            start_date = datetime.combine(sdate.date(), time.min)
            revenue = self.get_revenue_by_date_range(
                queryset,
                start_date,
                end_date,
            )

            key = "{}-{}".format(
                start_date.strftime("%m/%d/%Y"),
                end_date.strftime("%m/%d/%Y")
            )
            revenues.append({
                key: revenue
            })
            edate = start_date - relativedelta(days=1)
            end_date = datetime.combine(edate.date(), time.max)

        return reversed(revenues)

    def get_revenues_by_last_month(self, queryset):
        revenues = []
        last_month = timezone.now() - relativedelta(months=1)
        end_date = datetime.combine(last_month.date(), time.max)
        for num in range(4):
            sdate = end_date - relativedelta(days=6)
            start_date = datetime.combine(sdate.date(), time.min)
            revenue = self.get_revenue_by_date_range(
                queryset,
                start_date,
                end_date,
            )

            key = "{}-{}".format(
                start_date.strftime("%m/%d/%Y"),
                end_date.strftime("%m/%d/%Y")
            )
            revenues.append({
                key: revenue
            })
            edate = start_date - relativedelta(days=1)
            end_date = datetime.combine(edate.date(), time.max)

        return reversed(revenues)

    def get_revenues_by_year_to_date(self, queryset):
        revenues = []
        now = timezone.now()
        year = now.year
        for num in range(now.month):
            month = num + 1
            month_name = calendar.month_name[num + 1]
            revenue = self.get_revenue_by_month_year(queryset, month, year)
            revenues.append({
                '{} {}'.format(month_name, year): revenue
            })
        return revenues

    def get_revenues_by_last_year_to_date(self, queryset):
        revenues = []
        year = timezone.now().year - 1
        for num in range(12):
            month = num + 1
            month_name = calendar.month_name[num + 1]
            revenue = self.get_revenue_by_month_year(queryset, month, year)
            revenues.append({
                '{} {}'.format(month_name, year): revenue
            })
        return revenues

    def get_revenues_by_last_3_years(self, queryset):
        revenues = []
        year = timezone.now().year - 2
        for num in range(3):
            revenue = self.get_revenue_by_year(queryset, year + num)
            revenues.append({
                '{}'.format(year + num): revenue
            })
        return revenues

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.queryset)
        data = []
        duration = request.query_params.get('duration', self.duration_default)

        if duration == 'last_week':
            data = self.get_revenues_by_last_week(queryset)
        elif duration == 'this_month':
            data = self.get_revenues_by_this_month(queryset)
        elif duration == 'last_month':
            data = self.get_revenues_by_last_month(queryset)
        elif duration == 'year_to_date':
            data = self.get_revenues_by_year_to_date(queryset)
        elif duration == 'last_year_to_date':
            data = self.get_revenues_by_last_year_to_date(queryset)
        elif duration == 'last_3_years':
            data = self.get_revenues_by_last_3_years(queryset)

        return Response(data=data)


class AdminTotalProfits(GenericAPIView):
    """
    Returns data used to plot points in the revenue graph
    in admin dashboard. The data consists of total revenues
    based on the selected time duration.
    """
    queryset = DispenseHistory.objects.filter(total_paid__gt=0, quantity__gt=0)
    # permission_classes = (AdminOrManagerOrSalesRepresentative, )
    permission_classes = (IsAuthenticated, )
    filter_backends = (DurationFilter, )
    duration_field = 'order_date'
    duration_default = 'this_month'

    def get_total_profit_base(self, transactions, start_date, end_date, month_or_larger=False):
        customers = Customer.objects.all()
        if self.request.user.is_sales_representative:
            customers = customers.filter(sales_representative=self.request.user.sales_representative)

        total_insurance_profit = 0
        for customer in customers:
            total_insurance_profit += get_transaction_fee(
                customer, start_date, end_date, transactions.filter(customer=customer)
            )

        enrollment_profit = customers.filter(
            enrollment_date__range=(start_date, end_date)
        ).aggregate(total=Sum('enrollment_fee'))['total'] or Decimal('0.00')

        total_switching_profit = 0
        # FIXME: Implement this
        # for customer in customers:
        #     total_switching_profit += get_switching_charges(
        #         customer, start_date, end_date, switching_fees.filter(customer=customer)
        #     )

        if not month_or_larger:
            return total_insurance_profit + enrollment_profit + total_switching_profit

        monthly_maintenance_profit = 0
        for customer in customers.filter(monthly_fee_start_date__lte=end_date):
            monthly_maintenance_profit += get_software_fee(customer, start_date, end_date)

        return total_insurance_profit + enrollment_profit + monthly_maintenance_profit

    def get_total_profit_by_date(self, queryset, day):
        context = {
            'order_date__date': day
        }
        transactions = queryset.filter(**context)
        return self.get_total_profit_base(transactions, day, day)

    def get_total_profit_by_date_range(self, queryset, start_date, end_date):
        context = {
            'order_date__range': (start_date, end_date)
        }
        transactions = queryset.filter(**context)
        return self.get_total_profit_base(transactions, start_date, end_date)

    def get_total_profit_by_month_year(self, queryset, month, year):
        context = {
            'order_date__month': month,
            'order_date__year': year
        }
        transactions = queryset.filter(**context)
        start_date = date(year, month, 1)
        end_date = start_date + relativedelta(months=1) - relativedelta(days=1)
        return self.get_total_profit_base(transactions, start_date, end_date, month_or_larger=True)

    def get_total_profit_by_year(self, queryset, year):
        context = {
            'order_date__year': year
        }
        transactions = queryset.filter(**context)
        start_date = date(year, 1, 1)
        end_date = start_date + relativedelta(years=1) - relativedelta(days=1)
        return self.get_total_profit_base(transactions, start_date, end_date, month_or_larger=True)

    def get_total_profits_by_last_week(self, queryset):
        """
        Returns total_profits for the last 7 days
        """
        total_profits = []
        now = timezone.now()
        monday = now - relativedelta(days=6)
        start_date = datetime.combine(monday.date(), time.min)
        end_date = datetime.combine(now.date(), time.max)
        day_count = (end_date - start_date).days + 1
        for single_date in (start_date + timedelta(n)
                            for n in range(day_count)):
            day = single_date.date()
            total_profit = self.get_total_profit_by_date(queryset, day)
            total_profits.append({
                day.strftime('%m/%d/%Y'): total_profit
            })
        return total_profits

    def get_total_profits_by_this_month(self, queryset):
        total_profits = []
        start_date = timezone.now().date().replace(day=1)
        end_of_month = start_date + relativedelta(months=1) - relativedelta(days=1)
        while start_date < end_of_month:
            end_date = min(start_date + relativedelta(days=6), end_of_month)
            profit = self.get_total_profit_by_date_range(queryset, start_date, end_date)

            key = "{}-{}".format(
                start_date.strftime("%m/%d/%Y"),
                end_date.strftime("%m/%d/%Y")
            )
            total_profits.append({key: profit})
            start_date = end_date + relativedelta(days=1)

        return total_profits

    def get_total_profits_by_last_month(self, queryset):
        total_profits = []
        start_date = timezone.now().date().replace(day=1) - relativedelta(months=1)
        end_of_month = start_date + relativedelta(months=1) - relativedelta(days=1)
        while start_date < end_of_month:
            end_date = min(start_date + relativedelta(days=6), end_of_month)
            profit = self.get_total_profit_by_date_range(queryset, start_date, end_date)

            key = "{}-{}".format(
                start_date.strftime("%m/%d/%Y"),
                end_date.strftime("%m/%d/%Y")
            )
            total_profits.append({key: profit})
            start_date = end_date + relativedelta(days=1)

        return total_profits

    def get_total_profits_by_year_to_date(self, queryset):
        total_profits = []
        now = timezone.now()
        year = now.year
        for num in range(now.month):
            month = num + 1
            month_name = calendar.month_name[num + 1]
            total_profit = self.get_total_profit_by_month_year(queryset, month, year)
            total_profits.append({
                '{} {}'.format(month_name, year): total_profit
            })
        return total_profits

    def get_total_profits_by_last_year_to_date(self, queryset):
        total_profits = []
        year = timezone.now().year - 1
        for num in range(12):
            month = num + 1
            month_name = calendar.month_name[num + 1]
            total_profit = self.get_total_profit_by_month_year(queryset, month, year)
            total_profits.append({
                '{} {}'.format(month_name, year): total_profit
            })
        return total_profits

    def get_total_profits_by_last_3_years(self, queryset):
        total_profits = []
        year = timezone.now().year - 2
        for num in range(3):
            total_profit = self.get_total_profit_by_year(queryset, year + num)
            total_profits.append({
                '{}'.format(year + num): total_profit
            })
        return total_profits

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.queryset)
        if request.user.is_sales_representative:
            queryset = queryset.filter(customer__sales_representative=request.user.sales_representative)

        data = []
        duration = request.query_params.get('duration', self.duration_default)

        if duration == 'last_week':
            data = self.get_total_profits_by_last_week(queryset)
        elif duration == 'this_month':
            data = self.get_total_profits_by_this_month(queryset)
        elif duration == 'last_month':
            data = self.get_total_profits_by_last_month(queryset)
        elif duration == 'year_to_date':
            data = self.get_total_profits_by_year_to_date(queryset)
        elif duration == 'last_year_to_date':
            data = self.get_total_profits_by_last_year_to_date(queryset)
        elif duration == 'last_3_years':
            data = self.get_total_profits_by_last_3_years(queryset)
        return Response(data=data)


class CustomerRevenues(GenericAPIView):
    """
    Returns data used to plot points in the revenue graph
    in customer dashboard. The data consists of total revenues
    based on the selected time duration.
    """
    permission_classes = (IsAuthenticated, )
    filter_backends = (DurationFilter, )
    duration_field = 'order_date'
    duration_default = 'this_month'

    def get_queryset(self):
        if self.request.user.is_admin:
            if 'customer' in self.request.GET:
                customer = get_object_or_404(Customer, user_id=self.request.GET['customer'])
                if customer.children.exists():
                    return DispenseHistory.objects.filter(customer__parent=customer, total_paid__gt=0, quantity__gt=0)
                else:
                    return DispenseHistory.objects.filter(customer=customer, total_paid__gt=0, quantity__gt=0)
            else:
                return DispenseHistory.objects.filter(total_paid__gt=0, quantity__gt=0)
        elif self.request.user.is_customer:
            customer = self.request.user.customer
            if customer.children.exists():
                return DispenseHistory.objects.filter(customer__parent=customer, total_paid__gt=0, quantity__gt=0)
            else:
                return DispenseHistory.objects.filter(customer=customer, total_paid__gt=0, quantity__gt=0)

    def get_revenue_by_date(self, queryset, day):
        context = {
            'order_date__date': day
        }
        transactions = queryset.filter(**context)
        total = transactions.aggregate(revenue=Sum('total_paid'))
        return total['revenue'] or Decimal('0.00')

    def get_revenue_by_date_range(self, queryset, start_date, end_date):
        context = {
            'order_date__range': (start_date, end_date)
        }
        transactions = queryset.filter(**context)
        total = transactions.aggregate(revenue=Sum('total_paid'))
        return total['revenue'] or Decimal('0.00')

    def get_revenue_by_month_year(self, queryset, month, year):
        context = {
            'order_date__month': month,
            'order_date__year': year
        }
        transactions = queryset.filter(**context)
        total = transactions.aggregate(revenue=Sum('total_paid'))
        return total['revenue'] or Decimal('0.00')

    def get_revenue_by_year(self, queryset, year):
        context = {
            'order_date__year': year
        }
        transactions = queryset.filter(**context)
        total = transactions.aggregate(revenue=Sum('total_paid'))
        return total['revenue'] or Decimal('0.00')

    def get_revenues_by_last_week(self, queryset):
        """
        Returns revenues for the last 7 days
        """
        revenues = []
        now = timezone.now()
        monday = now - relativedelta(days=6)
        start_date = datetime.combine(monday.date(), time.min)
        end_date = datetime.combine(now.date(), time.max)
        day_count = (end_date - start_date).days + 1
        for single_date in (start_date + timedelta(n)
                            for n in range(day_count)):
            day = single_date.date()
            revenue = self.get_revenue_by_date(queryset, day)
            revenues.append({
                day.strftime('%m/%d/%Y'): revenue
            })
        return revenues

    def get_revenues_by_this_month(self, queryset):
        revenues = []
        now = timezone.now()
        end_date = datetime.combine(now.date(), time.max)
        for num in range(4):
            sdate = end_date - relativedelta(days=6)
            start_date = datetime.combine(sdate.date(), time.min)
            revenue = self.get_revenue_by_date_range(
                queryset,
                start_date,
                end_date,
            )

            key = "{}-{}".format(
                start_date.strftime("%m/%d/%Y"),
                end_date.strftime("%m/%d/%Y")
            )
            revenues.append({
                key: revenue
            })
            edate = start_date - relativedelta(days=1)
            end_date = datetime.combine(edate.date(), time.max)

        return reversed(revenues)

    def get_revenues_by_last_month(self, queryset):
        revenues = []
        last_month = timezone.now() - relativedelta(months=1)
        end_date = datetime.combine(last_month.date(), time.max)
        for num in range(4):
            sdate = end_date - relativedelta(days=6)
            start_date = datetime.combine(sdate.date(), time.min)
            revenue = self.get_revenue_by_date_range(
                queryset,
                start_date,
                end_date,
            )

            key = "{}-{}".format(
                start_date.strftime("%m/%d/%Y"),
                end_date.strftime("%m/%d/%Y")
            )
            revenues.append({
                key: revenue
            })
            edate = start_date - relativedelta(days=1)
            end_date = datetime.combine(edate.date(), time.max)

        return reversed(revenues)

    def get_revenues_by_year_to_date(self, queryset):
        revenues = []
        now = timezone.now()
        year = now.year
        for num in range(now.month):
            month = num + 1
            month_name = calendar.month_name[num + 1]
            revenue = self.get_revenue_by_month_year(queryset, month, year)
            revenues.append({
                '{} {}'.format(month_name, year): revenue
            })
        return revenues

    def get_revenues_by_last_year_to_date(self, queryset):
        revenues = []
        year = timezone.now().year - 1
        for num in range(12):
            month = num + 1
            month_name = calendar.month_name[num + 1]
            revenue = self.get_revenue_by_month_year(queryset, month, year)
            revenues.append({
                '{} {}'.format(month_name, year): revenue
            })
        return revenues

    def get_revenues_by_last_3_years(self, queryset):
        revenues = []
        year = timezone.now().year - 2
        for num in range(3):
            revenue = self.get_revenue_by_year(queryset, year + num)
            revenues.append({
                '{}'.format(year + num): revenue
            })
        return revenues

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        data = []
        duration = request.query_params.get('duration', self.duration_default)

        if duration == 'last_week':
            data = self.get_revenues_by_last_week(queryset)
        elif duration == 'this_month':
            data = self.get_revenues_by_this_month(queryset)
        elif duration == 'last_month':
            data = self.get_revenues_by_last_month(queryset)
        elif duration == 'year_to_date':
            data = self.get_revenues_by_year_to_date(queryset)
        elif duration == 'last_year_to_date':
            data = self.get_revenues_by_last_year_to_date(queryset)
        elif duration == 'last_3_years':
            data = self.get_revenues_by_last_3_years(queryset)

        return Response(data=data)


class CustomerProfits(GenericAPIView):
    """
    Returns data used to plot points in the profit graph
    in customer dashboard. The data consists of total profits
    based on the selected time duration.
    """
    permission_classes = (IsAuthenticated, )
    filter_backends = (DurationFilter, )
    duration_field = 'order_date'
    duration_default = 'this_month'

    def get_queryset(self):
        if self.request.user.is_admin:
            if 'customer' in self.request.GET:
                customer = get_object_or_404(Customer, user_id=self.request.GET['customer'])
                if customer.children.exists():
                    return DispenseHistory.objects.filter(customer__parent=customer, total_paid__gt=0, quantity__gt=0)
                else:
                    return DispenseHistory.objects.filter(customer=customer, total_paid__gt=0, quantity__gt=0)
            else:
                return DispenseHistory.objects.filter(total_paid__gt=0, quantity__gt=0)
        elif self.request.user.is_customer:
            customer = self.request.user.customer
            if customer.children.exists():
                return DispenseHistory.objects.filter(customer__parent=customer, total_paid__gt=0, quantity__gt=0)
            else:
                return DispenseHistory.objects.filter(customer=customer, total_paid__gt=0, quantity__gt=0)

    def get_profit_by_date(self, queryset, day):
        context = {
            'order_date__date': day
        }
        transactions = queryset.filter(**context)
        return max(0, calculate_profit(transactions) - self._get_maintenance_fees(transactions, day, day))

    def get_profit_by_date_range(self, queryset, start_date, end_date):
        context = {
            'order_date__range': (start_date, end_date)
        }
        transactions = queryset.filter(**context)
        return max(0, calculate_profit(transactions))

    def get_profit_by_month_year(self, queryset, month, year):
        context = {
            'order_date__month': month,
            'order_date__year': year
        }
        transactions = queryset.filter(**context)
        start_date = date(year, month, 1)
        end_date = start_date + relativedelta(months=1) - timedelta(days=1)
        return max(0, calculate_profit(transactions))

    def get_profit_by_year(self, queryset, year):
        context = {
            'order_date__year': year
        }
        transactions = queryset.filter(**context)
        start_date = date(year, 1, 1)
        end_date = start_date + relativedelta(years=1) - relativedelta(days=1)
        return max(0, calculate_profit(transactions))

    def get_profits_by_last_week(self, queryset):
        """
        Returns profits for the last 7 days
        """
        profits = []
        now = timezone.now()
        monday = now - relativedelta(days=6)
        start_date = datetime.combine(monday.date(), time.min)
        end_date = datetime.combine(now.date(), time.max)
        day_count = (end_date - start_date).days + 1
        for single_date in (start_date + timedelta(n)
                            for n in range(day_count)):
            day = single_date.date()
            profit = self.get_profit_by_date(queryset, day)
            profits.append({
                day.strftime('%m/%d/%Y'): profit
            })
        return profits

    def get_profits_by_this_month(self, queryset):
        profits = []
        now = timezone.now()
        end_date = datetime.combine(now.date(), time.max)
        for num in range(4):
            sdate = end_date - relativedelta(days=6)
            start_date = datetime.combine(sdate.date(), time.min)
            profit = self.get_profit_by_date_range(
                queryset,
                start_date,
                end_date,
            )

            key = "{}-{}".format(
                start_date.strftime("%m/%d/%Y"),
                end_date.strftime("%m/%d/%Y")
            )
            profits.append({
                key: profit
            })
            edate = start_date - relativedelta(days=1)
            end_date = datetime.combine(edate.date(), time.max)

        return reversed(profits)

    def get_profits_by_last_month(self, queryset):
        profits = []
        last_month = timezone.now() - relativedelta(months=1)
        end_date = datetime.combine(last_month.date(), time.max)
        for num in range(4):
            sdate = end_date - relativedelta(days=6)
            start_date = datetime.combine(sdate.date(), time.min)
            profit = self.get_profit_by_date_range(
                queryset,
                start_date,
                end_date,
            )

            key = "{}-{}".format(
                start_date.strftime("%m/%d/%Y"),
                end_date.strftime("%m/%d/%Y")
            )
            profits.append({
                key: profit
            })
            edate = start_date - relativedelta(days=1)
            end_date = datetime.combine(edate.date(), time.max)

        return reversed(profits)

    def get_profits_by_year_to_date(self, queryset):
        profits = []
        now = timezone.now()
        year = now.year
        for num in range(now.month):
            month = num + 1
            month_name = calendar.month_name[num + 1]
            profit = self.get_profit_by_month_year(queryset, month, year)
            profits.append({
                '{} {}'.format(month_name, year): profit
            })
        return profits

    def get_profits_by_last_year_to_date(self, queryset):
        profits = []
        year = timezone.now().year - 1
        for num in range(12):
            month = num + 1
            month_name = calendar.month_name[num + 1]
            profit = self.get_profit_by_month_year(queryset, month, year)
            profits.append({
                '{} {}'.format(month_name, year): profit
            })
        return profits

    def get_profits_by_last_3_years(self, queryset):
        profits = []
        year = timezone.now().year - 2
        for num in range(3):
            profit = self.get_profit_by_year(queryset, year + num)
            profits.append({
                '{}'.format(year + num): profit
            })
        return profits

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        data = []
        duration = request.query_params.get('duration', self.duration_default)

        if duration == 'last_week':
            data = self.get_profits_by_last_week(queryset)
        elif duration == 'this_month':
            data = self.get_profits_by_this_month(queryset)
        elif duration == 'last_month':
            data = self.get_profits_by_last_month(queryset)
        elif duration == 'year_to_date':
            data = self.get_profits_by_year_to_date(queryset)
        elif duration == 'last_year_to_date':
            data = self.get_profits_by_last_year_to_date(queryset)
        elif duration == 'last_3_years':
            data = self.get_profits_by_last_3_years(queryset)

        return Response(data=data)

    def _get_maintenance_fees(self, transactions, start_date, end_date):
        if self.request.user.is_admin:
            if 'customer' in self.request.GET:
                customer = get_object_or_404(Customer, user_id=self.request.GET['customer'])
                if customer.children.exists():
                    maintenance_fees = sum(
                        new_get_maintenance_fees(
                            start_date, end_date, transactions.filter(customer=child), child, exclude_enrollment=True)
                        for child in customer.children.all()
                    )
                else:
                    maintenance_fees = new_get_maintenance_fees(
                        start_date, end_date, transactions.filter(customer=customer), customer, exclude_enrollment=True)
            else:
                # maintenance_fees = get_maintenance_fees(start_date, end_date, transactions, exclude_enrollment=True)  #  Before
                maintenance_fees = sum(
                    new_get_maintenance_fees(
                        start_date,
                        end_date,
                        transactions.filter(customer=child),
                        child,
                        exclude_enrollment=True,
                    )
                    for child in Customer.objects.filter(children__isnull=True)  # Only children and solo
                )
        elif self.request.user.is_customer:
            customer = self.request.user.customer
            if customer.children.exists():
                maintenance_fees = sum(
                    new_get_maintenance_fees(
                        start_date, end_date, transactions.filter(customer=child), child, exclude_enrollment=True)
                    for child in customer.children.all()
                )
            else:
                maintenance_fees = new_get_maintenance_fees(
                    start_date, end_date, transactions, customer, exclude_enrollment=True)
        return maintenance_fees
