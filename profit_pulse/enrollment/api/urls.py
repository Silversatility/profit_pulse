# -*- coding: utf-8 -*-
from django.conf.urls import url


from .views import (

    # Customer
    CustomerEnrollment,

)

urlpatterns = [

    # Customer
    url(
        r'^customer/$',
        CustomerEnrollment.as_view(),
        name='enrollment-customer'
    ),
]
