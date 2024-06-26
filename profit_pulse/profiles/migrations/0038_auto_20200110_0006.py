# Generated by Django 2.0.5 on 2020-01-10 05:06

from django.db import migrations


def migrate_to_supporting_documents(apps, schema_editor):
    # We can't import the model directly as it may be a newer
    # version than this migration expects. We use the historical version.
    Customer = apps.get_model('profiles', 'Customer')
    for customer in Customer.objects.all():
        if customer.medical_clinic_license:
            customer.documents.create(type='medical_clinic_license', document=customer.medical_clinic_license)

        if customer.pic_dea_license:
            customer.documents.create(type='pic_dea_license', document=customer.pic_dea_license)

        if customer.federal_tax_id:
            customer.documents.create(type='federal_tax_id', document=customer.federal_tax_id)

        if customer.business_liability_insurance:
            customer.documents.create(type='business_liability_insurance', document=customer.business_liability_insurance)

        if customer.owner_pic_drivers_license:
            customer.documents.create(type='owner_pic_drivers_license', document=customer.owner_pic_drivers_license)

        if customer.articles_of_incorporation:
            customer.documents.create(type='articles_of_incorporation', document=customer.articles_of_incorporation)

        if customer.professional_liability_insurance:
            customer.documents.create(type='professional_liability_insurance', document=customer.professional_liability_insurance)


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0037_supportingdocument'),
    ]

    operations = [
        migrations.RunPython(migrate_to_supporting_documents),
    ]
