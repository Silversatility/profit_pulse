from __future__ import unicode_literals

import os
import re

from django.apps import apps
from django.core.files.base import ContentFile
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.db.models import Sum
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from simple_history.models import HistoricalRecords
from wand.image import Image
from wand.resource import limits

from datetime import datetime, time
from dateutil.relativedelta import relativedelta
from decimal import Decimal
from model_utils import Choices
from model_utils.models import StatusModel, TimeStampedModel

from .mixins import ProfitMixin, PortalAccessMixin
from profit_pulse.core.mixins import get_upload_path
from profit_pulse.core.models import AbstractProfile


class Physician(ProfitMixin, TimeStampedModel, models.Model):
    """
    Stores information about a physician
    """
    customers = models.ManyToManyField(
        'Customer', related_name='physicians')
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)

    class Meta:
        verbose_name = _('Physician')
        verbose_name_plural = _('Physicians')

    def __str__(self):
        return self.name

    @property
    def name(self):
        return "{} {}".format(self.first_name, self.last_name)


class SalesRepresentative(ProfitMixin, PortalAccessMixin, AbstractProfile, models.Model):
    """
    Stores information about a physician
    """
    user = models.OneToOneField(
        'users.User',
        primary_key=True,
        related_name='sales_representative',
        on_delete=models.CASCADE
    )
    portal_access = models.BooleanField(
        default=False
    )

    class Meta:
        verbose_name = _('Sales Representative')
        verbose_name_plural = _('Sales Representatives')

    def __str__(self):
        return self.user.get_full_name()

    def get_sales(self, duration):
        now = timezone.now()
        customer_ids = self.customers.values_list('user',
                                                  flat=True).distinct()
        DispenseHistory = apps.get_model('dispense', 'DispenseHistory')
        queryset = DispenseHistory.objects.filter(total_paid__gt=0, quantity__gt=0)
        if duration == 'all':
            return queryset.filter(
                customer__in=customer_ids
            )
        elif duration == 'today':
            return queryset.filter(
                customer__in=customer_ids,
                order_date__date=now.date()
            )
        elif duration == 'last_week':
            start_date = now - relativedelta(days=7)
            end_date = datetime.combine(now.date(), time.max)
            return queryset.filter(
                customer__in=customer_ids,
                order_date__range=(start_date, end_date)
            )
        elif duration == 'last_month':
            today = now.date()
            return queryset.filter(
                customer__in=customer_ids,
                order_date__date__year=today.year,
                order_date__date__month=today.month,
            )
        elif duration == 'year_to_date':
            return queryset.filter(
                customer__in=customer_ids,
                order_date__date__year=now.date().year
            )
        elif duration == 'last_year_to_date':
            return queryset.filter(
                customer__in=customer_ids,
                order_date__date__year=now.date().year - 1
            )
        elif duration == 'last_3_years':
            return queryset.filter(
                customer__in=customer_ids,
                order_date__date__year__gte=now.date().year - 2
            )
        raise ValueError(
            _("No pre-defined queryset found for that duration.")
        )

    @property
    def products_count(self):
        sales = self.get_sales('all')
        products = sales.values_list('product',
                                     flat=True).distinct().count()
        return products

    @property
    def total_revenue(self):
        sales = self.get_sales('all')
        data = sales.aggregate(Sum('total_paid'))
        return data['total_paid__sum'] if data and 'total_paid__sum' in data \
            else Decimal('0.00')


class StatusMixin(object):
    STATUS = Choices('pending', 'complete')

