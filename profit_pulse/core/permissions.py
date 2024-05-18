from rest_framework import permissions


class AdminOrUserOwner(permissions.BasePermission):
    """
    Object level check if obj is equivalent to the logged in user
    """

    def has_permission(self, request, view):
        # Only admins can create objects
        if request.method == "POST":
            return request.user.is_authenticated and request.user.is_admin

        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return obj == request.user or request.user.is_admin


class AdminOrUserParentOwner(AdminOrUserOwner):
    """
    Customer object level check if related user object is
    equivalent to the logged in user
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user or request.user.is_admin


class AdminOrManagerOrSalesRepresentative(permissions.IsAuthenticated):
    """
    Object level check if logged in user is superuser or manager or sales representative
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_sales_representative or request.user.is_admin)


class AdminOrManager(permissions.IsAuthenticated):
    """
    Object level check if logged in user is superuser or manager
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class IsManager(permissions.BasePermission):
    """
    Check if the logged in user is a manager without credentialing_only flag
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.is_manager and not
            request.user.manager.credentialing_only
        )


class IsSalesRepresentative(permissions.BasePermission):
    """
    Check if the logged in user is a sales representative
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_sales_representative


class IsCredentialing(permissions.BasePermission):
    """
    Check if the logged in user is a manager
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_manager


class IsCustomer(permissions.BasePermission):
    """
    Check if the logged in user is a customer
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_customer
