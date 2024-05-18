# -*- coding: utf-8 -*-

import os
import re
from pathlib import Path

from datetime import datetime
from dateutil.relativedelta import relativedelta
from decimal import Decimal
from drf_haystack.serializers import HaystackSerializerMixin
from rest_framework import serializers

import pytz
from wand.image import Image
from wand.resource import limits
from django.core.files.base import ContentFile
from django.contrib.humanize.templatetags.humanize import intcomma
from django.db.models import Count, Sum, Q
from django.shortcuts import get_object_or_404
from django.template.defaultfilters import floatformat
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _

from .mixins import UserChildMixin
from ..mailer import ProfilesMailer
from ..mixins import new_get_maintenance_fees
from ..models import (
    Manager,
    Physician,
    Customer,
    SalesRepresentative,
    SupportingDocument,
)
from ..search_indexes import CustomerIndex, SalesRepresentativeIndex
from profit_pulse.dispense.models import DispenseHistory
from profit_pulse.dispense.utils import (
    calculate_percentage,
    calculate_profit,
    get_duration_queryset,
)
from profit_pulse.profiles.utils import (
    get_software_fee,
    get_switching_charges,
    get_transaction_fee,
)
from profit_pulse.users.api.serializers import (
    CreateUserSerializer,
    CreateUserWithPasswordSerializer,
)
from profit_pulse.users.models import User


class PhysicianSerializer(serializers.ModelSerializer):
    """
    Serializer to be used by :model:`profiles.Physician`
    """
    profit = serializers.SerializerMethodField()
    dispense_history_count = serializers.SerializerMethodField()

    class Meta:
        model = Physician
        fields = (
            'id',
            'first_name',
            'last_name',
            'dispense_history_count',
            'profit',
            'created',
            'modified',
        )
        read_only_fields = (
            'id',
            'created',
            'modified',
        )

    def get_dispense_history_count(self, obj):
        return obj.dispense_histories.filter(total_paid__gt=0, quantity__gt=0).count()

    def get_profit(self, obj):
        request = self.context.get('request')

        if 'sdate' in request.query_params and 'edate' in request.query_params:
            start_date = request.query_params.get('sdate', None)
            if start_date:
                start_date = datetime.strptime(start_date, '%Y-%m-%d')
                start_date = pytz.utc.localize(start_date).date()
            end_date = request.query_params.get('edate', None)
            if end_date:
                end_date = datetime.strptime(end_date, '%Y-%m-%d')
                end_date = pytz.utc.localize(end_date).date()
        else:
            duration = request.query_params.get('duration')
            today = timezone.now().date()
            start_date = today
            end_date = today
            if duration == 'last_3_years':
                start_date = today.replace(year=today.year - 2, month=1, day=1)
                end_date = today.replace(
                    year=today.year + 1, month=1, day=1) - relativedelta(days=1)
            elif duration == 'last_year_to_date':
                start_date = today.replace(year=today.year - 1, month=1, day=1)
                end_date = today.replace(
                    month=1, day=1) - relativedelta(days=1)
            elif duration == 'year_to_date':
                start_date = today.replace(month=1, day=1)
                end_date = today.replace(
                    day=1) - relativedelta(days=1) + relativedelta(months=1)
            elif duration == 'last_month':
                start_date = today.replace(day=1) - relativedelta(months=1)
                end_date = today.replace(day=1) - relativedelta(days=1)
            elif duration == 'this_month':
                start_date = today.replace(day=1)
                end_date = start_date + \
                    relativedelta(months=1) - relativedelta(days=1)
            elif duration == 'this_week':
                start_date = today - relativedelta(days=today.weekday())
            elif duration == 'yesterday':
                start_date = today - relativedelta(days=1)
            elif duration == 'today':
                start_date = today
        return obj.get_profit_by_date_range(start_date, end_date)


class SupportingDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportingDocument
        fields = '__all__'

    def save(self):
        supporting_document = super().save()
        supporting_document.generate_preview()
        return supporting_document


class CustomerAdminSerializer(UserChildMixin, serializers.ModelSerializer):
    """
    Serializer to be used by :model:`profiles.Customer`
    """
    user = CreateUserWithPasswordSerializer()
    dispense_history_count = serializers.SerializerMethodField()
    parent_display = serializers.CharField(source='parent', read_only=True)
    parent_user_id = serializers.IntegerField(
        source='parent.user.id', read_only=True)

    class Meta:
        model = Customer
        fields = (
            'user_id',
            'business_name',
            'clinic_type',
            'user',
            'sales_representative',
            'credentialing_user',
            'portal_access',
            'phone_number',
            'street_address',
            'city',
            'state',
            'zip_code',
            'num_locations',
            'num_physicians',
            'company_goal',
            'overhead',
            'commissions_owed',
            'status',
            'enrollment_contract',
            'dispense_history_count',
            'profit',
            'enrollment_date',
            'monthly_fee',
            'monthly_fee_start_date',
            'enrollment_fee',
            'billing_percentage',
            'switching_fee',
            'active',
            'active_date',
            'software_install',
            'parent',
            'parent_display',
            'parent_user_id',
            'notes',
            'office_manager_email',
            'office_manager_first_name',
            'office_manager_last_name',
        )

    def get_dispense_history_count(self, obj):
        return obj.dispense_histories.filter(total_paid__gt=0, quantity__gt=0).count()


