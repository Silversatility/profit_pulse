# Generated by Django 2.0.5 on 2020-02-26 14:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0053_auto_20200219_0247'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='psao_password',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='psao_username',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]