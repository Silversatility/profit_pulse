from django.contrib import admin
from reversion.admin import VersionAdmin


from .models import (
    Customer,
    Manager,
    Physician,
    SalesRepresentative,
)


class PhysicianAdmin(admin.ModelAdmin):
    """
    Admin view for :model:`profiles.Physician`
    """
    model = Physician
    list_display = ['first_name', 'last_name', 'created', 'modified']


class SalesRepresentativeAdmin(admin.ModelAdmin):
    """
    Admin view for :model:`profiles.SalesRepresentative`
    """
    model = SalesRepresentative
    list_display = ['user', 'portal_access']


class CustomerAdmin(VersionAdmin):
    """
    Admin view for :model:`profiles.Customer`
    """
    model = Customer
    list_display = [
        'business_name',
        'clinic_type',
        'sales_representative',
        'created',
        'modified',
    ]
    
    history_list_display = [field.name for field in Customer._meta.get_fields()]

class ManagerAdmin(admin.ModelAdmin):
    """
    Admin view for :model:`profiles.Manager`
    """
    model = Manager
    list_display = ['user', 'portal_access', 'credentialing_only']


admin.site.register(Physician, PhysicianAdmin)
admin.site.register(SalesRepresentative, SalesRepresentativeAdmin)
admin.site.register(Customer, CustomerAdmin)
admin.site.register(Manager, ManagerAdmin)
