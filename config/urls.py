"""profit_pulse URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from rest_auth.views import PasswordChangeView, PasswordResetConfirmView
from rest_framework import routers
from rest_framework_swagger.views import get_swagger_view

from profit_pulse.users.api.viewsets import UserViewSet
from profit_pulse.core.views import download_view
from profit_pulse.users.api.views import ForgotPasswordMobile, ResetPasswordMobile
from profit_pulse.profiles.api.viewsets import (
    CustomerViewSet,
    CustomerSearchViewSet,
    ManagerViewSet,
    PhysicianViewSet,
    SalesRepresentativeViewSet,
    SalesRepresentativeSearchViewSet,
    SupportingDocumentViewSet,
)
from profit_pulse.newsfeeds.api.viewsets import (
    NewsFeedSearchViewSet,
)
from profit_pulse.products.api.viewsets import (
    ProductViewSet,
    ProductSearchViewSet,
)
from profit_pulse.dispense.api.viewsets import (
    DispenseHistoryViewSet,
    DispenseHistorySearchViewSet,
    FeeStuctureViewset,
)

from profit_pulse.newsfeeds.api.viewsets import (
    NewsFeedViewSet,
)
from profit_pulse.switching_fees.api.viewsets import (
    SwitchingFeeViewSet
)

schema_view = get_swagger_view(title='APG Labs API')

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'physicians', PhysicianViewSet)
router.register(
    'products/search',
    ProductSearchViewSet,
    base_name='product-search'
)
router.register(r'products', ProductViewSet)
router.register(
    'customers/search',
    CustomerSearchViewSet,
    base_name='customer-search'
)
router.register(r'customers', CustomerViewSet)
router.register(r'managers', ManagerViewSet)
router.register(
    'dispense-histories/search',
    DispenseHistorySearchViewSet,
    base_name='dispensehistory-search'
)
router.register(r'dispense-histories', DispenseHistoryViewSet)
router.register(
    'sales-representatives/search',
    SalesRepresentativeSearchViewSet,
    base_name='salesrepresentative-search'
)
router.register(
    'newsfeeds/search',
    NewsFeedSearchViewSet,
    base_name='newsfeeds-search'
)
router.register(r'fee-structures', FeeStuctureViewset)
router.register(r'sales-representatives', SalesRepresentativeViewSet)
router.register(r'newsfeeds', NewsFeedViewSet)
router.register(r'supporting-documents', SupportingDocumentViewSet)
router.register(r'switching-fees', SwitchingFeeViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('docs/', schema_view),

    # Make sure this is on top of routers.urls
    path('dispense-histories/', include('profit_pulse.dispense.api.urls')),
    path('enrollment/', include('profit_pulse.enrollment.api.urls')),
    path('webhooks/', include('profit_pulse.webhooks.api.urls')),
    path('webhooks', include('profit_pulse.webhooks.urls')),
    path('users/', include('profit_pulse.users.api.urls')),
    path('', include('profit_pulse.profiles.api.urls')),

    path('', include(router.urls)),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),

    path('api-auth/password/reset-password/',
         ResetPasswordMobile.as_view(), name='reset_password_mobile'
         ),
    path('api-auth/password/forgot-password/',
         ForgotPasswordMobile.as_view(), name='forgot_password_mobile'
         ),
    path(
        'api-auth/password/change/',
        PasswordChangeView.as_view(),
        name='rest_password_change'
    ),
    path(
        'api-auth/password/reset/',
        PasswordResetConfirmView.as_view(),
        name='rest_password_reset'
    ),
    path(
        'api-auth/',
        include('rest_framework.urls', namespace='rest_framework')
    ),
    path('download/<path:file_path>', download_view, name='download_view'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