class Customer(ProfitMixin,
               PortalAccessMixin,
               AbstractProfile,
               StatusModel,
               StatusMixin,
               TimeStampedModel,
               models.Model):
    """
    Stores information about a customer/clinic
    """
    CLINIC_TYPE = Choices(
        ('orthopedics', _('Orthopedics')),
        ('podiatry', _('Podiatry')),
        ('pain_management', _('Pain Management')),
        ('opthalmology', _('Ophthalmology')),
        ('dermatology', _('Dermatology')),
    )
    COLOR_TYPE = Choices(
        ('', _('')),
        ('red', _('RED')),
        ('green', _('GREEN')),
        ('orange', _('ORANGE')),
        ('blue', _('BLUE')),
        ('purple', _('PURPLE')),
    )

    history = HistoricalRecords(bases=[StatusMixin, models.Model])
    user = models.OneToOneField('users.User', primary_key=True, related_name='customer', on_delete=models.CASCADE)
    business_name = models.CharField(max_length=255)
    clinic_type = models.CharField(max_length=128, choices=CLINIC_TYPE, default=CLINIC_TYPE.orthopedics)
    sales_representative = models.ForeignKey(
        'profiles.SalesRepresentative',
        related_name='customers',
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )
    credentialing_user = models.ForeignKey(
        'profiles.Manager',
        related_name='customers',
        limit_choices_to={'credentialing_only': True},
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )
    parent = models.ForeignKey('self', blank=True, null=True, on_delete=models.CASCADE, related_name='children')
    portal_access = models.BooleanField(default=False)
    active = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    office_manager_email = models.EmailField(blank=True)
    office_manager_first_name = models.CharField(max_length=30, blank=True)
    office_manager_last_name = models.CharField(max_length=30, blank=True)

    # Application Information I
    practice_legal_name = models.CharField(max_length=100, blank=True)
    practice_ein_tax_id_number = models.CharField(max_length=100, blank=True)
    date_practice_was_incorporated = models.CharField(max_length=100, blank=True)
    practice_doing_business_as = models.CharField(max_length=100, blank=True)
    practice_phone_number = models.CharField(max_length=100, blank=True)
    practice_phone_number_ext = models.CharField(max_length=100, blank=True)
    practice_fax_number = models.CharField(max_length=100, blank=True)
    practice_fax_number_ext = models.CharField(max_length=100, blank=True)
    medicaid_if_applicable = models.CharField(max_length=100, blank=True)
    medicare_num = models.CharField(max_length=100, blank=True)
    practice_primary_contact = models.CharField(max_length=100, blank=True)
    primary_contact_phone = models.CharField(max_length=100, blank=True)
    primary_contact_phone_ext = models.CharField(max_length=100, blank=True)
    primary_contact_email = models.CharField(max_length=100, blank=True)
    physician_in_charge = models.CharField(max_length=100, blank=True)
    pic_date_of_birth = models.CharField(max_length=100, blank=True)
    pic_social_security = models.CharField(max_length=100, blank=True)
    pic_dea_num = models.CharField(max_length=100, blank=True)
    pic_dea_expiration = models.CharField(max_length=100, blank=True)
    pic_license_num = models.CharField(max_length=100, blank=True)
    pic_lic_exp_date = models.CharField(max_length=100, blank=True)
    pic_phone = models.CharField(max_length=100, blank=True)
    pic_phone_ext = models.CharField(max_length=100, blank=True)
    practice_office_hours = models.CharField(max_length=100, blank=True)
    on_call_24 = models.BooleanField(default=False)
    facility_type_2_npi = models.CharField(max_length=100, blank=True)
    ncpdp = models.CharField(max_length=100, blank=True)
    existing_ncpdp_type = models.CharField(max_length=100, blank=True)

    percent_medicaid = models.CharField(max_length=100, blank=True)
    percent_medicare = models.CharField(max_length=100, blank=True)
    percent_workers_comp = models.CharField(max_length=100, blank=True)
    percent_340b = models.CharField(max_length=100, blank=True)
    percent_compounds = models.CharField(max_length=100, blank=True)
    percent_dme_otc = models.CharField(max_length=100, blank=True)
    percent_diabetic_supplies = models.CharField(max_length=100, blank=True)

    # Application Information II
    # New fields
    years_on_location = models.CharField(max_length=100, blank=True)
    different_mailing_address = models.CharField(max_length=100, blank=True)
    name_printed_on_check = models.CharField(max_length=100, blank=True)
    owners = JSONField(blank=True, default=list)
    owner_1_name = models.CharField(max_length=100, blank=True)
    owner_2_name = models.CharField(max_length=100, blank=True)
    owner_3_name = models.CharField(max_length=100, blank=True)
    owner_4_name = models.CharField(max_length=100, blank=True)
    owner_5_name = models.CharField(max_length=100, blank=True)
    owner_6_name = models.CharField(max_length=100, blank=True)
    owner_1_email = models.CharField(max_length=100, blank=True)
    owner_2_email = models.CharField(max_length=100, blank=True)
    owner_3_email = models.CharField(max_length=100, blank=True)
    owner_4_email = models.CharField(max_length=100, blank=True)
    owner_5_email = models.CharField(max_length=100, blank=True)
    owner_6_email = models.CharField(max_length=100, blank=True)
    owner_1_percent_owned = models.CharField(max_length=100, blank=True)
    owner_2_percent_owned = models.CharField(max_length=100, blank=True)
    owner_3_percent_owned = models.CharField(max_length=100, blank=True)
    owner_4_percent_owned = models.CharField(max_length=100, blank=True)
    owner_5_percent_owned = models.CharField(max_length=100, blank=True)
    owner_6_percent_owned = models.CharField(max_length=100, blank=True)
    owner_1_dob = models.CharField(max_length=100, blank=True)
    owner_2_dob = models.CharField(max_length=100, blank=True)
    owner_3_dob = models.CharField(max_length=100, blank=True)
    owner_4_dob = models.CharField(max_length=100, blank=True)
    owner_5_dob = models.CharField(max_length=100, blank=True)
    owner_6_dob = models.CharField(max_length=100, blank=True)
    owner_1_social_security_number = models.CharField(max_length=100, blank=True)
    owner_2_social_security_number = models.CharField(max_length=100, blank=True)
    owner_3_social_security_number = models.CharField(max_length=100, blank=True)
    owner_4_social_security_number = models.CharField(max_length=100, blank=True)
    owner_5_social_security_number = models.CharField(max_length=100, blank=True)
    owner_6_social_security_number = models.CharField(max_length=100, blank=True)
    owner_1_address_line_1 = models.CharField(max_length=100, blank=True)
    owner_2_address_line_1 = models.CharField(max_length=100, blank=True)
    owner_3_address_line_1 = models.CharField(max_length=100, blank=True)
    owner_4_address_line_1 = models.CharField(max_length=100, blank=True)
    owner_5_address_line_1 = models.CharField(max_length=100, blank=True)
    owner_6_address_line_1 = models.CharField(max_length=100, blank=True)
    owner_1_city = models.CharField(max_length=100, blank=True)
    owner_2_city = models.CharField(max_length=100, blank=True)
    owner_3_city = models.CharField(max_length=100, blank=True)
    owner_4_city = models.CharField(max_length=100, blank=True)
    owner_5_city = models.CharField(max_length=100, blank=True)
    owner_6_city = models.CharField(max_length=100, blank=True)
    owner_1_state = models.CharField(max_length=100, blank=True)
    owner_2_state = models.CharField(max_length=100, blank=True)
    owner_3_state = models.CharField(max_length=100, blank=True)
    owner_4_state = models.CharField(max_length=100, blank=True)
    owner_5_state = models.CharField(max_length=100, blank=True)
    owner_6_state = models.CharField(max_length=100, blank=True)
    owner_1_postal_code = models.CharField(max_length=100, blank=True)
    owner_2_postal_code = models.CharField(max_length=100, blank=True)
    owner_3_postal_code = models.CharField(max_length=100, blank=True)
    owner_4_postal_code = models.CharField(max_length=100, blank=True)
    owner_5_postal_code = models.CharField(max_length=100, blank=True)
    owner_6_postal_code = models.CharField(max_length=100, blank=True)
    other_physician_1 = models.CharField(max_length=100, blank=True)
    other_physician_2 = models.CharField(max_length=100, blank=True)
    other_physician_3 = models.CharField(max_length=100, blank=True)
    other_physician_4 = models.CharField(max_length=100, blank=True)
    other_physician_5 = models.CharField(max_length=100, blank=True)
    other_physician_6 = models.CharField(max_length=100, blank=True)
    other_physician_7 = models.CharField(max_length=100, blank=True)
    other_physician_8 = models.CharField(max_length=100, blank=True)
    other_physician_9 = models.CharField(max_length=100, blank=True)
    other_physician_10 = models.CharField(max_length=100, blank=True)
    other_physician_11 = models.CharField(max_length=100, blank=True)
    other_physician_12 = models.CharField(max_length=100, blank=True)

    practice_physical_address = models.CharField(max_length=100, blank=True)
    ppa_suite_number = models.CharField(max_length=100, blank=True)
    ppa_city = models.CharField(max_length=100, blank=True)
    ppa_state = models.CharField(max_length=100, blank=True)
    ppa_postal_code = models.CharField(max_length=100, blank=True)
    primary_owner = models.CharField(max_length=100, blank=True)
    owner_dob = models.CharField(max_length=100, blank=True)
    owner_ss_num = models.CharField(max_length=100, blank=True)
    primary_owner_percent_ownership = models.CharField(max_length=100, blank=True)
    owner_home_address = models.CharField(max_length=100, blank=True)
    oha_street_1 = models.CharField(max_length=100, blank=True)
    oha_street_2 = models.CharField(max_length=100, blank=True)
    oha_city = models.CharField(max_length=100, blank=True)
    oha_state = models.CharField(max_length=100, blank=True)
    other_practice_owners = models.TextField(blank=True)
    other_dispensing_physicians = models.TextField(blank=True)

    # Application Information III
    practice_description = models.CharField(max_length=100, blank=True)
    yn_license_ever_revoked = models.BooleanField(default=False)
    yn_good_standing = models.BooleanField(default=False)
    yn_filed_for_bankruptcy = models.BooleanField(default=False)
    yn_staff_license_ever_revoked = models.BooleanField(default=False)
    yn_lawsuit = models.BooleanField(default=False)
    yn_suspended = models.BooleanField(default=False)
    yn_public_transportation = models.BooleanField(default=False)
    yn_walking_distance = models.BooleanField(default=False)
    yn_e_prescribe = models.BooleanField(default=False)
    yn_e_prescribe_vendor = models.TextField(blank=True)
    yn_medicare_number = models.TextField(blank=True)
    yn_medicaid_number = models.TextField(blank=True)
    yn_percent_medicare = models.TextField(blank=True)
    yn_percent_medicaid = models.TextField(blank=True)

    # Business Liability Insurance Information
    ins_carrier = models.CharField(max_length=100, blank=True)
    ins_policy_number = models.CharField(max_length=100, blank=True)
    ins_policy_expiration = models.CharField(max_length=100, blank=True)
    ins_agent_name = models.CharField(max_length=100, blank=True)
    ins_policy_number_2 = models.CharField(max_length=100, blank=True)
    amount_per_occurence = models.CharField(max_length=100, blank=True)
    total_aggregate_amount = models.CharField(max_length=100, blank=True)
    dispensing_staff_covered = models.BooleanField(default=False)

    # Supporting Documents
    medical_clinic_license = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    pic_dea_license = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    federal_tax_id = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    business_liability_insurance = models.FileField(
        upload_to=get_upload_path, blank=True, null=True
    )
    professional_liability_insurance = models.FileField(
        upload_to=get_upload_path, blank=True, null=True
    )
    owner_pic_drivers_license = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    articles_of_incorporation = models.FileField(upload_to=get_upload_path, blank=True, null=True)

    # Credentialing
    credentialed = models.BooleanField(default=False)
    credentialing_stage = models.PositiveSmallIntegerField(default=1)
    credentialed_date = models.DateField(blank=True, null=True)
    ncpdp_number = models.CharField(max_length=7, blank=True, null=True)
    organization_npi = models.CharField(max_length=25, blank=True, null=True)
    express_scripts = models.DateField(blank=True, null=True)
    psao = models.DateField(blank=True, null=True)
    caremark = models.DateField(blank=True, null=True)
    software_and_supplies = models.DateField(blank=True, null=True)
    humana = models.DateField(blank=True, null=True)
    optum = models.DateField(blank=True, null=True)
    # credentials
    ncpdp_number_username = models.CharField(max_length=128, blank=True, null=True)
    ncpdp_number_password = models.CharField(max_length=128, blank=True, null=True)
    ncpdp_number_pin = models.CharField(max_length=4, blank=True, null=True)
    express_scripts_username = models.CharField(max_length=128, blank=True, null=True)
    express_scripts_password = models.CharField(max_length=128, blank=True, null=True)
    psao_username = models.CharField(max_length=128, blank=True, null=True)
    psao_password = models.CharField(max_length=128, blank=True, null=True)
    # colors
    ncpdp_number_color = models.CharField(max_length=10, null=True, choices=COLOR_TYPE)
    organization_npi_color = models.CharField(max_length=10, null=True, choices=COLOR_TYPE)
    express_scripts_color = models.CharField(max_length=10, null=True, choices=COLOR_TYPE)
    psao_color = models.CharField(max_length=10, null=True, choices=COLOR_TYPE)
    caremark_color = models.CharField(max_length=10, null=True, choices=COLOR_TYPE)
    software_and_supplies_color = models.CharField(max_length=10, null=True, choices=COLOR_TYPE)
    humana_color = models.CharField(max_length=10, null=True, choices=COLOR_TYPE)
    optum_color = models.CharField(max_length=10, null=True, choices=COLOR_TYPE)
    documents_received_color = models.CharField(max_length=10, null=True, choices=COLOR_TYPE)
    # notes
    ncpdp_number_note = JSONField(blank=True, default=list)
    organization_npi_note = JSONField(blank=True, default=list)
    express_scripts_note = JSONField(blank=True, default=list)
    psao_note = JSONField(blank=True, default=list)
    caremark_note = JSONField(blank=True, default=list)
    software_and_supplies_note = JSONField(blank=True, default=list)
    humana_note = JSONField(blank=True, default=list)
    optum_note = JSONField(blank=True, default=list)
    documents_received_note = JSONField(blank=True, default=list)
    # files
    # -- practice documentation --
    facility_liability_insurance = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    # articles_of_incorporation = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    facility_medicare_and_medicaid_member_id = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    irs_tax_documentation = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    practice_w9 = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    facility_npi = models.CharField(max_length=255, blank=True, null=True)
    professional_liability_policy = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    # -- practitioner documentation --
    state_medical_license = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    state_license_verification = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    dea_license = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    home_address = models.CharField(max_length=255, blank=True, null=True)
    npi_number = models.CharField(max_length=255, blank=True, null=True)

    active_date = models.DateField(blank=True, null=True)
    software_install = models.DateField(blank=True, null=True)
    num_locations = models.PositiveIntegerField(
        _('number of locations'),
        default=1,
        validators=[MaxValueValidator(25), MinValueValidator(0)]
    )
    num_physicians = models.PositiveIntegerField(
        _('number of physicians'),
        default=1,
        validators=[MaxValueValidator(25), MinValueValidator(0)]
    )
    enrollment_contract = models.FileField(upload_to=get_upload_path, blank=True, null=True)
    enrollment_date = models.DateField(blank=True, null=True)
    monthly_fee = models.DecimalField(max_digits=7, decimal_places=2, default=Decimal('495'))
    monthly_fee_start_date = models.DateField(blank=True, null=True)
    enrollment_fee = models.DecimalField(max_digits=7, decimal_places=2, default=Decimal('0'))
    billing_percentage = models.DecimalField(max_digits=6, decimal_places=3, default=Decimal('10'))
    switching_fee = models.DecimalField(max_digits=7, decimal_places=2, default=Decimal('0'))
    show_fees = models.BooleanField(default=False)

    class Meta:
        verbose_name = _('Customer')
        verbose_name_plural = _('Customers')

    def __str__(self):
        return "{}".format(self.business_name)

    def get_physicians_count(self, duration):
        lookup = {
            'today': self.get_sales('today'),
            'last_week': self.get_sales('last_week'),
            'last_month': self.get_sales('last_month'),
            'year_to_date': self.get_sales('year_to_date'),
            'last_year_to_date': self.get_sales('last_year_to_date'),
        }
        if duration not in lookup:
            raise ValueError(
                _("No pre-defined queryset found for that duration.")
            )

        sales = lookup[duration]
        physicians = sales.values_list('physician',
                                       flat=True).distinct().count()
        return physicians

    @property
    def physicians_count_today(self):
        return self.get_physicians_count('today')

    @property
    def physicians_count_last_week(self):
        return self.get_physicians_count('last_week')

    @property
    def physicians_count_last_month(self):
        return self.get_physicians_count('last_month')

    @property
    def physicians_count_year_to_date(self):
        return self.get_physicians_count('year_to_date')

    @property
    def physicians_count_last_year_to_date(self):
        return self.get_physicians_count('last_year_to_date')

    def get_matching_fee_structure(self, order_date):
        for fee_structure in self.fee_structures.all():
            if fee_structure.start_date <= order_date and (
                fee_structure.end_date is None or fee_structure.end_date >= order_date
            ):
                return fee_structure
        return None


