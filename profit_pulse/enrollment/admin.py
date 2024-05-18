from django.contrib import admin

from .models import CustomerContract


class CustomerContractAdmin(admin.ModelAdmin):
    """
    Admin view for :model:`enrollment.CustomerContract`
    """
    model = CustomerContract
    list_display = ['filename', 'is_active']


admin.site.register(CustomerContract, CustomerContractAdmin)