class CustomerSerializer(UserChildMixin, serializers.ModelSerializer):
    """
    Serializer to be used by :model:`profiles.Customer`
    """
    user = CreateUserWithPasswordSerializer()
    dispense_history_count = serializers.SerializerMethodField()
    parent_display = serializers.CharField(source='parent', read_only=True)
    parent_user_id = serializers.IntegerField(
        source='parent.user.id', read_only=True)

    # Supporting Documents
    medical_clinic_license = serializers.SerializerMethodField()
    pic_dea_license = serializers.SerializerMethodField()
    federal_tax_id = serializers.SerializerMethodField()
    business_liability_insurance = serializers.SerializerMethodField()
    owner_pic_drivers_license = serializers.SerializerMethodField()
    articles_of_incorporation = serializers.SerializerMethodField()
    professional_liability_insurance = serializers.SerializerMethodField()
    owners_state_issued_driver_license = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = (
            'user_id',
            'business_name',
            'clinic_type',
            'user',
            'sales_representative',
            'credentialing_user',
            'portal_access',
            'phone_number',
            'street_address',
            'city',
            'state',
            'zip_code',
            'num_locations',
            'num_physicians',
            'company_goal',
            'overhead',
            'commissions_owed',
            'status',
            'enrollment_contract',
            'dispense_history_count',
            'profit',
            'enrollment_date',
            'monthly_fee',
            'monthly_fee_start_date',
            'enrollment_fee',
            'billing_percentage',
            'switching_fee',
            'show_fees',
            'active',
            'active_date',
            'software_install',
            'parent',
            'parent_display',
            'parent_user_id',
            'notes',
            'office_manager_email',
            'office_manager_first_name',
            'office_manager_last_name',

            'practice_legal_name',
            'practice_ein_tax_id_number',
            'date_practice_was_incorporated',
            'practice_doing_business_as',
            'practice_phone_number',
            'practice_phone_number_ext',
            'practice_fax_number',
            'practice_fax_number_ext',
            'medicaid_if_applicable',
            'medicare_num',
            'practice_primary_contact',
            'primary_contact_phone',
            'primary_contact_phone_ext',
            'primary_contact_email',
            'physician_in_charge',
            'pic_date_of_birth',
            'pic_social_security',
            'pic_dea_num',
            'pic_dea_expiration',
            'pic_license_num',
            'pic_lic_exp_date',
            'pic_phone',
            'pic_phone_ext',
            'practice_office_hours',
            'on_call_24',
            'facility_type_2_npi',
            'ncpdp',
            'existing_ncpdp_type',

            'percent_medicaid',
            'percent_medicare',
            'percent_workers_comp',
            'percent_340b',
            'percent_compounds',
            'percent_dme_otc',
            'percent_diabetic_supplies',

            'practice_physical_address',
            'ppa_suite_number',
            'ppa_city',
            'ppa_state',
            'ppa_postal_code',
            'primary_owner',
            'owner_dob',
            'owner_ss_num',
            'primary_owner_percent_ownership',
            'owner_home_address',
            'oha_street_1',
            'oha_street_2',
            'oha_city',
            'oha_state',
            'other_practice_owners',
            'other_dispensing_physicians',
            'practice_description',

            'yn_license_ever_revoked',
            'yn_good_standing',
            'yn_filed_for_bankruptcy',
            'yn_staff_license_ever_revoked',
            'yn_lawsuit',
            'yn_suspended',
            'yn_public_transportation',
            'yn_walking_distance',
            'yn_e_prescribe',
            'yn_e_prescribe_vendor',
            'yn_medicare_number',
            'yn_medicaid_number',
            'yn_percent_medicare',
            'yn_percent_medicaid',

            'ins_carrier',
            'ins_policy_number',
            'ins_policy_expiration',
            'ins_agent_name',
            'ins_policy_number_2',
            'amount_per_occurence',
            'total_aggregate_amount',
            'dispensing_staff_covered',
            'medical_clinic_license',
            'pic_dea_license',
            'federal_tax_id',
            'business_liability_insurance',
            'professional_liability_insurance',
            'owner_pic_drivers_license',
            'articles_of_incorporation',
            'owners_state_issued_driver_license',

            'credentialed',
            'credentialing_stage',
            'credentialed_date',
            'ncpdp_number',
            'organization_npi',
            'express_scripts',
            'psao',
            'caremark',
            'software_and_supplies',
            'humana',
            'optum',

            'ncpdp_number_username',
            'ncpdp_number_password',
            'ncpdp_number_pin',
            'express_scripts_username',
            'express_scripts_password',
            'psao_username',
            'psao_password',

            'ncpdp_number_color',
            'organization_npi_color',
            'express_scripts_color',
            'psao_color',
            'caremark_color',
            'software_and_supplies_color',
            'humana_color',
            'optum_color',
            'documents_received_color',

            'ncpdp_number_note',
            'organization_npi_note',
            'express_scripts_note',
            'psao_note',
            'caremark_note',
            'software_and_supplies_note',
            'humana_note',
            'optum_note',
            'documents_received_note',

            'facility_liability_insurance',
            # 'articles_of_incorporation',
            'facility_medicare_and_medicaid_member_id',
            'irs_tax_documentation',
            'practice_w9',
            'facility_npi',
            'professional_liability_policy',
            'state_medical_license',
            'state_license_verification',
            'dea_license',
            'home_address',
            'npi_number',

            'years_on_location',
            'different_mailing_address',
            'name_printed_on_check',
            'owners',
            'owner_1_name',
            'owner_2_name',
            'owner_3_name',
            'owner_4_name',
            'owner_5_name',
            'owner_6_name',
            'owner_1_email',
            'owner_2_email',
            'owner_3_email',
            'owner_4_email',
            'owner_5_email',
            'owner_6_email',
            'owner_1_percent_owned',
            'owner_2_percent_owned',
            'owner_3_percent_owned',
            'owner_4_percent_owned',
            'owner_5_percent_owned',
            'owner_6_percent_owned',
            'owner_1_dob',
            'owner_2_dob',
            'owner_3_dob',
            'owner_4_dob',
            'owner_5_dob',
            'owner_6_dob',
            'owner_1_social_security_number',
            'owner_2_social_security_number',
            'owner_3_social_security_number',
            'owner_4_social_security_number',
            'owner_5_social_security_number',
            'owner_6_social_security_number',
            'owner_1_address_line_1',
            'owner_2_address_line_1',
            'owner_3_address_line_1',
            'owner_4_address_line_1',
            'owner_5_address_line_1',
            'owner_6_address_line_1',
            'owner_1_city',
            'owner_2_city',
            'owner_3_city',
            'owner_4_city',
            'owner_5_city',
            'owner_6_city',
            'owner_1_state',
            'owner_2_state',
            'owner_3_state',
            'owner_4_state',
            'owner_5_state',
            'owner_6_state',
            'owner_1_postal_code',
            'owner_2_postal_code',
            'owner_3_postal_code',
            'owner_4_postal_code',
            'owner_5_postal_code',
            'owner_6_postal_code',
            'other_physician_1',
            'other_physician_2',
            'other_physician_3',
            'other_physician_4',
            'other_physician_5',
            'other_physician_6',
            'other_physician_7',
            'other_physician_8',
            'other_physician_9',
            'other_physician_10',
            'other_physician_11',
            'other_physician_12',

            # 'profit_today',
            # 'profit_this_week',
            # 'profit_this_month',
            # 'profit_year_to_date',
            # 'profit_last_year_to_date',
            # 'profit_last_3_years',
            # 'physicians_count_today',
            # 'physicians_count_last_week',
            # 'physicians_count_last_month',
            # 'physicians_count_year_to_date',
            # 'physicians_count_last_year_to_date',
            # 'physicians_count_last_3_years',
            'created',
            'modified',
        )
        read_only_fields = (
            'created',
            'modified',
        )

    def to_representation(self, instance):
        data = super(CustomerSerializer, self).to_representation(instance)
        if instance.sales_representative:
            sales_representative = SalesRepresentativeSerializer(
                instance.sales_representative)
            data.update({'sales_representative': sales_representative.data})
        if instance.credentialing_user:
            credentialing_user = ManagerSerializer(instance.credentialing_user)
            data.update({'credentialing_user': credentialing_user.data})
        return data

    def get_dispense_history_count(self, obj):
        return obj.dispense_histories.filter(total_paid__gt=0, quantity__gt=0).count()

    def get_medical_clinic_license(self, obj):
        if not self.context.get('request'):
            return []

        queryset = obj.documents.filter(
            type=SupportingDocument.TYPES.medical_clinic_license)
        documents = []
        for instance in queryset:
            data = {
                'id': instance.id,
                'url': self.context['request'].build_absolute_uri(instance.document.url),
                'document_preview_url': self.context['request'].build_absolute_uri(
                    instance.document_preview.url) if instance.document_preview else None,
                'name': instance.document.name.split('/')[-1],
            }
            documents.append(data)
        return documents

    def get_pic_dea_license(self, obj):
        if not self.context.get('request'):
            return []

        queryset = obj.documents.filter(
            type=SupportingDocument.TYPES.pic_dea_license)
        documents = []
        for instance in queryset:
            data = {
                'id': instance.id,
                'url': self.context['request'].build_absolute_uri(instance.document.url),
                'document_preview_url': self.context['request'].build_absolute_uri(
                    instance.document_preview.url) if instance.document_preview else None,
                'name': instance.document.name.split('/')[-1],
            }
            documents.append(data)
        return documents

    def get_federal_tax_id(self, obj):
        if not self.context.get('request'):
            return []

        queryset = obj.documents.filter(
            type=SupportingDocument.TYPES.federal_tax_id)
        documents = []
        for instance in queryset:
            data = {
                'id': instance.id,
                'url': self.context['request'].build_absolute_uri(instance.document.url),
                'document_preview_url': self.context['request'].build_absolute_uri(
                    instance.document_preview.url) if instance.document_preview else None,
                'name': instance.document.name.split('/')[-1],
            }
            documents.append(data)
        return documents

    def get_business_liability_insurance(self, obj):
        if not self.context.get('request'):
            return []

        queryset = obj.documents.filter(
            type=SupportingDocument.TYPES.business_liability_insurance)
        documents = []
        for instance in queryset:
            data = {
                'id': instance.id,
                'url': self.context['request'].build_absolute_uri(instance.document.url),
                'document_preview_url': self.context['request'].build_absolute_uri(
                    instance.document_preview.url) if instance.document_preview else None,
                'name': instance.document.name.split('/')[-1],
            }
            documents.append(data)
        return documents

    def get_owner_pic_drivers_license(self, obj):
        if not self.context.get('request'):
            return []

        queryset = obj.documents.filter(
            type=SupportingDocument.TYPES.owner_pic_drivers_license)
        documents = []
        for instance in queryset:
            data = {
                'id': instance.id,
                'url': self.context['request'].build_absolute_uri(instance.document.url),
                'document_preview_url': self.context['request'].build_absolute_uri(
                    instance.document_preview.url) if instance.document_preview else None,
                'name': instance.document.name.split('/')[-1],
            }
            documents.append(data)
        return documents

    def get_articles_of_incorporation(self, obj):
        if not self.context.get('request'):
            return []

        queryset = obj.documents.filter(
            type=SupportingDocument.TYPES.articles_of_incorporation)
        documents = []
        for instance in queryset:
            data = {
                'id': instance.id,
                'url': self.context['request'].build_absolute_uri(instance.document.url),
                'document_preview_url': self.context['request'].build_absolute_uri(
                    instance.document_preview.url) if instance.document_preview else None,
                'name': instance.document.name.split('/')[-1],
            }
            documents.append(data)
        return documents

    def get_professional_liability_insurance(self, obj):
        if not self.context.get('request'):
            return []

        queryset = obj.documents.filter(
            type=SupportingDocument.TYPES.professional_liability_insurance)
        documents = []
        for instance in queryset:
            data = {
                'id': instance.id,
                'url': self.context['request'].build_absolute_uri(instance.document.url),
                'document_preview_url': self.context['request'].build_absolute_uri(
                    instance.document_preview.url) if instance.document_preview else None,
                'name': instance.document.name.split('/')[-1],
            }
            documents.append(data)
        return documents

    def get_owners_state_issued_driver_license(self, obj):
        if not self.context.get('request'):
            return []

        queryset = obj.documents.filter(
            type=SupportingDocument.TYPES.owners_state_issued_driver_license)
        documents = []
        for instance in queryset:
            data = {
                'id': instance.id,
                'url': self.context['request'].build_absolute_uri(instance.document.url),
                'document_preview_url': self.context['request'].build_absolute_uri(
                    instance.document_preview.url) if instance.document_preview else None,
                'name': instance.document.name.split('/')[-1],
            }
            documents.append(data)
        return documents

    def save(self):
        customer = super().save()
        if self.initial_data.get('new_password1'):
            if self.initial_data.get('new_password1') == self.initial_data.get('new_password2'):
                customer.user.set_password(
                    self.initial_data.get('new_password1'))
                customer.user.save()
        return customer


