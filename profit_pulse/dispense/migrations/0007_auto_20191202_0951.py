# Generated by Django 2.0.5 on 2019-12-02 14:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dispense', '0006_feestructure'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='feestructure',
            options={'ordering': ['start_date']},
        ),
    ]