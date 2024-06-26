# Generated by Django 2.0.5 on 2018-05-30 15:48

from django.db import migrations, models
import django.db.models.manager


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0003_product_image'),
    ]

    operations = [
        migrations.AlterModelManagers(
            name='product',
            managers=[
                ('all_objects', django.db.models.manager.Manager()),
            ],
        ),
        migrations.AddField(
            model_name='product',
            name='is_datascan_import',
            field=models.BooleanField(default=False),
        ),
    ]