class MinifiedCustomerSerializer(serializers.ModelSerializer):
    """
    Serializer to be used by :model:`profiles.Customer`. This serializer
    will return basic information about the customer
    """

    class Meta:
        model = Customer
        fields = (
            'user',
            'business_name',
        )


class CalendarCustomerSerializer(serializers.ModelSerializer):
    """
    Serializer to be used by :model:`profiles.Customer`. This serializer
    will return basic information about the customer
    """

    class Meta:
        model = Customer
        fields = (
            'user',
            'business_name',
            'software_install',
            'active_date',
        )


class SalesRepresentativeSerializer(UserChildMixin,
                                    serializers.ModelSerializer):
    """
    Serializer to be used by :model:`profiles.SalesRepresentative`
    """
    user = CreateUserWithPasswordSerializer()
    customers = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = SalesRepresentative
        fields = (
            'user',
            'portal_access',
            'phone_number',
            'street_address',
            'city',
            'state',
            'zip_code',
            'company_goal',
            'overhead',
            'commissions_owed',
            # 'profit_today',
            # 'profit_this_week',
            # 'profit_this_month',
            # 'profit_year_to_date',
            # 'profit_last_year_to_date',
            # 'profit_last_3_years',
            'products_count',
            'total_revenue',
            'customers',
        )

    def save(self):
        sales_representative = super().save()

        if self.initial_data.get('new_password1'):
            if self.initial_data.get('new_password1') == self.initial_data.get('new_password2'):
                sales_representative.user.set_password(
                    self.initial_data.get('new_password1'))
                sales_representative.user.save()
        return sales_representative


