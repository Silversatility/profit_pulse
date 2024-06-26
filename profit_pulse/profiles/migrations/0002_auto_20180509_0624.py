# Generated by Django 2.0.5 on 2018-05-09 06:24

import profit_pulse.profiles.mixins
import django.core.validators
from django.db import migrations, models
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='enrollment_contract',
            field=models.FileField(blank=True, null=True, upload_to=profit_pulse.core.mixins.get_upload_path),
        ),
        migrations.AddField(
            model_name='customer',
            name='num_locations',
            field=models.PositiveIntegerField(default=1, validators=[django.core.validators.MaxValueValidator(25), django.core.validators.MinValueValidator(1)], verbose_name='number of locations'),
        ),
        migrations.AddField(
            model_name='customer',
            name='num_physicians',
            field=models.PositiveIntegerField(default=1, validators=[django.core.validators.MaxValueValidator(25), django.core.validators.MinValueValidator(1)], verbose_name='number of physicians'),
        ),
        migrations.AddField(
            model_name='customer',
            name='status',
            field=model_utils.fields.StatusField(choices=[(0, 'dummy')], default='pending', max_length=100, no_check_for_status=True, verbose_name='status'),
        ),
        migrations.AddField(
            model_name='customer',
            name='status_changed',
            field=model_utils.fields.MonitorField(default=django.utils.timezone.now, monitor='status', verbose_name='status changed'),
        ),
    ]
