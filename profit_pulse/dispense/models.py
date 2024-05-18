from datetime import datetime, timedelta
from decimal import Decimal

from django.db import models
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from simple_history.models import HistoricalRecords

from model_utils import Choices
from model_utils.models import StatusModel, TimeStampedModel


class DispenseReport(StatusModel, TimeStampedModel, models.Model):
    """
    Stores information about a Dispense Report
    """
    STATUS = Choices('pending', 'imported', 'parse_error', 'processing')

    report_url = models.URLField(
        max_length=255,
    )

    class Meta:
        verbose_name = _('Dispense Report')
        verbose_name_plural = _('Dispense Reports')

    def __str__(self):
        return self.report_url


class DispenseHistory(TimeStampedModel, models.Model):
    """
    Stores information about a Dispense History
    """
    report = models.ForeignKey('dispense.DispenseReport', related_name='histories', on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product', related_name='dispense_histories', on_delete=models.CASCADE)
    customer = models.ForeignKey('profiles.Customer', related_name='dispense_histories', on_delete=models.CASCADE)
    physician = models.ForeignKey('profiles.Physician', related_name='dispense_histories', on_delete=models.CASCADE)
    trans_amount_paid = models.DecimalField(max_digits=7, decimal_places=2, default=Decimal('0.00'))
    insurance_paid = models.DecimalField(max_digits=7, decimal_places=2)
    total_paid = models.DecimalField(max_digits=7, decimal_places=2)
    cost = models.DecimalField(max_digits=7, decimal_places=2)
    quantity = models.PositiveIntegerField()
    rx_number = models.CharField(max_length=128)
    rf_number = models.CharField(max_length=128)
    order_date = models.DateTimeField()
    written_date = models.DateTimeField(blank=True, null=True)
    extra = models.TextField(blank=True)
    history = HistoricalRecords()


    class Meta:
        verbose_name = _('Dispense History')
        verbose_name_plural = _('Dispense Histories')

    def __str__(self):
        return "{} - {}".format(self.physician, self.customer)

    @property
    def profit(self):
        return self.insurance_paid - self.cost

    @property
    def margin(self):
        return self.total_paid - self.cost


class FeeStructure(models.Model):
    customer = models.ForeignKey('profiles.Customer', related_name='fee_structures', on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    monthly_fee = models.DecimalField(max_digits=7, decimal_places=2, default=Decimal('0'))
    billing_percentage = models.DecimalField(max_digits=7, decimal_places=2, default=Decimal('0'))
    switching_fee = models.DecimalField(max_digits=7, decimal_places=2, default=Decimal('0'))

    class Meta:
        ordering = ['start_date']

    def __str__(self):
        return '{} - {}'.format(self.start_date, self.end_date)
