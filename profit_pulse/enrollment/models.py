from __future__ import unicode_literals

from django.db import models
from django.utils.translation import ugettext_lazy as _

from profit_pulse.core.mixins import get_upload_path

from model_utils.models import TimeStampedModel


class CustomerContract(TimeStampedModel, models.Model):
    """
    Stores the active enrollment contract to be used by
    the enrolling customer.
    """

    pdf_file = models.FileField(
        upload_to=get_upload_path,
    )
    is_active = models.BooleanField(
        default=True
    )

    class Meta:
        verbose_name = _('Customer Contract')
        verbose_name_plural = _('Customer Contracts')

    def __str__(self):
        return self.filename

    def save(self, *args, **kwargs):
        super(CustomerContract, self).save(*args, **kwargs)

        # Make sure that there is only one active
        # record stored.
        CustomerContract.objects.filter(
            is_active=True).exclude(
                id=self.id).update(
                    is_active=False)

        return self

    @property
    def filename(self):
        parts = self.pdf_file.name.split('/')
        return parts[-1]
