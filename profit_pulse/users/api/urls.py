# -*- coding: utf-8 -*-
from django.conf.urls import url


from .views import (

    # Customer
    LoggedInUser,

)

urlpatterns = [

    # Customer
    url(
        r'^me/$',
        LoggedInUser.as_view(),
        name='user-logged-in'
    ),
]
