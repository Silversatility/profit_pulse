from django.contrib import admin

from .models import Product


class ProductAdmin(admin.ModelAdmin):
    """
    Admin view for :model:`products.Product`
    """
    model = Product
    list_display = ['title', 'size', 'is_active', 'modified']


admin.site.register(Product, ProductAdmin)
