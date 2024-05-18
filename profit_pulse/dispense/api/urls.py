# -*- coding: utf-8 -*-
from django.conf.urls import url

from .views import (
    AdminReports,
    AdminRevenues,
    AdminTotalProfits,
    CustomerReports,
    CustomerRevenues,
    CustomerProfits,
    DatedDispenseHistory,
)

urlpatterns = [

    url(
        r'^dated/$',
        DatedDispenseHistory.as_view(),
        name='dispensehistory-dated'
    ),
    url(
        r'^admin-reports/$',
        AdminReports.as_view(),
        name='dispensehistory-admin-reports'
    ),
    url(
        r'^admin-revenues/$',
        AdminRevenues.as_view(),
        name='dispensehistory-admin-revenues'
    ),
    url(
        r'^admin-total-profits/$',
        AdminTotalProfits.as_view(),
        name='dispensehistory-admin-total-profits'
    ),
    url(
        r'^customer-reports/$',
        CustomerReports.as_view(),
        name='dispensehistory-customer-reports'
    ),
    url(
        r'^customer-revenues/$',
        CustomerRevenues.as_view(),
        name='dispensehistory-customer-revenues'
    ),
    url(
        r'^customer-profits/$',
        CustomerProfits.as_view(),
        name='dispensehistory-customer-profits'
    ),
]
