from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin
from .models import DispenseReport, DispenseHistory, FeeStructure


class DispenseReportAdmin(admin.ModelAdmin):
    """
    Admin view for :model:`dispense.DispenseReport`
    """
    model = DispenseReport
    list_display = [
        'report_url',
        'status',
        'created',
        'modified'
    ]

    def has_add_permission(self, request):
        """
        Disable add since we will be using the script to populate
        this model
        """
        return False


class DispenseHistoryAdmin(SimpleHistoryAdmin, admin.ModelAdmin):
    """
    Admin view for :model:`dispense.DispenseHistory`
    """
    model = DispenseHistory
    list_display = [
        'physician',
        'customer',
        'insurance_paid',
        'total_paid',
        'cost',
        'order_date',
        'created',
        'modified',
    ]
    history_list_display = [
        'product',
        'physician',
        'customer',
        'insurance_paid',
        'total_paid',
        'cost',
        'quantity',
        'rx_number',
        'rf_number',
        'order_date',
        'created',
        'modified',
    ]

    def has_add_permission(self, request):
        """
        Disable add since we will be using the script to populate
        this model
        """
        return False


class FeeStructureAdmin(admin.ModelAdmin):
    model = FeeStructure


admin.site.register(DispenseReport, DispenseReportAdmin)
admin.site.register(DispenseHistory, DispenseHistoryAdmin)
admin.site.register(FeeStructure, FeeStructureAdmin)
