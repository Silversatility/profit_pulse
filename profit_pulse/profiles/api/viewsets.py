import re


from django.utils.translation import ugettext_lazy as _
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django_filters import rest_framework as filters
from drf_haystack.viewsets import HaystackViewSet
from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.serializers import ValidationError
from ..mailer import ProfilesMailer
from ..models import (
    Customer,
    Manager,
    Physician,
    SalesRepresentative,
    SupportingDocument,
)
from .serializers import (
    CustomerSerializer,
    CustomerSearchSerializer,
    CustomerAdminSerializer,
    CreateManagerSerializer,
    ManagerSerializer,
    MinifiedCustomerSerializer,
    CalendarCustomerSerializer,
    PhysicianSerializer,
    SalesRepresentativeSerializer,
    SalesRepresentativeSearchSerializer,
    SupportingDocumentSerializer,
)
from profit_pulse.core.permissions import (
    AdminOrUserParentOwner,
    AdminOrManager,
    IsSalesRepresentative,
    AdminOrManagerOrSalesRepresentative,
)
from profit_pulse.core.api.filters import RelatedOrderingFilter
from profit_pulse.dispense.api.permissions import AdminOrPhysicianRelated
from profit_pulse.dispense.models import DispenseHistory


class PhysicianViewSet(mixins.RetrieveModelMixin,
                       mixins.ListModelMixin,
                       viewsets.GenericViewSet):
    """
    Viewset for :model:`profiles.Physician`
    ---
    retrieve:
        Retrieves a :model:`profiles.Physician` instance

    list:
        Returns list of all :model:`profiles.Physician` objects
    """
    queryset = Physician.objects.all()
    serializer_class = PhysicianSerializer
    permission_classes = (AdminOrPhysicianRelated, )
    filter_backends = (RelatedOrderingFilter, )
    ordering = ('created', )

    def get_queryset(self):
        customer = getattr(self.request.user, 'customer', None)
        representative = getattr(self.request.user,
                                 'sales_representative',
                                 None)
        if self.request.user.is_admin:
            return super(PhysicianViewSet, self).get_queryset()
        elif self.request.user.is_customer:
            ids = customer.dispense_histories.values_list('physician',
                                                          flat=True).distinct()
            return Physician.objects.filter(id__in=ids)
        elif self.request.user.is_sales_representative:
            histories = DispenseHistory.objects.filter(
                customer__sales_representative=representative
            )
            ids = histories.values_list('physician', flat=True).distinct()
            return Physician.objects.filter(id__in=ids)


class CustomerFilter(filters.FilterSet):
    no_children = filters.BooleanFilter(name='children', lookup_expr='isnull')

    class Meta:
        model = Customer
        fields = ('parent', 'no_children')


