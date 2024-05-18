from __future__ import unicode_literals

import calendar

from datetime import datetime, date, time, timedelta
from dateutil.relativedelta import relativedelta

from django.db.models import Sum, Q
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _

from .mailer import ProfilesMailer
from profit_pulse.dispense.utils import calculate_profit


def new_get_maintenance_fees(
    start_date, end_date, transactions, customer=None, physician=False, exclude_enrollment=False
):
    maintenance_fees = []
    if customer:
        for fs in customer.fee_structures.filter(
            Q(end_date__gte=start_date) | Q(end_date__isnull=True), start_date__lte=end_date
        ):
            new_start_date = max(start_date, fs.start_date)
            new_end_date = min(end_date, fs.end_date or max(timezone.localtime().date(), end_date))
            _transactions = transactions.filter(
                order_date__date__gte=new_start_date,
                order_date__date__lte=new_end_date
            )
            maintenance_fee = _get_maintenance_fees(
                start_date=new_start_date,
                end_date=new_end_date,
                transactions=_transactions,
                enrollment_date=customer.enrollment_date,
                enrollment_fee=customer.enrollment_fee,
                monthly_fee=fs.monthly_fee,
                monthly_fee_start_date=customer.monthly_fee_start_date,
                billing_percentage=fs.billing_percentage,
                exclude_enrollment=exclude_enrollment,
                physician=physician,
            )
            maintenance_fees.append(maintenance_fee)
    return sum(maintenance_fees)


def _get_maintenance_fees(
    start_date,
    end_date,
    transactions,
    enrollment_date,
    enrollment_fee,
    billing_percentage,
    monthly_fee,
    monthly_fee_start_date,
    exclude_enrollment=False,
    physician=False,
):
    insurance_profit = (transactions.aggregate(total=Sum('total_paid'))['total'] or 0) * billing_percentage / 100
    enrollment_fees = monthly_fees = 0

    if not physician:
        if not exclude_enrollment and enrollment_date and start_date <= enrollment_date <= end_date:
            enrollment_fees = enrollment_fee
        if monthly_fee_start_date and monthly_fee_start_date <= end_date:
            start_date = max(start_date, monthly_fee_start_date)
            months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
            if start_date.day <= 15 and end_date.day >= 15:
                months += 1
            elif start_date.day > 15 and end_date.day < 15 and start_date < end_date:
                months += -1
            monthly_fees = monthly_fee * months

    return insurance_profit + enrollment_fees + monthly_fees


def old_get_maintenance_fees(start_date, end_date, transactions, customer=None, physician=False, exclude_enrollment=False):
    if customer is None:
        from .models import Customer
        return sum([
            old_get_maintenance_fees(
                start_date, end_date, transactions.filter(customer=each_customer), each_customer
            ) for each_customer in Customer.objects.filter(children__isnull=True)  # Only children and solo
        ])

    insurance_profit = (transactions.aggregate(total=Sum('total_paid'))['total'] or 0) * customer.billing_percentage / 100
    enrollment_fee = monthly_fees = 0
    if not physician:
        if not exclude_enrollment and customer.enrollment_date and start_date <= customer.enrollment_date <= end_date:
            enrollment_fee = customer.enrollment_fee
        if customer.monthly_fee_start_date and customer.monthly_fee_start_date <= end_date:
            start_date = max(start_date, customer.monthly_fee_start_date)
            months = (end_date.year - start_date.year) * 12 + end_date.month - start_date.month
            if start_date.day == 1 or start_date == customer.monthly_fee_start_date:
                months += 1
            monthly_fees = customer.monthly_fee * months

    return insurance_profit + enrollment_fee + monthly_fees


