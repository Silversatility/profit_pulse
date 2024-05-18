# Generated by Django 2.0.5 on 2020-01-28 14:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0044_auto_20200117_0247'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='documents_received_color',
            field=models.CharField(choices=[('', ''), ('red', 'RED'), ('green', 'GREEN'), ('orange', 'ORANGE')], max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='software_and_supplies',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='software_and_supplies_color',
            field=models.CharField(choices=[('', ''), ('red', 'RED'), ('green', 'GREEN'), ('orange', 'ORANGE')], max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='software_and_supplies_note',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.RenameField(
            model_name='customer',
            old_name='yn_e_prescribe',
            new_name='yn_e_prescribe_vendor',
        ),
        migrations.AddField(
            model_name='customer',
            name='yn_e_prescribe',
            field=models.BooleanField(default=False),
        ),
    ]
