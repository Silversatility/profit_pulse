from __future__ import unicode_literals

from decimal import Decimal

from django.db import models


class Address(models.Model):
    """
    Stores information about an address
    """
    street_address = models.CharField(
        max_length=255,
        blank=True
    )
    city = models.CharField(
        blank=True,
        max_length=50,
    )
    state = models.CharField(
        blank=True,
        max_length=40,
    )
    zip_code = models.CharField(
        max_length=40,
        blank=True
    )

    class Meta:
        abstract = True

    @property
    def full_address(self):
        return '{}, {}, {}, {}'.format(
            self.street_address,
            self.city,
            self.state,
            self.zip_code
        )


class AbstractProfile(Address):
    """
    This model inherits from :model:`core.Address` model.
    This contains more fields like the following:
        - phone_number
    """
    phone_number = models.CharField(
        max_length=24,
        blank=True,
    )
    company_goal = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=Decimal('0.00')
    )
    overhead = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=Decimal('0.00')
    )
    commissions_owed = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('2')
    )
    customer_goal = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=Decimal('0.00')
    )

    class Meta:
        abstract = True

    def __str__(self):
        return self.full_address