class ProfitMixin(object):
    """
    This mixin contains methods and properties that are used
    in models to retrieve their corresponding profit based
    on a given duration/time. Take note that this will only work
    on models having one-to-many relationship to
    :model:`dispense.DispenseHistory`.
    """

    def get_filter_context(self, context, **kwargs):
        customer = kwargs.get('customer', None)
        representative = kwargs.get('representative', None)
        args = []
        if customer:
            args = [Q(customer=customer) | Q(customer__parent=customer)]
        elif representative:
            context.update({
                'customer__sales_representative': representative
            })
        return args, context

    def get_sales(self, duration, **kwargs):
        now = timezone.now()

        if duration == 'all':
            return self.dispense_histories.filter(total_paid__gt=0, quantity__gt=0)
        elif duration == 'today':
            context = {
                'order_date__date': now.date()
            }
            args, duration_kwargs = self.get_filter_context(context, **kwargs)
            return self.dispense_histories.filter(*args, **duration_kwargs).filter(total_paid__gt=0, quantity__gt=0)
        elif duration == 'this_week':
            start_date = now - relativedelta(days=7)
            end_date = datetime.combine(now.date(), time.max)
            context = {
                'order_date__range': (start_date, end_date)
            }
            args, duration_kwargs = self.get_filter_context(context, **kwargs)
            return self.dispense_histories.filter(*args, **duration_kwargs).filter(total_paid__gt=0, quantity__gt=0)
        elif duration == 'last_week':
            start_date = now - relativedelta(days=7)
            end_date = datetime.combine(now.date(), time.max)
            context = {
                'order_date__range': (start_date, end_date)
            }
            args, duration_kwargs = self.get_filter_context(context, **kwargs)
            return self.dispense_histories.filter(*args, **duration_kwargs).filter(total_paid__gt=0, quantity__gt=0)
        elif duration == 'this_month':
            today = now.date()
            context = {
                'order_date__date__year': today.year,
                'order_date__date__month': today.month,
            }
            args, duration_kwargs = self.get_filter_context(context, **kwargs)
            return self.dispense_histories.filter(*args, **duration_kwargs).filter(total_paid__gt=0, quantity__gt=0)
        elif duration == 'last_month':
            today = now.date() - relativedelta(months=1)
            context = {
                'order_date__date__year': today.year,
                'order_date__date__month': today.month,
            }
            args, duration_kwargs = self.get_filter_context(context, **kwargs)
            return self.dispense_histories.filter(*args, **duration_kwargs).filter(total_paid__gt=0, quantity__gt=0)
        elif duration == 'last_month_running':
            start_date = now - relativedelta(months=1)
            end_date = datetime.combine(now.date(), time.max)
            context = {
                'order_date__range': (start_date, end_date)
            }
            args, duration_kwargs = self.get_filter_context(context, **kwargs)
            return self.dispense_histories.filter(*args, **duration_kwargs).filter(total_paid__gt=0, quantity__gt=0)
        elif duration == 'year_to_date':
            context = {
                'order_date__date__year': now.date().year
            }
            args, duration_kwargs = self.get_filter_context(context, **kwargs)
            return self.dispense_histories.filter(*args, **duration_kwargs).filter(total_paid__gt=0, quantity__gt=0)
        elif duration == 'last_year_to_date':
            context = {
                'order_date__date__year': now.date().year - 1
            }
            args, duration_kwargs = self.get_filter_context(context, **kwargs)
            return self.dispense_histories.filter(*args, **duration_kwargs).filter(total_paid__gt=0, quantity__gt=0)
        elif duration == 'last_3_years':
            context = {
                'order_date__date__year__gte': now.date().year - 2
            }
            args, duration_kwargs = self.get_filter_context(context, **kwargs)
            return self.dispense_histories.filter(*args, **duration_kwargs).filter(total_paid__gt=0, quantity__gt=0)

        raise ValueError(_("No pre-defined queryset found for that duration."))

    def get_profit(self, duration, **kwargs):
        lookup = {
            'all': self.get_sales('all', **kwargs),
            'today': self.get_sales('today', **kwargs),
            'this_week': self.get_sales('this_week', **kwargs),
            'last_week': self.get_sales('last_week', **kwargs),
            'this_month': self.get_sales('this_month', **kwargs),
            'last_month': self.get_sales('last_month', **kwargs),
            'last_month_running': self.get_sales('last_month_running', **kwargs),
            'year_to_date': self.get_sales('year_to_date', **kwargs),
            'last_year_to_date': self.get_sales('last_year_to_date', **kwargs),
            'last_3_years': self.get_sales('last_3_years', **kwargs),
        }
        if duration not in lookup:
            raise ValueError(_("No pre-defined queryset found for that duration."))

        sales = lookup[duration]
        return calculate_profit(sales)

    def get_transactions(self, context):
        return self.dispense_histories.filter(**context).filter(total_paid__gt=0, quantity__gt=0)

    def get_profit_by_date(self, day, customer=None):
        context = {'order_date__date': day}
        if customer:
            context.update({'customer': customer})
        transactions = self.get_transactions(context)
        maintenance_fees = new_get_maintenance_fees(
            day, day, transactions, customer, self.__class__.__name__ == 'Physician'
        )
        return calculate_profit(transactions) - maintenance_fees

    def get_profit_by_date_range(self, start_date, end_date, customer=None):
        context = {'order_date__range': (start_date, end_date)}
        if customer:
            context.update({'customer': customer})
        transactions = self.get_transactions(context)
        maintenance_fees = new_get_maintenance_fees(
            start_date, end_date, transactions, customer, self.__class__.__name__ == 'Physician'
        )
        return calculate_profit(transactions) - maintenance_fees

    def get_profit_by_month_year(self, month, year, customer=None):
        context = {'order_date__date__month': month, 'order_date__date__year': year}
        if customer:
            context.update({'customer': customer})
        start_of_month = date(year, month, 1)
        end_of_month = start_of_month + relativedelta(months=1) - relativedelta(days=1)
        transactions = self.get_transactions(context)
        maintenance_fees = new_get_maintenance_fees(
            start_of_month, end_of_month, transactions, customer, self.__class__.__name__ == 'Physician'
        )
        return calculate_profit(transactions) - maintenance_fees

    def get_profit_by_year(self, year, customer=None):
        context = {'order_date__date__year': year}
        if customer:
            context.update({'customer': customer})
        start_of_month = date(year, 1, 1)
        end_of_month = start_of_month + relativedelta(years=1) - relativedelta(days=1)
        transactions = self.get_transactions(context)
        maintenance_fees = new_get_maintenance_fees(
            start_of_month, end_of_month, transactions, customer, self.__class__.__name__ == 'Physician'
        )
        return calculate_profit(transactions) - maintenance_fees

    def get_profits_by_today_overview(self, customer=None, type=None):
        profit = self.get_profit_by_date(timezone.localtime().date(), customer=customer)
        return profit

    def get_profits_by_last_week_overview(self, customer=None):
        profits = []
        now = timezone.now()
        start_date = now - timedelta(days=now.weekday(), weeks=1)
        day_count = 7
        for single_date in (start_date + timedelta(n) for n in range(day_count)):
            day = single_date.date()
            profit = self.get_profit_by_date(day, customer=customer)
            profits.append(profit)

        return profits

    def get_profits_by_last_week(self, customer=None):
        profits = []
        now = timezone.now()
        start_date = now - timedelta(days=now.weekday(), weeks=1)
        day_count = 7
        for single_date in (start_date + timedelta(n) for n in range(day_count)):
            day = single_date.date()
            profit = self.get_profit_by_date(day, customer=customer)
            profits.append({day.strftime('%m/%d/%Y'): profit})

        return profits

    def get_profits_by_this_week(self, customer=None):
        profits = []
        now = timezone.now()
        monday = now - relativedelta(days=now.weekday())
        start_date = datetime.combine(monday.date(), time.min)
        end_date = datetime.combine(now.date(), time.max)
        day_count = (end_date - start_date).days + 1
        for single_date in (start_date + timedelta(n) for n in range(day_count)):
            day = single_date.date()
            profit = self.get_profit_by_date(day, customer=customer)
            profits.append({day.strftime('%m/%d/%Y'): profit})

        return profits

    def get_profits_by_this_week_overview(self, customer=None):
        profits = []
        now = timezone.now()
        monday = now - relativedelta(days=now.weekday())
        start_date = datetime.combine(monday.date(), time.min)
        end_date = datetime.combine(now.date(), time.max)
        day_count = (end_date - start_date).days + 1
        for single_date in (start_date + timedelta(n) for n in range(day_count)):
            day = single_date.date()
            profit = self.get_profit_by_date(day, customer=customer)
            profits.append(profit)

        return profits

    def get_profits_by_this_month(self, customer=None):
        profits = []
        today = timezone.now().date()
        start_date = today.replace(day=1)
        current = start_date
        while current <= today:
            current_end = min(current + relativedelta(days=6), today)
            profit = self.get_profit_by_date_range(current, current_end, customer)

            key = "{}-{}".format(current.strftime("%m/%d/%Y"), current_end.strftime("%m/%d/%Y"))
            profits.append(profit)
            current += relativedelta(days=7)

        return profits

    def get_profits_by_this_month_overview(self, customer=None):
        profits = []
        today = timezone.now().date()
        start_date = today.replace(day=1)
        current = start_date
        while current <= today:
            current_end = min(current + relativedelta(days=6), today)
            profit = self.get_profit_by_date_range(current, current_end, customer)

            key = "{}-{}".format(current.strftime("%m/%d/%Y"), current_end.strftime("%m/%d/%Y"))
            profits.append(profit)
            current += relativedelta(days=7)

        return profits

    def get_profits_by_last_month_overview(self, customer=None):
        profits = []
        today = timezone.now().date()
        start_date = today.replace(day=1) - relativedelta(months=1)
        end_date = today.replace(day=1) - relativedelta(days=1)
        current = start_date
        while current <= end_date:
            current_end = min(current + relativedelta(days=6), end_date)
            profit = self.get_profit_by_date_range(current, current_end, customer)

            key = "{}-{}".format(current.strftime("%m/%d/%Y"), current_end.strftime("%m/%d/%Y"))
            profits.append(profit)
            current += relativedelta(days=7)

        return profits

    def get_profits_by_last_month(self, customer=None):
        profits = []
        today = timezone.now().date()
        start_date = today.replace(day=1) - relativedelta(months=1)
        end_date = today.replace(day=1) - relativedelta(days=1)
        current = start_date
        while current <= end_date:
            current_end = min(current + relativedelta(days=6), end_date)
            profit = self.get_profit_by_date_range(current, current_end, customer)

            key = "{}-{}".format(current.strftime("%m/%d/%Y"), current_end.strftime("%m/%d/%Y"))
            profits.append(profit)
            current += relativedelta(days=7)

        return profits

    def get_profits_by_year_to_date_overview(self, customer=None):
        profits = []
        now = timezone.now()
        year = now.year
        for num in range(now.month):
            month = num + 1
            month_name = calendar.month_name[num + 1]
            profit = self.get_profit_by_month_year(month, year, customer)
            profits.append(profit)

        return profits

    def get_profits_by_year_to_date(self, customer=None):
        profits = []
        now = timezone.now()
        year = now.year
        for num in range(now.month):
            month = num + 1
            month_name = calendar.month_name[num + 1]
            profit = self.get_profit_by_month_year(month, year, customer)
            profits.append({'{} {}'.format(month_name, year): profit})

        return profits

    def get_profits_by_last_year_to_date_overview(self, customer=None):
        profits = []
        year = timezone.now().year - 1
        for num in range(12):
            month = num + 1
            month_name = calendar.month_name[num + 1]
            profit = self.get_profit_by_month_year(month, year, customer)
            profits.append(profit)

        return profits

    def get_profits_by_last_year_to_date(self, customer=None):
        profits = []
        year = timezone.now().year - 1
        for num in range(12):
            month = num + 1
            month_name = calendar.month_name[num + 1]
            profit = self.get_profit_by_month_year(month, year, customer)
            profits.append({'{} {}'.format(month_name, year): profit})

        return profits

    def get_profits_by_last_3_years_overview(self, customer=None):
        profits = []
        year = timezone.now().year - 2
        for num in range(3):
            profit = self.get_profit_by_year(year + num, customer)
            profits.append(profit)

        return profits

    def get_profits_by_last_3_years(self, customer=None, type=None):
        profits = []
        year = timezone.now().year - 2
        for num in range(3):
            profit = self.get_profit_by_year(year + num, customer)
            profits.append({'{}'.format(year + num): profit})

        return profits

    @property
    def profit(self):
        return self.get_profit('all')

    @property
    def profit_today(self):
        return self.get_profit('today')

    @property
    def profit_this_week(self):
        return self.get_profit('this_week')

    @property
    def profit_this_month(self):
        return self.get_profit('this_month')

    @property
    def profit_year_to_date(self):
        return self.get_profit('year_to_date')

    @property
    def profit_last_year_to_date(self):
        return self.get_profit('last_year_to_date')

    @property
    def profit_last_3_years(self):
        return self.get_profit('last_3_years')


class PortalAccessMixin(object):
    """
    This mixin handles the sending of email to users who were
    given access to the admin/customer portal.
    """

    def __init__(self, *args, **kwargs):
        super(PortalAccessMixin, self).__init__(*args, **kwargs)
        self.previous_portal_access = self.portal_access

    def save(self, *args, **kwargs):
        super(PortalAccessMixin, self).save(*args, **kwargs)

        if self.portal_access and not self.previous_portal_access:
            mailer = ProfilesMailer()
            mailer.send_portal_access_credentials(self)

        return self
