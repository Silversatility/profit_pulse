from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'', views.WebHookView.as_view(), name="webhooks"),
]