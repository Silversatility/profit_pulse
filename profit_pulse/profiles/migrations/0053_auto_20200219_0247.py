# Generated by Django 2.0.5 on 2020-02-19 07:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0052_auto_20200217_2329'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='express_scripts_password',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='express_scripts_username',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='ncpdp_number_password',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='ncpdp_number_pin',
            field=models.CharField(blank=True, max_length=4, null=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='ncpdp_number_username',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]