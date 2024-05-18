from rest_framework import serializers

from ..models import SwitchingFee, SwitchingReport

from profit_pulse.profiles.api.serializers import CustomerSerializer


class SwitchingReportSerializer(serializers.ModelSerializer):

    class Meta:
        model = SwitchingReport
        fields = ('__all__')


class SwitchingFeeSerializer(serializers.ModelSerializer):
    report = SwitchingReportSerializer(read_only=True)
    customer = CustomerSerializer(read_only=True)
    charges = serializers.CharField(source='switching_charges', read_only=True)

    class Meta:
        model = SwitchingFee
        fields = ('__all__')