class ManagerSerializer(UserChildMixin,
                        serializers.ModelSerializer):
    """
    Serializer to be used by :model:`profiles.Manager`
    """
    user = CreateUserWithPasswordSerializer()
    customer_count = serializers.SerializerMethodField()

    class Meta:
        model = Manager
        fields = (
            'user',
            'portal_access',
            'phone_number',
            'street_address',
            'city',
            'state',
            'zip_code',
            'company_goal',
            'customer_goal',
            'customer_count',
            'overhead',
            'commissions_owed',
            'credentialing_only',
        )

    def get_customer_count(self, obj):
        return intcomma(Customer.objects.all().count())


class CreateManagerSerializer(UserChildMixin,
                              serializers.ModelSerializer):
    """
    Serializer to be used for creating :model:`profiles.Manager`
    """
    user = CreateUserSerializer()
    customer_count = serializers.SerializerMethodField()

    class Meta:
        model = Manager
        fields = (
            'user',
            'portal_access',
            'phone_number',
            'street_address',
            'city',
            'state',
            'zip_code',
            'company_goal',
            'customer_goal',
            'customer_count',
            'overhead',
            'commissions_owed',
        )

    def get_customer_count(self, obj):
        return intcomma(Customer.objects.all().count())


class BasicManagerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Manager
        fields = ('credentialing_only',)


class PasswordResetSerializer(serializers.Serializer):
    """
    Serializer to be used for resetting password of manager
    """
    email = serializers.EmailField()

    def _get_model(self):
        lookup = {
            'manager': Manager,
            'customer': Customer
        }
        return lookup[self.user_type]

    def __init__(self, *args, **kwargs):
        context = kwargs.get('context')
        self.user_type = context.get('user_type')
        self.model = self._get_model()
        super(PasswordResetSerializer, self).__init__(*args, **kwargs)

    def validate_email(self, value):
        try:
            profile = self.model.objects.get(user__email=value)
        except self.model.DoesNotExist:
            msg = '{} with that email does not exist.'.format(
                self.user_type.title()
            )
            raise serializers.ValidationError(
                _(msg)
            )

        return value

    def save(self):
        email = self.validated_data['email']
        profile = self.model.objects.get(user__email=email)
        mailer = ProfilesMailer()
        mailer.send_profile_password_reset_email(profile, self.user_type)


class PhysicianOverviewSerializer(serializers.ModelSerializer):
    """
    Serializer to be used for physicians along with their
    corresponding profits through today, week, month, and year
    to date.
    """
    profit_today = serializers.SerializerMethodField()
    profit_this_week = serializers.SerializerMethodField()
    profit_this_month = serializers.SerializerMethodField()
    profit_year_to_date = serializers.SerializerMethodField()
    profit_last_year_to_date = serializers.SerializerMethodField()
    profit_last_3_years = serializers.SerializerMethodField()

    class Meta:
        model = Physician
        fields = (
            'id',
            'name',
            'profit_today',
            'profit_this_week',
            'profit_this_month',
            'profit_year_to_date',
            'profit_last_year_to_date',
            'profit_last_3_years',
        )

    def get_profit_filter_kwargs(self, duration):
        kwargs = {
            'duration': duration
        }
        user = self.context.get('request').user
        if user.is_admin:
            return kwargs
            if 'customer' in self.context.get('request').GET:
                customer = get_object_or_404(Customer, user_id=self.context.get('request').GET['customer'])
                kwargs.update({
                    'customer': customer
                })
        elif user.is_customer:
            kwargs.update({
                'customer': user.customer
            })
        elif user.is_sales_representative:
            kwargs.update({
                'representative': user.sales_representative
            })
        return kwargs

    def get_profit_today(self, obj):
        profit = obj.get_profits_by_today_overview(None, type)
        return intcomma(floatformat(profit, 2))

    def get_profit_this_week(self, obj):
        profit = obj.get_profits_by_this_week_overview()
        return intcomma(floatformat(sum(profit), 2))

    def get_profit_this_month(self, obj):
        profit = obj.get_profits_by_this_month_overview()
        return intcomma(floatformat(sum(profit), 2))

    def get_profit_year_to_date(self, obj):
        profit = obj.get_profits_by_year_to_date_overview()
        return intcomma(floatformat(sum(profit), 2))

    def get_profit_last_year_to_date(self, obj):
        profit = obj.get_profits_by_last_year_to_date_overview()
        return intcomma(floatformat(sum(profit), 2))

    def get_profit_last_3_years(self, obj):
        profit = obj.get_profits_by_last_3_years_overview()
        return intcomma(floatformat(sum(profit), 2))


