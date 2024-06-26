# Generated by Django 2.0.5 on 2019-06-22 19:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0028_auto_20190603_1152'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='notes',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='office_manager_email',
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name='customer',
            name='office_manager_first_name',
            field=models.CharField(blank=True, max_length=30),
        ),
        migrations.AddField(
            model_name='customer',
            name='office_manager_last_name',
            field=models.CharField(blank=True, max_length=30),
        ),
    ]
