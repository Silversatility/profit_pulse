# Generated by Django 2.0.5 on 2019-11-27 06:47

import profit_pulse.core.mixins
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0031_auto_20191125_0101'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='professional_liability_insurance',
            field=models.FileField(blank=True, null=True, upload_to=profit_pulse.core.mixins.get_upload_path),
        ),
    ]