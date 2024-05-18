import pytz

from datetime import datetime
from rest_framework import filters
from rest_framework.compat import coreapi, coreschema

from django.core.exceptions import FieldDoesNotExist
from django.db.models.fields.reverse_related import (
    ForeignObjectRel,
    OneToOneRel,
)
from django.utils import six
from django.utils.encoding import force_text
from django.utils.translation import ugettext_lazy as _

from profit_pulse.dispense.utils import get_duration_queryset


class RelatedOrderingFilter(filters.OrderingFilter):
    """

    See: https://github.com/tomchristie/django-rest-framework/issues/1005

    Extends OrderingFilter to support ordering by fields in related models
    using the Django ORM __ notation
    """

    def is_valid_field(self, model, field):
        """
        Return true if the field exists within the model (or in the related
        model specified using the Django ORM __ notation)
        """
        components = field.split('__', 1)
        if field.startswith('dfbypass_'):
            return True
        try:
            field = model._meta.get_field(components[0])

            if isinstance(field, OneToOneRel):
                return self.is_valid_field(field.related_model, components[1])

            # reverse relation
            if isinstance(field, ForeignObjectRel):
                return self.is_valid_field(field.model, components[1])

            # foreign key
            if field.remote_field and len(components) == 2:
                return self.is_valid_field(field.related_model, components[1])
            return True
        except FieldDoesNotExist:
            return False

    def remove_invalid_fields(self, queryset, fields, ordering, view):
        return [term for term in fields
                if self.is_valid_field(queryset.model, term.lstrip('-'))]


class DurationFilter(filters.BaseFilterBackend):
    """
    Custom filtering that enables views to filter using the pre-configured
    duration values. Accepted values are the following:
        - today
        - yesterday
        - this_week
        - last_week
        - this_month
        - last_month
        - year_to_date
        - last_year_to_date
        - last_3_years

    This filter requires a `duration_field` variable declared in the view.
    Otherwise, this will return an AssertionError.
    """
    start_date_param = 'sdate'
    start_date_title = _('Start Date')
    start_date_description = _(
        'Start Date format: YYYY-MM-DD`'
    )
    end_date_param = 'edate'
    end_date_title = _('End Date')
    end_date_description = _(
        'End Date format: YYYY-MM-DD`'
    )
    duration_param = 'duration'
    duration_title = _('Duration')
    duration_description = _(
        'Choices are `today`, `yesterday`, `this_week`, `last_week`, `this_month`, `last_month`, `year_to_date`,'
        ' `last_year_to_date`, `last_3_years`'
    )
    duration_default = 'this_month'
    valid_params = [
        'today',
        'yesterday',
        'this_week',
        'last_week',
        'this_month',
        'last_month',
        'year_to_date',
        'last_year_to_date',
        'last_3_years',
    ]

    def get_duration_field(self, view):
        field = getattr(view, 'duration_field', None)
        if isinstance(field, six.string_types):
            return field
        msg = _('Please provide a valid datetime field.')
        raise AssertionError(msg)

    def get_second_duration_field(self, view):
        field = getattr(view, 'second_duration_field', None)
        if field and isinstance(field, six.string_types):
                return field
        msg = _(
            'Please provide a valid datetime field for '
            '`second_duration_field` value in view.'
        )
        raise AssertionError(msg)

    def get_duration_default(self, view):
        default = getattr(view, 'duration_default', 'this_month')
        if default in self.valid_params:
            return default
        msg = _('Please provide a valid option [today, yesterday, this_week,'
                ' last_week, this_month, last_month, year_to_date, last_year_to_date, last_3_years].')
        raise AssertionError(msg)

    def get_duration(self, request):
        param = request.query_params.get(
            self.duration_param,
            self.duration_default
        )
        return param if param in self.valid_params else self.duration_default

    def get_start_date(self, request):
        start_date = request.query_params.get('sdate', None)
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            start_date = pytz.utc.localize(start_date)
        return start_date

    def get_end_date(self, request):
        end_date = request.query_params.get('edate', None)
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            end_date = pytz.utc.localize(end_date)
        return end_date

    def filter_queryset(self, request, queryset, view):
        self.default = self.get_duration_default(view)
        start_date = self.get_start_date(request)
        end_date = self.get_end_date(request)
        param = self.get_duration(request)
        field = self.get_duration_field(view)

        return get_duration_queryset(
            param,
            field,
            queryset,
            start_date,
            end_date
        )

    def filter_second_queryset(self, request, queryset, view):
        self.default = self.get_duration_default(view)
        start_date = self.get_start_date(request)
        end_date = self.get_end_date(request)
        param = self.get_duration(request)
        field = self.get_second_duration_field(view)

        return get_duration_queryset(
            param,
            field,
            queryset,
            start_date,
            end_date
        )

    def get_schema_fields(self, view):
        assert coreapi is not None, 'coreapi must be installed to use `get_schema_fields()`'
        assert coreschema is not None, 'coreschema must be installed to use `get_schema_fields()`'
        return [
            coreapi.Field(
                name=self.duration_param,
                required=False,
                location='query',
                schema=coreschema.String(
                    title=force_text(self.duration_title),
                    description=force_text(self.duration_description)
                )
            ),
            coreapi.Field(
                name=self.start_date_param,
                required=False,
                location='query',
                schema=coreschema.String(
                    title=force_text(self.start_date_title),
                    description=force_text(self.start_date_description)
                )
            ),
            coreapi.Field(
                name=self.end_date_param,
                required=False,
                location='query',
                schema=coreschema.String(
                    title=force_text(self.end_date_title),
                    description=force_text(self.end_date_description)
                )
            ),
        ]


class SerializerDurationFilter(filters.BaseFilterBackend):
    """
    Custom filtering that enables views to filter using the pre-configured
    duration values. Accepted values are the following:
        - this_week
        - this_month
        - last_month
        - year_to_date
        - last_year_to_date
        - last_3_years

    Take note that this filter does not directly influence the queryset.
    The parameter passed on this filter will be consumed by the serializer
    of the view.

    This filter requires a `duration_default` variable declared in the view.
    Otherwise, this will return an AssertionError.
    """

    duration_param = 'duration'
    duration_title = _('Duration')
    duration_description = _(
        'Choices are `this_week`, `this_month`, `last_month`, `year_to_date`,'
        ' `last_year_to_date`, `last_3_years`'
    )
    duration_default = 'this_week'
    valid_params = [
        'this_week',
        'this_month',
        'last_month',
        'year_to_date',
        'last_year_to_date',
        'last_3_years',
    ]

    def filter_queryset(self, request, queryset, view):
        return queryset

    def get_duration_default(self, view):
        default = getattr(view, 'duration_default', 'this_week')
        if default in self.valid_params:
            return default
        msg = _(
            'Please provide a valid option [this_week, this_month, last_month, year_to_date,'
            ' last_year_to_date, last_3_years].'
        )
        raise AssertionError(msg)

    def get_schema_fields(self, view):
        assert coreapi is not None, 'coreapi must be installed to use `get_schema_fields()`'
        assert coreschema is not None, 'coreschema must be installed to use `get_schema_fields()`'
        return [
            coreapi.Field(
                name=self.duration_param,
                required=False,
                location='query',
                schema=coreschema.String(
                    title=force_text(self.duration_title),
                    description=force_text(self.duration_description)
                )
            )
        ]
