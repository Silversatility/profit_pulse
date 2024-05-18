from rest_framework import permissions

from profit_pulse.dispense.models import DispenseHistory


class AdminOrCustomerOwner(permissions.IsAuthenticated):
    """
    Object level check if customer related object is equivalent
    to the logged in user
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True

        customer = getattr(request.user, 'customer', None)
        representative = getattr(request.user, 'sales_representative', None)
        if customer:
            return obj.customer == customer
        elif representative:
            return obj.customer in representative.customers.all()

        return False


class AdminOrPhysicianRelated(permissions.IsAuthenticated):
    """
    Checks whether the logged in user(customer or representative) has
    a corresponding physician record in the :model:`dispense.DispenseHistory`
    model.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True

        customer = getattr(request.user, 'customer', None)
        representative = getattr(request.user, 'sales_representative', None)
        if customer:
            related_customers = obj.dispense_histories.values_list('customer',
                                                                   flat=True)
            return customer.user.id in related_customers
        elif representative:
            representative_histories = DispenseHistory.objects.filter(
                customer__sales_representative=representative
            )
            related_phyisicians = representative_histories.values_list(
                'physician',
                flat=True
                ).distinct()
            return obj.id in related_phyisicians

        return False


class AdminOrProductRelated(permissions.IsAuthenticated):
    """
    Checks whether the logged in user(customer or representative) has
    a corresponding product record in the :model:`dispense.DispenseHistory`
    model.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True

        customer = getattr(request.user, 'customer', None)
        if customer:
            related_customers = obj.dispense_histories.values_list('customer',
                                                                   flat=True)
            return customer.user.id in related_customers

        # TODO: Add sales representative when the frontend is ready

        return False
