# -*- coding: utf-8 -*-
from django.conf.urls import url


from .views import (
    DocusignWebhook,
)

urlpatterns = [

    url(
        r'^docusign/$',
        DocusignWebhook.as_view(),
        name='webhook-docusign'
    ),
]