class CustomerViewSet(viewsets.ModelViewSet):
    """
    Viewset for :model:`profiles.Customer`
    ---
    create:
        Creates :model:`profiles.Customer` object

    update:
        Updates :model:`profiles.Customer` object

    partial_update:
        Updates one or more fields of an existing customer object

    retrieve:
        Retrieves a :model:`profiles.Customer` instance

    list:
        Returns list of all :model:`profiles.Customer` objects

    delete:
        soft deletes a :model:`profiles.Customer` instance.
    """
    queryset = Customer.objects.filter(user__is_removed=False)
    serializer_class = CustomerSerializer
    permission_classes = (AdminOrUserParentOwner, )
    filter_class = CustomerFilter
    filter_backends = (filters.DjangoFilterBackend, RelatedOrderingFilter)
    ordering = ('enrollment_date', )

    def get_queryset(self):
        if self.request.user.is_admin:
            if self.request.user.manager.credentialing_only:
                return self.request.user.manager.customers.filter(user__is_removed=False)
            else:
                return super(CustomerViewSet, self).get_queryset()
        elif self.request.user.is_customer:
            return Customer.objects.filter(user=self.request.user)
        elif self.request.user.is_sales_representative:
            return self.request.user.sales_representative.customers.filter(user__is_removed=False)

    def perform_create(self, serializer):
        obj = serializer.save()
        if obj.portal_access:
            mailer = ProfilesMailer()
            mailer.send_portal_access_credentials(obj)

    def perform_destroy(self, instance):
        instance.user.is_active = False
        instance.user.save()
        instance.delete()

    @action(detail=False, url_path='current-user')
    def current_user(self, request, *args, **kwargs):
        """
        Returns user with customer.
        """
        customer_id = request.query_params.get('customer')
        try:
            if customer_id:
                instance = self.get_queryset().get(user_id=customer_id)
            else:
                instance = request.user.customer
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except ObjectDoesNotExist:
            return Response(False)

    @action(detail=False, url_path='check-user')
    def check_user(self, request, *args, **kwargs):
        """
        Returns if user is also the customer.
        """
        customer_id = request.query_params.get('customer')

        if customer_id and request.user.is_customer:
            if str(customer_id) == str(request.user.customer.user_id):
                instance = self.get_queryset().get(user_id=customer_id)
                serializer = self.get_serializer(instance)
                return Response(serializer.data)
            else:
                raise ValidationError(
                    _("You can't access this page."),
                )
        return Response()

    @action(detail=False)
    def minified(self, request, *args, **kwargs):
        """
        Returns a list of customers with just the ID and business name.
        """
        queryset = self.get_queryset().order_by('business_name')
        serializer = MinifiedCustomerSerializer(queryset, many=True)
        return Response(data=serializer.data)

    @action(detail=False)
    def calendar(self, request, *args, **kwargs):
        """
        Returns a list of customers with just ID, name, software install date and implementation date display.
        """
        queryset = self.get_queryset().filter(Q(active_date__isnull=False) | Q(software_install__isnull=False))
        serializer = CalendarCustomerSerializer(queryset, many=True)
        return Response(data=serializer.data)

    @action(detail=False)
    def states(self, request, *args, **kwargs):
        """
        Returns list of states available based on all the customers
        """
        queryset = self.get_queryset()
        states = list(queryset.values_list('state', flat=True).distinct())
        if '' in states:
            states.remove('')
        return Response(data=states)

    @action(detail=False, methods=['put', 'get'])
    def credentialing(self, request, *args, **kwargs):
        """
        Returns self
        """
        customer_id = request.query_params.get('customer')
        if customer_id:
            instance = self.get_queryset().get(user_id=customer_id)
        else:
            instance = request.user.customer
        if request.method == 'PUT':
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response()
        elif request.method == 'GET':
            serializer = self.get_serializer(instance)
            return Response(serializer.data)

    # @action(detail=False, url_path='credentialing-document-upload', methods=['put'])
    # def credentialing_document_upload(self, request, *args, **kwargs):
    #     customer_id = request.query_params.get('customer')
    #     if customer_id:
    #         instance = self.get_queryset().get(user_id=customer_id)
    #     else:
    #         instance = request.user.customer
    #     serializer = self.get_serializer(instance, data=request.data, partial=True)
    #     serializer.is_valid(raise_exception=True)
    #     serializer.save()
    #     return Response(serializer.data)

    @action(detail=False, url_path='credentialing-document-upload', methods=['put'])
    def credentialing_document_upload(self, request, *args, **kwargs):
        single_documents = [
            'federal_tax_id',
            'business_liability_insurance',
            'professional_liability_insurance',
            'owner_pic_drivers_license',
        ]
        customer_id = request.query_params.get('customer')
        if not customer_id:
            customer_id = request.user.id

        data = {}
        data['type'] = list(request.data.keys())[0]
        data['document'] = request.data[data['type']]
        data['customer'] = customer_id

        serializer = SupportingDocumentSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        if data['type'] in single_documents:
            # Make sure the file is valid before deleting the existing file, hence it is below is_valid
            SupportingDocument.objects.filter(customer=customer_id, type=data['type']).delete()

        serializer.save()
        return Response(serializer.data)

    @action(detail=False, url_path='merge-customer', methods=['post'])
    def merge_customer(self, request, *args, **kwargs):
        primary_id = request.data['primary']
        secondary_id = request.data['secondary']

        if primary_id == secondary_id:
            raise ValidationError(
                _("You can't merge two customers with same user ID."),
            )

        primary = get_object_or_404(Customer, user_id=primary_id)
        secondary = get_object_or_404(Customer, user_id=secondary_id)

        primary.physicians.add(*secondary.physicians.all())
        secondary.physicians.clear()

        for child in secondary.children.all():
            child.parent = primary
            child.save()

        for dispense_history in secondary.dispense_histories.all():
            dispense_history.customer = primary
            dispense_history.save()

        secondary.clinic_type = primary.clinic_type
        secondary.save()
        secondary.user.is_removed = True
        secondary.user.save()
        return Response(status=status.HTTP_200_OK)

    @action(detail=False, url_path='re-sync')
    def re_sync_data(self, request, *args, **kwargs):
        from profit_pulse.dispense.tasks import DispenseHistoryImportPeriodicTask
        try:
            DispenseHistoryImportPeriodicTask()
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_200_OK)

    @action(detail=False, serializer_class=CustomerAdminSerializer)
    def admin_list(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class SupportingDocumentViewSet(viewsets.ModelViewSet):
    queryset = SupportingDocument.objects.all()
    serializer_class = SupportingDocumentSerializer


class SalesRepresentativeViewSet(viewsets.ModelViewSet):
    """
    Viewset for :model:`profiles.SalesRepresentative`
    ---
    create:
        Creates :model:`profiles.SalesRepresentative` object

    update:
        Updates :model:`profiles.SalesRepresentative` object

    partial_update:
        Updates one or more fields of an existing sales representative object

    retrieve:
        Retrieves a :model:`profiles.SalesRepresentative` instance

    list:
        Returns list of all :model:`profiles.SalesRepresentative` objects

    delete:
        soft deletes a :model:`profiles.SalesRepresentative` instance.
    """
    queryset = SalesRepresentative.objects.filter(user__is_removed=False)
    serializer_class = SalesRepresentativeSerializer
    permission_classes = (AdminOrUserParentOwner, )
    filter_backends = (RelatedOrderingFilter, )
    ordering = ('user__created', )

    def get_queryset(self):
        if not self.request.user.is_admin:
            return SalesRepresentative.objects.filter(user=self.request.user)
        return super(SalesRepresentativeViewSet, self).get_queryset()

    def perform_create(self, serializer):
        obj = serializer.save()
        if obj.portal_access:
            mailer = ProfilesMailer()
            mailer.send_portal_access_credentials(obj)

    @action(detail=False, permission_classes=(IsSalesRepresentative,))
    def me(self, request):
        return Response(SalesRepresentativeSerializer(self.request.user.sales_representative).data)

    @action(detail=True, url_path='customers')
    def customers(self, request, pk):
        """
        return a list of customers related to the given sales representative.
        """
        obj = self.get_object()
        queryset = obj.customers.all()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CustomerSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = CustomerSerializer(queryset, many=True)

        return Response(data=serializer.data)


class ManagerViewSet(viewsets.ModelViewSet):
    """
    Viewset for :model:`profiles.Manager`
    ---
    create:
        Creates :model:`profiles.Manager` object

        Sample user parameters:
            {
                "email": "test@email.com",
                "password1": "testerpassword123",
                "password2": "testerpassword123",
                "first_name": "First Name",
                "last_name": "Last Name",
                "is_owner": true
            }

    update:
        Updates :model:`profiles.Manager` object

    partial_update:
        Updates one or more fields of an existing manager object

    retrieve:
        Retrieves a :model:`profiles.Manager` instance

    list:
        Returns list of all :model:`profiles.Manager` objects

    delete:
        soft deletes a :model:`profiles.Manager` instance.
    """
    queryset = Manager.objects.filter(user__is_removed=False)
    serializer_class = ManagerSerializer
    permission_classes = (AdminOrManager,)
    filter_backends = (filters.DjangoFilterBackend, RelatedOrderingFilter,)
    filter_fields = ('credentialing_only',)
    ordering = ('created',)

    def perform_create(self, serializer):
        obj = serializer.save()
        if obj.portal_access:
            mailer = ProfilesMailer()
            mailer.send_portal_access_credentials(obj)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CreateManagerSerializer
        return super(ManagerViewSet, self).get_serializer_class()


class CustomerSearchViewSet(HaystackViewSet):
    """
    Handles search feature for customers.
    """
    index_models = [Customer]
    permission_classes = (AdminOrManagerOrSalesRepresentative, )
    serializer_class = CustomerSearchSerializer

    def list(self, request, *args, **kwargs):
        # TODO: Add permanent fix for this using HayStack
        queryset = self.filter_queryset(self.get_queryset())
        customer_pks = queryset.values_list('pk', flat=True)
        queryset = Customer.objects.filter(user__in=customer_pks)
        if self.request.user.is_sales_representative:
            queryset = queryset.filter(sales_representative=self.request.user.sales_representative)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class SalesRepresentativeSearchViewSet(HaystackViewSet):
    """
    Handles search feature for sales representatives.
    """
    index_models = [SalesRepresentative]
    permission_classes = (AdminOrManager, )
    serializer_class = SalesRepresentativeSearchSerializer
