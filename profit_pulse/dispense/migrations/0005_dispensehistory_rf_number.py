# Generated by Django 2.0.5 on 2019-10-21 04:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dispense', '0004_dispensehistory_extra'),
    ]

    operations = [
        migrations.AddField(
            model_name='dispensehistory',
            name='rf_number',
            field=models.CharField(default='', max_length=128),
            preserve_default=False,
        ),
    ]