class PracticeOverviewSerializer(serializers.ModelSerializer):
    """
    Serializer to be used for physicians by querying dates and
    retrieve the number of physicians along with the corresponding
    profits for that given date range.
    """
    today = serializers.SerializerMethodField()
    week = serializers.SerializerMethodField()
    month = serializers.SerializerMethodField()
    year_to_date = serializers.SerializerMethodField()
    last_year_to_date = serializers.SerializerMethodField()
    last_3_years = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'today',
            'week',
            'month',
            'year_to_date',
            'last_year_to_date',
            'last_3_years',
        )

    def _get_transactions(self, obj):
        if obj.is_admin:
            transactions = DispenseHistory.objects.filter(
                total_paid__gt=0, quantity__gt=0)
        elif obj.is_customer:
            transactions = obj.customer.dispense_histories.filter(
                total_paid__gt=0, quantity__gt=0)
        return transactions

    def _get_duration_data(self, queryset):
        physicians = queryset.values_list('physician', flat=True).distinct()
        return {
            'physicians': physicians.count(),
            'net_profit': intcomma(floatformat(calculate_profit(queryset), 2))
        }

    def get_today(self, obj):
        transactions = self._get_transactions(obj)

        queryset = get_duration_queryset('today', 'order_date', transactions)
        return self._get_duration_data(queryset)

    def get_week(self, obj):
        transactions = self._get_transactions(obj)
        queryset = get_duration_queryset(
            'this_week', 'order_date', transactions)
        return self._get_duration_data(queryset)

    def get_month(self, obj):
        transactions = self._get_transactions(obj)
        queryset = get_duration_queryset(
            'this_month', 'order_date', transactions)
        return self._get_duration_data(queryset)

    def get_year_to_date(self, obj):
        transactions = self._get_transactions(obj)
        queryset = get_duration_queryset(
            'year_to_date', 'order_date', transactions)
        return self._get_duration_data(queryset)

    def get_last_year_to_date(self, obj):
        transactions = self._get_transactions(obj)
        queryset = get_duration_queryset(
            'last_year_to_date', 'order_date', transactions)
        return self._get_duration_data(queryset)

    def get_last_3_years(self, obj):
        transactions = self._get_transactions(obj)
        queryset = get_duration_queryset(
            'last_3_years', 'order_date', transactions)
        return self._get_duration_data(queryset)


class CustomerReportSerializer(serializers.ModelSerializer):
    """
    Serializer to be used for querying the reports needed to
    be displayed in the dashboard page of customer portal
    """
    total_paid = serializers.SerializerMethodField()
    margin = serializers.SerializerMethodField()
    maintenance_fees = serializers.SerializerMethodField()
    net_profit = serializers.SerializerMethodField()
    physicians_count = serializers.SerializerMethodField()
    locations_count = serializers.SerializerMethodField()
    dispense_count = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'total_paid',
            'margin',
            'maintenance_fees',
            'net_profit',
            'physicians_count',
            'locations_count',
            'dispense_count',
            'products_count',
        )

    def get_total_paid(self, obj):
        transactions = self.context.get('transactions')
        total = transactions.aggregate(paid=Sum('total_paid'))
        total_paid = total['paid'] or Decimal('0.00')
        return intcomma(floatformat(total_paid, 2))

    def get_margin(self, obj):
        transactions = self.context.get('transactions')
        profit = calculate_profit(transactions)
        return intcomma(floatformat(profit, 2))

    def get_maintenance_fees(self, obj):
        return intcomma(floatformat(self._get_maintenance_fees(obj), 2))

    def _get_maintenance_fees(self, obj):
        transactions = self.context.get('transactions')
        duration = self.context.get('request').query_params.get('duration')
        today = timezone.now().date()
        start_date = end_date = today
        if duration == 'last_3_years':
            start_date = today.replace(year=today.year - 2, month=1, day=1)
            end_date = today.replace(
                year=today.year + 1, month=1, day=1) - relativedelta(days=1)
        elif duration == 'last_year_to_date':
            start_date = today.replace(year=today.year - 1, month=1, day=1)
            end_date = today.replace(month=1, day=1) - relativedelta(days=1)
        elif duration == 'year_to_date':
            start_date = today.replace(month=1, day=1)
            end_date = today.replace(
                day=1) - relativedelta(days=1) + relativedelta(months=1)
        elif duration == 'last_month':
            start_date = today.replace(day=1) - relativedelta(months=1)
            end_date = today.replace(day=1) - relativedelta(days=1)
        elif duration == 'this_month':
            start_date = today.replace(day=1)
            end_date = start_date + \
                relativedelta(months=1) - relativedelta(days=1)
        elif duration == 'this_week':
            start_date = today - relativedelta(days=today.weekday())
        elif duration == 'yesterday':
            start_date = today - relativedelta(days=1)
        elif duration == 'today':
            start_date = today

        if obj.is_admin:
            request = self.context.get('request')
            if 'customer' in request.GET:
                customer = get_object_or_404(
                    Customer, user_id=request.GET['customer'])
                if customer.children.exists():
                    maintenance_fees = sum(
                        new_get_maintenance_fees(start_date, end_date, transactions.filter(
                            customer=child), child, exclude_enrollment=True)
                        for child in customer.children.all()
                    )
                else:
                    maintenance_fees = new_get_maintenance_fees(start_date, end_date, transactions.filter(
                        customer=customer), customer, exclude_enrollment=True)
            else:
                # maintenance_fees = get_maintenance_fees(start_date, end_date, transactions, exclude_enrollment=True)  # BEFORE
                maintenance_fees = sum(
                    new_get_maintenance_fees(
                        start_date,
                        end_date,
                        transactions.filter(customer=child),
                        child,
                        exclude_enrollment=True,
                    )
                    # Only children and solo
                    for child in Customer.objects.filter(children__isnull=True)
                )
        elif obj.is_customer:
            customer = obj.customer
            if customer.children.exists():
                maintenance_fees = sum(
                    new_get_maintenance_fees(
                        start_date, end_date, transactions.filter(customer=child), child, exclude_enrollment=True)
                    for child in customer.children.all()
                )
            else:
                maintenance_fees = new_get_maintenance_fees(
                    start_date, end_date, transactions, customer, exclude_enrollment=True)
        return maintenance_fees

    def get_net_profit(self, obj):
        transactions = self.context.get('transactions')
        profit = calculate_profit(transactions)
        return intcomma(floatformat(profit - self._get_maintenance_fees(obj), 2))

    def get_physicians_count(self, obj):
        if obj.is_admin:
            request = self.context.get('request')
            if 'customer' in request.GET:
                customer = get_object_or_404(
                    Customer, user_id=request.GET['customer'])
                if customer.children.exists():
                    return intcomma(Physician.objects.filter(customers__parent=customer).distinct().count())
                else:
                    return intcomma(Physician.objects.filter(customers=customer).distinct().count())
            else:
                return intcomma(Physician.objects.count())
        elif obj.is_customer:
            customer = obj.customer
            if customer.children.exists():
                return intcomma(Physician.objects.filter(customers__parent=customer).distinct().count())
            else:
                return intcomma(Physician.objects.filter(customers=customer).distinct().count())

    def get_locations_count(self, obj):
        if obj.is_admin:
            request = self.context.get('request')
            if 'customer' in request.GET:
                customer = get_object_or_404(
                    Customer, user_id=request.GET['customer'])
                locations_count = customer.num_locations
            else:
                locations_count = Customer.objects.aggregate(
                    total=Sum('num_locations'))['total'] or 0
        elif obj.is_customer:
            locations_count = obj.customer.num_locations
        return intcomma(locations_count)

    def get_dispense_count(self, obj):
        transactions = self.context.get('transactions')
        return intcomma(transactions.count())

    def get_products_count(self, obj):
        transactions = self.context.get('transactions')
        products_count = transactions.aggregate(
            total=Count('product', distinct=True))['total'] or 0
        return intcomma(products_count)