class SupportingDocument(TimeStampedModel, models.Model):
    TYPES = Choices(
        'medical_clinic_license',
        'pic_dea_license',
        'federal_tax_id',
        'business_liability_insurance',
        'owner_pic_drivers_license',
        'articles_of_incorporation',
        'professional_liability_insurance',
        'owners_state_issued_driver_license',
    )
    type = models.CharField(max_length=128, choices=TYPES)
    customer = models.ForeignKey(
        'profiles.Customer',
        related_name='documents',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    document = models.FileField(upload_to=get_upload_path, max_length=255)
    document_preview = models.ImageField(
        upload_to=get_upload_path,
        blank=True,
        null=True,
        max_length=255,
    )

    def __str__(self):
        return "{}".format(self.document.name)

    def generate_preview(self):
        if self.document:
            if self.document.name.lower().endswith('.pdf'):
                filename = self.document.name.split('/')[-1].rsplit('.', 1)[0] + '.jpg'

                # Convert pdf to image (jpg)
                limits['thread'] = 4
                limits['memory'] = 1024 * 1024 * 1024 * 8

                tries = 0
                success = False
                while not success:
                    try:
                        pdf = Image(blob=self.document.file.read(), resolution=300)
                    except Exception as e:
                        tries += 1
                        print('ERROR {}/5:'.format(tries), self.id, self.document.url, e)
                        if tries >= 5:
                            raise
                    else:
                        pdfImage = pdf.convert("jpeg")
                        img = pdfImage.sequence[0]
                        page = Image(image=img)
                        cf = ContentFile(b'')
                        page.save(file=cf)
                        self.document_preview.save(filename, cf)
                        success = True
            else:
                self.document_preview.save(self.document.name, self.document.file)



class Manager(AbstractProfile,
              TimeStampedModel,
              models.Model):
    """
    Stores information about a manager/admin
    """
    user = models.OneToOneField(
        'users.User',
        primary_key=True,
        related_name='manager',
        on_delete=models.CASCADE
    )
    portal_access = models.BooleanField(
        default=False
    )
    credentialing_only = models.BooleanField(default=False)

    class Meta:
        verbose_name = _('Manager')
        verbose_name_plural = _('Managers')

    def __str__(self):
        return "{}".format(self.user)
