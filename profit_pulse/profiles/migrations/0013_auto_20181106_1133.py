# Generated by Django 2.0.5 on 2018-11-06 16:33

from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0012_auto_20181101_2011'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customer',
            name='transaction_fee_dollar',
        ),
        migrations.RemoveField(
            model_name='customer',
            name='transaction_fee_percentage',
        ),
        migrations.AddField(
            model_name='customer',
            name='billing_percentage',
            field=models.DecimalField(decimal_places=3, default=Decimal('10'), max_digits=6),
        ),
    ]
