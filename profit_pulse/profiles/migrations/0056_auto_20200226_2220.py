# Generated by Django 2.0.5 on 2020-02-27 03:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0055_remove_customer_priority_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customer',
            name='caremark_color',
            field=models.CharField(choices=[('', ''), ('red', 'RED'), ('green', 'GREEN'), ('orange', 'ORANGE'), ('blue', 'BLUE')], max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='documents_received_color',
            field=models.CharField(choices=[('', ''), ('red', 'RED'), ('green', 'GREEN'), ('orange', 'ORANGE'), ('blue', 'BLUE')], max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='express_scripts_color',
            field=models.CharField(choices=[('', ''), ('red', 'RED'), ('green', 'GREEN'), ('orange', 'ORANGE'), ('blue', 'BLUE')], max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='humana_color',
            field=models.CharField(choices=[('', ''), ('red', 'RED'), ('green', 'GREEN'), ('orange', 'ORANGE'), ('blue', 'BLUE')], max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='ncpdp_number_color',
            field=models.CharField(choices=[('', ''), ('red', 'RED'), ('green', 'GREEN'), ('orange', 'ORANGE'), ('blue', 'BLUE')], max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='optum_color',
            field=models.CharField(choices=[('', ''), ('red', 'RED'), ('green', 'GREEN'), ('orange', 'ORANGE'), ('blue', 'BLUE')], max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='organization_npi_color',
            field=models.CharField(choices=[('', ''), ('red', 'RED'), ('green', 'GREEN'), ('orange', 'ORANGE'), ('blue', 'BLUE')], max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='psao_color',
            field=models.CharField(choices=[('', ''), ('red', 'RED'), ('green', 'GREEN'), ('orange', 'ORANGE'), ('blue', 'BLUE')], max_length=10, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='software_and_supplies_color',
            field=models.CharField(choices=[('', ''), ('red', 'RED'), ('green', 'GREEN'), ('orange', 'ORANGE'), ('blue', 'BLUE')], max_length=10, null=True),
        ),
    ]
