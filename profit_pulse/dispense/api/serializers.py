# -*- coding: utf-8 -*-

from django.db.models import Q
from drf_haystack.serializers import HaystackSerializerMixin
from rest_framework import serializers

from ..models import DispenseHistory, FeeStructure
from ..search_indexes import DispenseHistoryIndex
from profit_pulse.profiles.api.serializers import (
    PhysicianSerializer,
    CustomerSerializer,
)
from profit_pulse.products.api.serializers import ProductSerializer


class FeeStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeStructure
        fields = [
            'id',
            'customer',
            'start_date',
            'end_date',
            'monthly_fee',
            'billing_percentage',
            'switching_fee',
        ]

    def validate(self, data):
        customer = data['customer']
        start_date = data['start_date']
        end_date = data.get('end_date')
        queryset = FeeStructure.objects.filter(customer=customer)
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)
        if not end_date:
            if queryset.filter(end_date__isnull=True).exists():
                raise serializers.ValidationError('There should only be one Fee Structure without an end date')
            if queryset.filter(end_date__gte=start_date).exists():
                raise serializers.ValidationError('Selected date overlaps with another Fee Structure')

        if end_date:
            # if not queryset.filter(end_date__isnull=True).exists():
            #     raise serializers.ValidationError('There should be a Fee Structure without an end date')
            if queryset.filter(
                Q(start_date__lte=start_date, end_date__gte=start_date) |
                Q(start_date__lte=end_date, end_date__gte=end_date) |
                Q(start_date__lte=end_date, end_date__isnull=True)
            ).exists():
                raise serializers.ValidationError('Selected date overlaps with another Fee Structure')

        return data


class DispenseHistorySerializer(serializers.ModelSerializer):
    """
    Serializer to be used by :model:`products.DispenseHistory`
    """
    product = ProductSerializer()
    customer = CustomerSerializer()
    physician = PhysicianSerializer()

    class Meta:
        model = DispenseHistory
        fields = (
            'id',
            'product',
            'customer',
            'physician',
            'trans_amount_paid',
            'insurance_paid',
            'total_paid',
            'cost',
            'profit',
            'margin',
            'quantity',
            'rx_number',
            'order_date',
            'written_date',
            'created',
            'modified',
        )
        read_only_fields = (
            'id',
            'created',
            'modified',
        )


class DispenseHistorySearchSerializer(HaystackSerializerMixin,
                                      DispenseHistorySerializer):
    """
    Serializer to be used by the results returned by search
    for dispense histories.
    """
    class Meta(DispenseHistorySerializer.Meta):
        index_classes = [DispenseHistoryIndex]
        search_fields = ('text', )
