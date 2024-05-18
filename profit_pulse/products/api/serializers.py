# -*- coding: utf-8 -*-

from django.contrib.humanize.templatetags.humanize import intcomma
from django.template.defaultfilters import floatformat
from rest_framework import serializers

from ..models import Product
from ..search_indexes import ProductIndex


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer to be used by :model:`products.Product`
    """

    dispense_history_count = serializers.IntegerField(default=0, read_only=True)
    rank = serializers.IntegerField(default=0, read_only=True)
    performance_percentage = serializers.FloatField(default=0, read_only=True)
    average_margin = serializers.FloatField(default=0, read_only=True)
    total_quantity = serializers.IntegerField(default=0, read_only=True)
    cost_min = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id',
            'title',
            'description',
            'image',
            'size',
            'ndc',
            'awp',
            'dispense_history_count',
            'rank',
            'performance_percentage',
            'average_margin',
            'total_quantity',
            'cost_min',
            'is_active',
            'is_removed',
            'created',
            'modified',
        )
        read_only_fields = (
            'id',
            'is_removed',
            'created',
            'modified',
        )

    def get_cost_min(self, obj):
        try:
            return '$' + intcomma(floatformat(obj.cost_min, 2))
        except AttributeError:
            return ''


class ProductSearchSerializer(ProductSerializer):
    """
    Serializer to be used by the results returned by search
    for products.
    """
    class Meta(ProductSerializer.Meta):
        index_classes = [ProductIndex]
        search_fields = ('text', 'title', 'ndc')
