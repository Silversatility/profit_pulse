from django.db import models
from django.utils.translation import ugettext_lazy as _
# Create your models here.
from model_utils import Choices
from model_utils.models import StatusModel, TimeStampedModel
from profit_pulse.core.mixins import get_upload_path


class SwitchingReport(StatusModel, TimeStampedModel, models.Model):
    """
    Stores information about a Dispense Report
    """
    STATUS = Choices('pending', 'imported', 'parse_error')

    report_url = models.URLField(
        max_length=255,
    )
    file = models.FileField(upload_to=get_upload_path, blank=True, null=True)

    class Meta:
        verbose_name = _('Switching Fee Report')
        verbose_name_plural = _('Switching Fee Reports')

    def __str__(self):
        return self.report_url


class SwitchingFee(TimeStampedModel, models.Model):
    report = models.ForeignKey('switching_fees.SwitchingReport', related_name='histories', on_delete=models.CASCADE,
                               null=True)
    customer = models.ForeignKey('profiles.Customer', related_name='switching_fees', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=7, decimal_places=2)
    order_date = models.DateTimeField()

    class Meta:
        verbose_name = _('Switching Fee')
        verbose_name_plural = _('Switching Fees')

    def __str__(self):
        return "Switching Fee: {} - {}".format(self.customer, self.amount)

    @property
    def switching_charges(self):
        customer = self.customer
        amount = self.amount
        return amount * customer.get_matching_fee_structure(
            self.order_date.date()
        ).switching_fee
