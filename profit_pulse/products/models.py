from __future__ import unicode_literals

from django.db import models
from django.db.models import Count, DecimalField, ExpressionWrapper, F, Min, Q, Sum
from django.utils.translation import ugettext_lazy as _
from model_utils.models import SoftDeletableModel, TimeStampedModel

from profit_pulse.dispense.utils import get_duration_filter

from profit_pulse.core.mixins import get_upload_path


class Product(SoftDeletableModel, TimeStampedModel, models.Model):
    """
    Stores information about a product
    """
    title = models.CharField(
        max_length=255,
    )
    description = models.TextField(
        blank=True
    )
    image = models.ImageField(
        upload_to=get_upload_path,
        blank=True,
        null=True,
    )
    size = models.CharField(
        max_length=128,
        blank=True
    )
    ndc = models.CharField(
        max_length=255,
        blank=True
    )
    awp = models.CharField(
        max_length=255,
        blank=True
    )
    is_active = models.BooleanField(
        default=True
    )
    is_datascan_import = models.BooleanField(
        default=False,
    )
    # Average Margin
    today_average_margin = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    yesterday_average_margin = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    this_week_average_margin = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    last_week_average_margin = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    this_month_average_margin = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    last_month_average_margin = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    year_to_date_average_margin = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    last_year_to_date_average_margin = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    last_3_years_average_margin = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    # Rank
    today_rank = models.PositiveSmallIntegerField(null=True, blank=True)
    yesterday_rank = models.PositiveSmallIntegerField(null=True, blank=True)
    this_week_rank = models.PositiveSmallIntegerField(null=True, blank=True)
    last_week_rank = models.PositiveSmallIntegerField(null=True, blank=True)
    this_month_rank = models.PositiveSmallIntegerField(null=True, blank=True)
    last_month_rank = models.PositiveSmallIntegerField(null=True, blank=True)
    year_to_date_rank = models.PositiveSmallIntegerField(null=True, blank=True)
    last_year_to_date_rank = models.PositiveSmallIntegerField(null=True, blank=True)
    last_3_years_rank = models.PositiveSmallIntegerField(null=True, blank=True)

    all_objects = models.Manager()

    class Meta:
        verbose_name = _('Product')
        verbose_name_plural = _('Products')

    def __str__(self):
        return '{}: {}'.format(self.ndc, self.title)

    @classmethod
    def recompute_averages_and_ranks(cls):
        queryset = cls.all_objects.all()

        # today_average_margin
        queryset = queryset.annotate(
            today_dispense_history_count=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'today',
                    'dispense_histories__order_date'
                )
            )),
            cost_min=Min('dispense_histories__cost', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
            )),
            today_total_quantity=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'today',
                    'dispense_histories__order_date'
                )
            )),
            today_total_margin=Sum('dispense_histories__total_paid', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'today',
                    'dispense_histories__order_date'
                )
            )) - Sum('dispense_histories__cost', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'today',
                    'dispense_histories__order_date'
                )
            )),
        ).annotate(
            temporary_today_average_margin=ExpressionWrapper(
                F('today_total_margin') / F('today_total_quantity'),
                output_field=DecimalField(max_digits=7, decimal_places=2)
            ),
        )
        # yesterday_average_margin
        queryset = queryset.annotate(
            yesterday_dispense_history_count=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'yesterday',
                    'dispense_histories__order_date'
                )
            )),
            yesterday_total_quantity=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'yesterday',
                    'dispense_histories__order_date'
                )
            )),
            yesterday_total_margin=Sum('dispense_histories__total_paid', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'yesterday',
                    'dispense_histories__order_date'
                )
            )) - Sum('dispense_histories__cost', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'yesterday',
                    'dispense_histories__order_date'
                )
            )),
        ).annotate(
            temporary_yesterday_average_margin=ExpressionWrapper(
                F('yesterday_total_margin') / F('yesterday_total_quantity'),
                output_field=DecimalField(max_digits=7, decimal_places=2)
            ),
        )
        # this_week_average_margin
        queryset = queryset.annotate(
            this_week_dispense_history_count=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'this_week',
                    'dispense_histories__order_date'
                )
            )),
            this_week_total_quantity=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'this_week',
                    'dispense_histories__order_date'
                )
            )),
            this_week_total_margin=Sum('dispense_histories__total_paid', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'this_week',
                    'dispense_histories__order_date'
                )
            )) - Sum('dispense_histories__cost', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'this_week',
                    'dispense_histories__order_date'
                )
            )),
        ).annotate(
            temporary_this_week_average_margin=ExpressionWrapper(
                F('this_week_total_margin') / F('this_week_total_quantity'),
                output_field=DecimalField(max_digits=7, decimal_places=2)
            ),
        )
        # last_week_average_margin
        queryset = queryset.annotate(
            last_week_dispense_history_count=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_week',
                    'dispense_histories__order_date'
                )
            )),
            last_week_total_quantity=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_week',
                    'dispense_histories__order_date'
                )
            )),
            last_week_total_margin=Sum('dispense_histories__total_paid', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_week',
                    'dispense_histories__order_date'
                )
            )) - Sum('dispense_histories__cost', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_week',
                    'dispense_histories__order_date'
                )
            )),
        ).annotate(
            temporary_last_week_average_margin=ExpressionWrapper(
                F('last_week_total_margin') / F('last_week_total_quantity'),
                output_field=DecimalField(max_digits=7, decimal_places=2)
            ),
        )
        # this_month_average_margin
        queryset = queryset.annotate(
            this_month_dispense_history_count=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'this_month',
                    'dispense_histories__order_date'
                )
            )),
            this_month_total_quantity=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'this_month',
                    'dispense_histories__order_date'
                )
            )),
            this_month_total_margin=Sum('dispense_histories__total_paid', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'this_month',
                    'dispense_histories__order_date'
                )
            )) - Sum('dispense_histories__cost', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'this_month',
                    'dispense_histories__order_date'
                )
            )),
        ).annotate(
            temporary_this_month_average_margin=ExpressionWrapper(
                F('this_month_total_margin') / F('this_month_total_quantity'),
                output_field=DecimalField(max_digits=7, decimal_places=2)
            ),
        )
        # last_month_average_margin
        queryset = queryset.annotate(
            last_month_dispense_history_count=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_month',
                    'dispense_histories__order_date'
                )
            )),
            last_month_total_quantity=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_month',
                    'dispense_histories__order_date'
                )
            )),
            last_month_total_margin=Sum('dispense_histories__total_paid', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_month',
                    'dispense_histories__order_date'
                )
            )) - Sum('dispense_histories__cost', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_month',
                    'dispense_histories__order_date'
                )
            )),
        ).annotate(
            temporary_last_month_average_margin=ExpressionWrapper(
                F('last_month_total_margin') / F('last_month_total_quantity'),
                output_field=DecimalField(max_digits=7, decimal_places=2)
            ),
        )
        # year_to_date_average_margin
        queryset = queryset.annotate(
            year_to_date_dispense_history_count=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'year_to_date',
                    'dispense_histories__order_date'
                )
            )),
            year_to_date_total_quantity=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'year_to_date',
                    'dispense_histories__order_date'
                )
            )),
            year_to_date_total_margin=Sum('dispense_histories__total_paid', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'year_to_date',
                    'dispense_histories__order_date'
                )
            )) - Sum('dispense_histories__cost', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'year_to_date',
                    'dispense_histories__order_date'
                )
            )),
        ).annotate(
            temporary_year_to_date_average_margin=ExpressionWrapper(
                F('year_to_date_total_margin') / F('year_to_date_total_quantity'),
                output_field=DecimalField(max_digits=7, decimal_places=2)
            ),
        )
        # last_year_to_date_average_margin
        queryset = queryset.annotate(
            last_year_to_date_dispense_history_count=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_year_to_date',
                    'dispense_histories__order_date'
                )
            )),
            last_year_to_date_total_quantity=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_year_to_date',
                    'dispense_histories__order_date'
                )
            )),
            last_year_to_date_total_margin=Sum('dispense_histories__total_paid', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_year_to_date',
                    'dispense_histories__order_date'
                )
            )) - Sum('dispense_histories__cost', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_year_to_date',
                    'dispense_histories__order_date'
                )
            )),
        ).annotate(
            temporary_last_year_to_date_average_margin=ExpressionWrapper(
                F('last_year_to_date_total_margin') / F('last_year_to_date_total_quantity'),
                output_field=DecimalField(max_digits=7, decimal_places=2)
            ),
        )
        # last_3_years_average_margin
        queryset = queryset.annotate(
            last_3_years_dispense_history_count=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_3_years',
                    'dispense_histories__order_date'
                )
            )),
            last_3_years_total_quantity=Count('dispense_histories', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_3_years',
                    'dispense_histories__order_date'
                )
            )),
            last_3_years_total_margin=Sum('dispense_histories__total_paid', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_3_years',
                    'dispense_histories__order_date'
                )
            )) - Sum('dispense_histories__cost', filter=Q(
                dispense_histories__total_paid__gt=0, dispense_histories__quantity__gt=0,
                **get_duration_filter(
                    'last_3_years',
                    'dispense_histories__order_date'
                )
            )),
        ).annotate(
            temporary_last_3_years_average_margin=ExpressionWrapper(
                F('last_3_years_total_margin') / F('last_3_years_total_quantity'),
                output_field=DecimalField(max_digits=7, decimal_places=2)
            ),
        )
        # .filter(dispense_history_count__gt=0)
        for product in queryset:
            product.today_average_margin = product.temporary_today_average_margin or 0
            product.yesterday_average_margin = product.temporary_yesterday_average_margin or 0
            product.this_week_average_margin = product.temporary_this_week_average_margin or 0
            product.last_week_average_margin = product.temporary_last_week_average_margin or 0
            product.this_month_average_margin = product.temporary_this_month_average_margin or 0
            product.last_month_average_margin = product.temporary_last_month_average_margin or 0
            product.year_to_date_average_margin = product.temporary_year_to_date_average_margin or 0
            product.last_year_to_date_average_margin = product.temporary_last_year_to_date_average_margin or 0
            product.last_3_years_average_margin = product.temporary_last_3_years_average_margin or 0
            product.save()

        # today_rank
        ranks = {}
        for index, count in enumerate(
            queryset.order_by(
                '-today_dispense_history_count').values_list('today_dispense_history_count', flat=True)
        ):
            ranks.setdefault(count, index + 1)
        for product in queryset:
            product.today_rank = ranks.get(product.today_dispense_history_count)
            product.save()

        # yesterday_rank
        ranks = {}
        for index, count in enumerate(
            queryset.order_by(
                '-yesterday_dispense_history_count').values_list('yesterday_dispense_history_count', flat=True)
        ):
            ranks.setdefault(count, index + 1)
        for product in queryset:
            product.yesterday_rank = ranks.get(product.yesterday_dispense_history_count)
            product.save()

        # this_week_rank
        ranks = {}
        for index, count in enumerate(
            queryset.order_by(
                '-this_week_dispense_history_count').values_list('this_week_dispense_history_count', flat=True)
        ):
            ranks.setdefault(count, index + 1)
        for product in queryset:
            product.this_week_rank = ranks.get(product.this_week_dispense_history_count)
            product.save()

        # last_week_rank
        ranks = {}
        for index, count in enumerate(
            queryset.order_by(
                '-last_week_dispense_history_count').values_list('last_week_dispense_history_count', flat=True)
        ):
            ranks.setdefault(count, index + 1)
        for product in queryset:
            product.last_week_rank = ranks.get(product.last_week_dispense_history_count)
            product.save()

        # this_month_rank
        ranks = {}
        for index, count in enumerate(
            queryset.order_by(
                '-this_month_dispense_history_count').values_list('this_month_dispense_history_count', flat=True)
        ):
            ranks.setdefault(count, index + 1)
        for product in queryset:
            product.this_month_rank = ranks.get(product.this_month_dispense_history_count)
            product.save()

        # last_month_rank
        ranks = {}
        for index, count in enumerate(
            queryset.order_by(
                '-last_month_dispense_history_count').values_list('last_month_dispense_history_count', flat=True)
        ):
            ranks.setdefault(count, index + 1)
        for product in queryset:
            product.last_month_rank = ranks.get(product.last_month_dispense_history_count)
            product.save()

        # year_to_date_rank
        ranks = {}
        for index, count in enumerate(
            queryset.order_by(
                '-year_to_date_dispense_history_count').values_list('year_to_date_dispense_history_count', flat=True)
        ):
            ranks.setdefault(count, index + 1)
        for product in queryset:
            product.year_to_date_rank = ranks.get(product.year_to_date_dispense_history_count)
            product.save()

        # last_year_to_date_rank
        ranks = {}
        for index, count in enumerate(
            queryset.order_by(
                '-last_year_to_date_dispense_history_count').values_list(
                    'last_year_to_date_dispense_history_count', flat=True)
        ):
            ranks.setdefault(count, index + 1)
        for product in queryset:
            product.last_year_to_date_rank = ranks.get(product.last_year_to_date_dispense_history_count)
            product.save()

        # last_3_years_rank
        ranks = {}
        for index, count in enumerate(
            queryset.order_by(
                '-last_3_years_dispense_history_count').values_list(
                    'last_3_years_dispense_history_count', flat=True)
        ):
            ranks.setdefault(count, index + 1)
        for product in queryset:
            product.last_3_years_rank = ranks.get(product.last_3_years_dispense_history_count)
            product.save()
