# Generated by Django 2.0.5 on 2019-03-04 01:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0020_customer_credentialing_stage'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customer',
            name='articles_of_incorporation',
        ),
        migrations.RemoveField(
            model_name='customer',
            name='dea_license',
        ),
        migrations.RemoveField(
            model_name='customer',
            name='facility_liability_insurance',
        ),
        migrations.RemoveField(
            model_name='customer',
            name='facility_medicare',
        ),
        migrations.RemoveField(
            model_name='customer',
            name='facility_npi',
        ),
        migrations.RemoveField(
            model_name='customer',
            name='home_address',
        ),
        migrations.RemoveField(
            model_name='customer',
            name='irs_tax_documentation',
        ),
        migrations.RemoveField(
            model_name='customer',
            name='npi_number',
        ),
        migrations.RemoveField(
            model_name='customer',
            name='practice_w9',
        ),
        migrations.RemoveField(
            model_name='customer',
            name='state_license_verification',
        ),
        migrations.RemoveField(
            model_name='customer',
            name='state_medical_license',
        ),
    ]