class BasicAdminReportSerializer(serializers.ModelSerializer):
    total_insurance_paid = serializers.SerializerMethodField()
    total_insurance_profit = serializers.SerializerMethodField()
    enrollment_profit = serializers.SerializerMethodField()
    switching_charges = serializers.SerializerMethodField()
    monthly_maintenance_revenue = serializers.SerializerMethodField()
    monthly_maintenance_profit = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()
    total_profit = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'total_insurance_paid',
            'total_insurance_profit',
            'enrollment_profit',
            'switching_charges',
            'monthly_maintenance_revenue',
            'monthly_maintenance_profit',
            'total_revenue',
            'total_profit',
        )

    def get_total_insurance_paid(self, obj):
        total = 0
        return intcomma(floatformat(total, 2))

    def get_total_insurance_profit(self, obj):
        profit = 0
        return intcomma(floatformat(profit, 2))

    def get_enrollment_profit(self, obj):
        profit = 0
        return intcomma(floatformat(profit, 2))

    def get_switching_charges(self, obj):
        charges = 0
        return intcomma(floatformat(charges, 2))

    def get_monthly_maintenance_revenue(self, obj):
        revenue = 0
        return intcomma(floatformat(revenue, 2))

    def get_monthly_maintenance_profit(self, obj):
        profit = 0
        return intcomma(floatformat(profit, 2))

    def get_total_revenue(self, obj):
        revenue = 0
        return intcomma(floatformat(revenue, 2))

    def get_total_profit(self, obj):
        profit = 0
        return intcomma(floatformat(profit, 2))


