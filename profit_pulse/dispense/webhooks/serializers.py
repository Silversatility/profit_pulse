from rest_framework import serializers
from ..models import DispenseReport


class DispenseReportSerializer(serializers.ModelSerializer):

    class Meta:
        model = DispenseReport
        fields = '__all__'
