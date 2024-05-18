# Generated by Django 2.0.5 on 2020-01-14 05:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0039_merge_20200110_1002'),
    ]

    operations = [
        migrations.AlterField(
            model_name='supportingdocument',
            name='type',
            field=models.CharField(choices=[('medical_clinic_license', 'medical_clinic_license'), ('pic_dea_license', 'pic_dea_license'), ('federal_tax_id', 'federal_tax_id'), ('business_liability_insurance', 'business_liability_insurance'), ('owner_pic_drivers_license', 'owner_pic_drivers_license'), ('articles_of_incorporation', 'articles_of_incorporation'), ('professional_liability_insurance', 'professional_liability_insurance'), ('owners_state_issued_driver_license', 'owners_state_issued_driver_license')], max_length=128),
        ),
    ]
