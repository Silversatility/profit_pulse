# Generated by Django 2.0.5 on 2019-12-18 06:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_auto_20191218_0052'),
    ]

    operations = [
        migrations.AlterField(
            model_name='forgotpasswordtoken',
            name='token',
            field=models.CharField(max_length=8),
        ),
    ]
