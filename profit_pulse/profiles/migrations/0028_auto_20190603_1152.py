# Generated by Django 2.0.5 on 2019-06-03 15:52

import profit_pulse.core.mixins
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0027_auto_20190524_0815'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='amount_per_occurence',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='business_liability_insurance',
            field=models.FileField(blank=True, null=True, upload_to=profit_pulse.core.mixins.get_upload_path),
        ),
        migrations.AddField(
            model_name='customer',
            name='date_practice_was_incorporated',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='dispensing_staff_covered',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='customer',
            name='existing_ncpdp_type',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='facility_type_2_npi',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='federal_tax_id',
            field=models.FileField(blank=True, null=True, upload_to=profit_pulse.core.mixins.get_upload_path),
        ),
        migrations.AddField(
            model_name='customer',
            name='ins_agent_name',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='ins_carrier',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='ins_policy_expiration',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='ins_policy_number',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='ins_policy_number_2',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='medicaid_if_applicable',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='medical_clinic_license',
            field=models.FileField(blank=True, null=True, upload_to=profit_pulse.core.mixins.get_upload_path),
        ),
        migrations.AddField(
            model_name='customer',
            name='medicare_num',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='ncpdp',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='oha_city',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='oha_state',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='oha_street_1',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='oha_street_2',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='on_call_24',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='customer',
            name='other_dispensing_physicians',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='other_practice_owners',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='customer',
            name='owner_dob',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='owner_home_address',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='owner_pic_drivers_license',
            field=models.FileField(blank=True, null=True, upload_to=profit_pulse.core.mixins.get_upload_path),
        ),
        migrations.AddField(
            model_name='customer',
            name='owner_ss_num',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='physician_in_charge',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='pic_date_of_birth',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='pic_dea_expiration',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='pic_dea_license',
            field=models.FileField(blank=True, null=True, upload_to=profit_pulse.core.mixins.get_upload_path),
        ),
        migrations.AddField(
            model_name='customer',
            name='pic_dea_num',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='pic_lic_exp_date',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='pic_license_num',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='pic_phone',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='pic_phone_ext',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='pic_social_security',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='ppa_city',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='ppa_postal_code',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='ppa_state',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='ppa_street_1',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='ppa_street_2',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='practice_description',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='practice_doing_business_as',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='practice_ein_tax_id_number',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='practice_fax_number',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='practice_fax_number_ext',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='practice_legal_name',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='practice_office_hours',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='practice_phone_number',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='practice_phone_number_ext',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='practice_physical_address',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='practice_primary_contact',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='primary_contact_email',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='primary_contact_phone',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='primary_contact_phone_ext',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='primary_owner',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='primary_owner_percent_ownership',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='total_aggregate_amount',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='customer',
            name='yn_filed_for_bankruptcy',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='customer',
            name='yn_good_standing',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='customer',
            name='yn_lawsuit',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='customer',
            name='yn_license_ever_revoked',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='customer',
            name='yn_staff_license_ever_revoked',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='customer',
            name='yn_suspended',
            field=models.BooleanField(default=False),
        ),
    ]