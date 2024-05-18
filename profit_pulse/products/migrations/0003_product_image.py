# Generated by Django 2.0.5 on 2018-05-22 04:01

import profit_pulse.core.mixins
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_remove_product_photo_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to=profit_pulse.core.mixins.get_upload_path),
        ),
    ]