class AdminReportSerializer(serializers.ModelSerializer):
    """
    Serializer to be used for querying the reports needed to
    be displayed in the dashboard page of admin portal
    """
    total_paid = serializers.SerializerMethodField()
    insurance_paid = serializers.SerializerMethodField()
    percentage_fees = serializers.SerializerMethodField()
    enrollment_profit = serializers.SerializerMethodField()
    switching_charges = serializers.SerializerMethodField()
    monthly_maintenance_revenue = serializers.SerializerMethodField()
    monthly_maintenance_profit = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()  # DEPRECATED
    total_profit = serializers.SerializerMethodField()
    financial = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'total_paid',
            'insurance_paid',
            'percentage_fees',
            'enrollment_profit',
            'switching_charges',
            'monthly_maintenance_revenue',
            'monthly_maintenance_profit',
            'total_revenue',
            'total_profit',
            'financial',
        )

    def _get_total_paid(self):
        total_paid = self.context.get('total_paid')
        return total_paid

    def _get_insurance_paid(self):
        insurance_paid = self.context.get('insurance_paid')
        return insurance_paid

    def _get_percentage_fees(self):
        duration = self.context.get('request').query_params.get('duration')
        today = timezone.now().astimezone(pytz.timezone('America/New_York')).date()
        end_date = today
        if duration == 'last_3_years':
            start_date = today.replace(year=today.year - 2, month=1, day=1)
            end_date = today.replace(
                year=today.year + 1, month=1, day=1) - relativedelta(days=1)
        elif duration == 'last_year_to_date':
            start_date = today.replace(year=today.year - 1, month=1, day=1)
            end_date = today.replace(month=1, day=1) - relativedelta(days=1)
        elif duration == 'year_to_date':
            start_date = today.replace(month=1, day=1)
            end_date = today.replace(
                day=1) - relativedelta(days=1) + relativedelta(months=1)
        elif duration == 'last_month':
            start_date = today.replace(day=1) - relativedelta(months=1)
            end_date = today.replace(day=1) - relativedelta(days=1)
        elif duration == 'this_month':
            start_date = today.replace(day=1)
            end_date = start_date + \
                relativedelta(months=1) - relativedelta(days=1)
        elif duration == 'last_week':
            start_date = today - relativedelta(days=end_date.weekday(), weeks=1)
        elif duration == 'this_week':
            start_date = today - relativedelta(days=today.weekday())
        elif duration == 'yesterday':
            start_date = today - relativedelta(days=1)
        elif duration == 'today':
            start_date = today

        total_insurance_profit = 0
        transactions = self.context.get('transactions')
        for customer in self.context.get('customers'):
            total_insurance_profit += get_transaction_fee(
                customer, start_date, end_date, transactions.filter(customer=customer))
        return total_insurance_profit

    def _get_enrollment_profit(self):
        duration = self.context.get('request').query_params.get('duration')
        today = timezone.now().astimezone(pytz.timezone('America/New_York')).date()
        end_date = today
        if duration == 'last_3_years':
            start_date = today.replace(year=today.year - 2, month=1, day=1)
            end_date = today.replace(
                year=today.year + 1, month=1, day=1) - relativedelta(days=1)
        elif duration == 'last_year_to_date':
            start_date = today.replace(year=today.year - 1, month=1, day=1)
            end_date = today.replace(month=1, day=1) - relativedelta(days=1)
        elif duration == 'year_to_date':
            start_date = today.replace(month=1, day=1)
            end_date = today.replace(
                day=1) - relativedelta(days=1) + relativedelta(months=1)
        elif duration == 'last_month':
            start_date = today.replace(day=1) - relativedelta(months=1)
            end_date = today.replace(day=1) - relativedelta(days=1)
        elif duration == 'this_month':
            start_date = today.replace(day=1)
            end_date = start_date + \
                relativedelta(months=1) - relativedelta(days=1)
        elif duration == 'last_week':
            start_date = today - relativedelta(days=end_date.weekday(), weeks=1)
        elif duration == 'this_week':
            start_date = today - relativedelta(days=today.weekday())
        elif duration == 'yesterday':
            start_date = today - relativedelta(days=1)
        elif duration == 'today':
            start_date = today

        customers = self.context.get('customers')
        return customers.filter(
            enrollment_date__range=(start_date, end_date)
        ).aggregate(total=Sum('enrollment_fee'))['total'] or Decimal('0.00')

    def _get_switching_charges(self):
        duration = self.context.get('request').query_params.get('duration')
        today = timezone.now().date()
        end_date = today
        if duration == 'last_3_years':
            start_date = today.replace(year=today.year - 2, month=1, day=1)
            end_date = today.replace(
                year=today.year + 1, month=1, day=1) - relativedelta(days=1)
        elif duration == 'last_year_to_date':
            start_date = today.replace(year=today.year - 1, month=1, day=1)
            end_date = today.replace(month=1, day=1) - relativedelta(days=1)
        elif duration == 'year_to_date':
            start_date = today.replace(month=1, day=1)
            end_date = today.replace(
                day=1) - relativedelta(days=1) + relativedelta(months=1)
        elif duration == 'last_month':
            start_date = today.replace(day=1) - relativedelta(months=1)
            end_date = today.replace(day=1) - relativedelta(days=1)
        elif duration == 'this_month':
            start_date = today.replace(day=1)
            end_date = start_date + \
                relativedelta(months=1) - relativedelta(days=1)
        elif duration == 'last_week':
            start_date = today - relativedelta(days=end_date.weekday(), weeks=1)
        elif duration == 'this_week':
            start_date = today - relativedelta(days=today.weekday())
        elif duration == 'yesterday':
            start_date = today - relativedelta(days=1)
        elif duration == 'today':
            start_date = today

        switching_charges = 0
        for customer in self.context.get('customers').filter(
            Q(switching_fees__order_date__range=(start_date, end_date)) |
            Q(switching_fees__order_date__lte=end_date)
        ):
            switching_charges += get_switching_charges(
                customer, start_date, end_date, customer.switching_fees
            )
        return switching_charges

    def _get_monthly_maintenance_revenue(self):
        duration = self.context.get('request').query_params.get('duration')
        today = timezone.now().date()
        end_date = today
        if duration == 'last_3_years':
            start_date = today.replace(year=today.year - 2, month=1, day=1)
            end_date = today.replace(
                year=today.year + 1, month=1, day=1) - relativedelta(days=1)
        elif duration == 'last_year_to_date':
            start_date = today.replace(year=today.year - 1, month=1, day=1)
            end_date = today.replace(month=1, day=1) - relativedelta(days=1)
        elif duration == 'year_to_date':
            start_date = today.replace(month=1, day=1)
            end_date = today.replace(
                day=1) - relativedelta(days=1) + relativedelta(months=1)
        elif duration == 'last_month':
            start_date = today.replace(day=1) - relativedelta(months=1)
            end_date = today.replace(day=1) - relativedelta(days=1)
        elif duration == 'this_month':
            start_date = today.replace(day=1)
            end_date = start_date + \
                relativedelta(months=1) - relativedelta(days=1)
        else:  # duration in ['this_week', 'yesterday', 'today']
            return 0

        monthly_fee = 0
        for customer in self.context.get('customers').filter(monthly_fee_start_date__lte=end_date):
            monthly_fee += get_software_fee(customer, start_date, end_date)
        return monthly_fee

    def _get_monthly_maintenance_profit(self):
        return self._get_monthly_maintenance_revenue()

    def _get_total_revenue(self):
        total_paid = self._get_total_paid()
        monthly_maintenance_revenue = self._get_monthly_maintenance_revenue()
        enrollment_revenue = self._get_enrollment_profit()
        revenue = total_paid + enrollment_revenue + monthly_maintenance_revenue
        return revenue

    def _get_total_profit(self):
        percentage_fees = self._get_percentage_fees()
        monthly_maintenance_profit = self._get_monthly_maintenance_profit()
        enrollment_profit = self._get_enrollment_profit()
        profit = percentage_fees + enrollment_profit + monthly_maintenance_profit
        return profit

    def get_total_paid(self, obj):
        total_paid = self._get_total_paid()
        return intcomma(floatformat(total_paid, 2))

    def get_insurance_paid(self, obj):
        insurance_paid = self._get_insurance_paid()
        return intcomma(floatformat(insurance_paid, 2))

    def get_percentage_fees(self, obj):
        profit = self._get_percentage_fees()
        return intcomma(floatformat(profit, 2))

    def get_enrollment_profit(self, obj):
        profit = self._get_enrollment_profit()
        return intcomma(floatformat(profit, 2))

    def get_switching_charges(self, obj):
        charges = self._get_switching_charges()
        return intcomma(floatformat(charges, 2))

    def get_monthly_maintenance_revenue(self, obj):
        revenue = self._get_monthly_maintenance_revenue()
        return intcomma(floatformat(revenue, 2))

    def get_monthly_maintenance_profit(self, obj):
        profit = self._get_monthly_maintenance_profit()
        return intcomma(floatformat(profit, 2))

    def get_total_revenue(self, obj):
        revenue = self._get_total_revenue()
        return intcomma(floatformat(revenue, 2))

    def get_total_profit(self, obj):
        profit = self._get_total_profit()
        return intcomma(floatformat(profit, 2))

    def get_financial(self, obj):
        total_profit = self._get_total_profit()
        gross_profit = total_profit
        overhead = obj.manager.overhead
        total_paid = self._get_total_paid()
        commissions_owed = obj.manager.commissions_owed
        commission = (total_paid * commissions_owed) / \
            Decimal('100.00')
        net_profit = gross_profit - overhead - commission
        return {
            'gross_profit': intcomma(floatformat(gross_profit, 2)),
            'overhead': intcomma(floatformat(overhead, 2)),
            'commissions_owed': intcomma(floatformat(commission, 2)),
            'net_profit': intcomma(floatformat(net_profit, 2))
        }


class CustomerSearchSerializer(CustomerSerializer):
    """
    Serializer to be used by the results returned by search
    for customers.
    """
    class Meta(CustomerSerializer.Meta):
        index_classes = [CustomerIndex]
        search_fields = ('text',)


class SalesRepresentativeSearchSerializer(HaystackSerializerMixin,
                                          SalesRepresentativeSerializer):
    """
    Serializer to be used by the results returned by search
    for sales representatives.
    """
    class Meta(SalesRepresentativeSerializer.Meta):
        index_classes = [SalesRepresentativeIndex]
        search_fields = ('text', )


