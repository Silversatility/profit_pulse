from datetime import datetime, time, timedelta
from dateutil.relativedelta import relativedelta
from decimal import Decimal

import pytz

from django.conf import settings
from django.db.models import Sum, ExpressionWrapper, F, DecimalField
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _


def calculate_percentage(percent, amount):
    return (amount * percent) / Decimal('100.00')


def calculate_profit(queryset):
    """
    Helper function to calculate the profit of the given queryset.
    """
    profit_queryset = queryset.annotate(
        total_profit=ExpressionWrapper(
            F('total_paid') - F('cost'),
            output_field=DecimalField(max_digits=7, decimal_places=2)
        )
    )
    data = profit_queryset.aggregate(total=Sum('total_profit'))
    return data['total'] or Decimal('0.00')


def get_duration_filter(param, field):
    now = timezone.now()
    if param == 'today':
        est = pytz.timezone(settings.TIME_ZONE)
        now_est = now.astimezone(est)
        start_date = now_est.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=1)
        return {'{}__range'.format(field): (start_date, end_date)}

    elif param == 'yesterday':
        est = pytz.timezone(settings.TIME_ZONE)
        now_est = now.astimezone(est)
        end_date = now_est.replace(hour=0, minute=0, second=0, microsecond=0)
        start_date = end_date - timedelta(days=1)
        return {'{}__range'.format(field): (start_date, end_date)}

    elif param == 'this_week':
        monday = now - relativedelta(days=now.weekday())
        start_date = datetime.combine(monday.date(), time.min)
        end_date = datetime.combine(now.date(), time.max)
        return {'{}__range'.format(field): (start_date, end_date)}

    elif param == 'last_week':
        previous_monday = now - relativedelta(days=now.weekday(), weeks=1)
        start_date = datetime.combine(previous_monday.date(), time.min)
        end_date = datetime.combine(now.date(), time.max)
        return {'{}__range'.format(field): (start_date, end_date)}

    elif param == 'this_month':
        return {
            '{}__date__month'.format(field): now.date().month,
            '{}__date__year'.format(field): now.date().year,
        }

    elif param == 'last_month':
        last_month = now - relativedelta(months=1)
        return {
            '{}__date__month'.format(field): last_month.date().month,
            '{}__date__year'.format(field): last_month.date().year,
        }

    elif param == 'year_to_date':
        return {'{}__date__year'.format(field): now.date().year}

    elif param == 'last_year_to_date':
        return {'{}__date__year'.format(field): now.date().year - 1}

    elif param == 'last_3_years':
        return {'{}__date__year__gte'.format(field): now.date().year - 2}

    raise ValueError(
        _("No pre-defined queryset found for that duration.")
    )


def get_duration_queryset(param, field, queryset, sdate=None, edate=None):
    """
    Returns a queryset after being filtered based on the given
    duration `param`.
    """
    if sdate and edate:
        start_date = datetime.combine(sdate.date(), time.min)
        end_date = datetime.combine(edate.date(), time.max)
        context = {
            '{}__range'.format(field): (start_date, end_date)
        }
        return queryset.filter(**context)
    else:
        return queryset.filter(**get_duration_filter(param, field))
