# Generated by Django 2.0.5 on 2018-05-07 05:49

from django.db import migrations, models
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='DispenseHistory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('insurance_paid', models.DecimalField(decimal_places=2, max_digits=7)),
                ('total_paid', models.DecimalField(decimal_places=2, max_digits=7)),
                ('cost', models.DecimalField(decimal_places=2, max_digits=7)),
                ('quantity', models.PositiveIntegerField()),
                ('rx_number', models.CharField(max_length=128)),
                ('order_date', models.DateTimeField()),
            ],
            options={
                'verbose_name': 'Dispense History',
                'verbose_name_plural': 'Dispense Histories',
            },
        ),
        migrations.CreateModel(
            name='DispenseReport',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('status', model_utils.fields.StatusField(choices=[('pending', 'pending'), ('imported', 'imported'), ('parse_error', 'parse_error')], default='pending', max_length=100, no_check_for_status=True, verbose_name='status')),
                ('status_changed', model_utils.fields.MonitorField(default=django.utils.timezone.now, monitor='status', verbose_name='status changed')),
                ('report_url', models.URLField(max_length=255)),
            ],
            options={
                'verbose_name': 'Dispense Report',
                'verbose_name_plural': 'Dispense Reports',
            },
        ),
    ]