class CustomerRevenueReportSerializer(serializers.ModelSerializer):
    """
    Serializer to be used for retrieving revenue details of customers
    """
    gross_revenue = serializers.SerializerMethodField()
    transaction_fee = serializers.SerializerMethodField()
    enrollment_fee = serializers.SerializerMethodField()
    maintenance_fee = serializers.SerializerMethodField()
    switching_charges = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()
    gross_profit = serializers.SerializerMethodField()
    transaction_fee_profit = serializers.SerializerMethodField()
    maintenance_fee_profit = serializers.SerializerMethodField()
    total_profit = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = (
            'user',
            'business_name',
            'gross_revenue',
            'transaction_fee',
            'enrollment_fee',
            'maintenance_fee',
            'switching_charges',
            'total_revenue',
            'gross_profit',
            'transaction_fee_profit',
            'maintenance_fee_profit',
            'total_profit',
        )

    def _get_gross_revenue(self, obj):
        transactions = self.context.get('transactions')
        insurance_paid = transactions.filter(customer=obj).aggregate(
            total=Sum('total_paid')
        )
        total = insurance_paid['total'] or Decimal('0.00')
        return calculate_percentage(10, total)

    def _get_enrollment_fee(self, obj):
        start_date = self.context.get('start_date').date()
        end_date = self.context.get('end_date').date()
        if obj.enrollment_date and start_date <= obj.enrollment_date <= end_date:
            return obj.enrollment_fee
        return 0

    def _get_maintenance_fee(self, obj):
        start_date = self.context.get('start_date').date()
        end_date = self.context.get('end_date').date()
        return get_software_fee(obj, start_date, end_date)

    def _get_switching_charges(self, obj):
        switching_fees = self.context.get('switching_fees')
        start_date = self.context.get('start_date').date()
        end_date = self.context.get('end_date').date()
        return get_switching_charges(obj, start_date, end_date, switching_fees)

    def _get_transaction_fee(self, obj):
        transactions = self.context.get('transactions')
        start_date = self.context.get('start_date').date()
        end_date = self.context.get('end_date').date()
        return get_transaction_fee(obj, start_date, end_date, transactions.filter(customer=obj))

    def get_gross_revenue(self, obj):
        amount = self._get_gross_revenue(obj)
        return amount

    def get_transaction_fee(self, obj):
        amount = self._get_transaction_fee(obj)
        return amount

    def get_enrollment_fee(self, obj):
        amount = self._get_enrollment_fee(obj)
        return amount

    def get_maintenance_fee(self, obj):
        amount = self._get_maintenance_fee(obj)
        return amount

    def get_switching_charges(self, obj):
        amount = self._get_switching_charges(obj)
        return amount

    def get_total_revenue(self, obj):
        # gross_revenue = self._get_gross_revenue(obj)
        transaction_fee = self._get_transaction_fee(obj)
        enrollment_fee = self._get_enrollment_fee(obj)
        maintenance_fee = self._get_maintenance_fee(obj)
        switching_charges = self._get_switching_charges(obj)
        total = transaction_fee + enrollment_fee + maintenance_fee + switching_charges
        return total

    def _get_gross_profit(self, obj):
        transactions = self.context.get('transactions')
        profit = transactions.filter(customer=obj).aggregate(
            total=Sum('total_paid') - Sum('cost')
        )
        total = profit['total'] or Decimal('0.00')
        return calculate_percentage(10, total)

    def _get_maintenance_fee_profit(self, obj):
        start_date = self.context.get('start_date')
        end_date = self.context.get('end_date')
        number_of_months = (end_date.year - start_date.year) * \
            12 + (end_date.month - start_date.month) + 1
        return Decimal('95') * number_of_months

    def _get_transaction_fee_profit(self, obj):
        transactions = self.context.get('transactions')
        return transactions.filter(customer=obj).count() * Decimal('0.14')

    def get_gross_profit(self, obj):
        amount = self._get_gross_profit(obj)
        return amount

    def get_transaction_fee_profit(self, obj):
        amount = self._get_transaction_fee_profit(obj)
        return amount

    def get_maintenance_fee_profit(self, obj):
        amount = self._get_maintenance_fee_profit(obj)
        return amount

    def get_total_profit(self, obj):
        gross_profit = self._get_gross_profit(obj)
        transaction_fee_profit = self._get_transaction_fee_profit(obj)
        maintenance_fee_profit = self._get_maintenance_fee_profit(obj)
        total = gross_profit + transaction_fee_profit + maintenance_fee_profit
        return total


class SalesRepresentativeCustomerRevenueReportSerializer2(serializers.ModelSerializer):
    """
    Serializer to be used for querying the reports needed to
    be displayed in the admin portal's new Customer Reports page
    """
    margin = serializers.DecimalField(
        max_digits=20, decimal_places=2, default=0, read_only=True)

    class Meta:
        model = Customer
        fields = (
            'business_name',
            'margin',
        )


class CustomerRevenueReportSerializer2(serializers.ModelSerializer):
    """
    Serializer to be used for querying the reports needed to
    be displayed in the admin portal's new Customer Reports page
    """
    total_paid = serializers.DecimalField(
        max_digits=20, decimal_places=2, default=0, read_only=True)
    margin = serializers.DecimalField(
        max_digits=20, decimal_places=2, default=0, read_only=True)
    maintenance_fees = serializers.DecimalField(
        max_digits=20, decimal_places=2, default=0, read_only=True)
    net_profit = serializers.DecimalField(
        max_digits=20, decimal_places=2, default=0, read_only=True)

    class Meta:
        model = Customer
        fields = (
            'business_name',
            'total_paid',
            'margin',
            'maintenance_fees',
            'net_profit',
        )


class CustomerRevenuesSerializer(serializers.ModelSerializer):
    """
    Serializer to be used for retrieving revenue details of customers
    """

    class Meta:
        model = Customer
        fields = (
            'user',
            'business_name',
        )


class PhysicianProfitabilitySerializer(serializers.ModelSerializer):
    """
    Serializer to be used for retrieving profit data for each physician
    based on the given date range.
    """
    profits = serializers.SerializerMethodField()

    class Meta:
        model = Physician
        fields = (
            'id',
            'name',
            'profits',
        )

    def get_profits(self, obj):
        request = self.context.get('request')
        duration = request.query_params.get('duration', 'this_week')

        if duration == 'this_week':
            return obj.get_profits_by_last_week()
        elif duration == 'this_month':
            return obj.get_profits_by_this_month()
        elif duration == 'last_month':
            return obj.get_profits_by_last_month()
        elif duration == 'year_to_date':
            return obj.get_profits_by_year_to_date()
        elif duration == 'last_year_to_date':
            return obj.get_profits_by_last_year_to_date()
        elif duration == 'last_3_years':
            return obj.get_profits_by_last_3_years()
