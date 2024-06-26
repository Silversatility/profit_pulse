# Generated by Django 2.0.5 on 2018-06-28 09:03

from django.db import migrations


def split_physician_names(apps, schema_editor):
    """
    This function retrieves the name of the physician and splits
    it into first_name and last_name and save it into their respective
    fields.
    """
    Physician = apps.get_model('profiles', 'Physician')
    for physician in Physician.objects.all():
        last_name, first_name = physician.name.strip().split(',')
        physician.first_name = first_name
        physician.last_name = last_name
        physician.save()


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0007_auto_20180628_0902'),
    ]

    operations = [
        migrations.RunPython(split_physician_names)
    ]
