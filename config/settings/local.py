# -*- coding: utf-8 -*-

from .base import *

DEBUG = env.bool('DJANGO_DEBUG', default=True)
SECRET_KEY = env(
    'DJANGO_SECRET_KEY',
    default='qf)+^)=uz!9&ass!a2e!$qr@$kv$l8!qr@tszxakemu5v6=(+5'
)

ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['*'])

CORS_ORIGIN_ALLOW_ALL = env.bool(
    'CORS_ORIGIN_ALLOW_ALL',
    default=True
)

HOST_NAME = '127.0.0.1:8000'


# DOCUSIGN
# --------------------------------------------------------------------------
DOCUSIGN_BASE_URL = env(
    'DOCUSIGN_BASE_URL',
    default='https://demo.docusign.net/restapi'
)
DOCUSIGN_OAUTH_URL = env(
    'DOCUSIGN_OAUTH_URL',
    default='account-d.docusign.com'
)
DOCUSIGN_REDIRECT_URL = env(
    'DOCUSIGN_REDIRECT_URL',
    default='http://localhost:8000/customers/enrollment/docusign-callback'
)

# EMAIL
# --------------------------------------------------------------------------
EMAIL_HOST = env('DJANGO_EMAIL_HOST', default='localhost')
EMAIL_BACKEND = env(
    'DJANGO_EMAIL_BACKEND',
    default='django.core.mail.backends.console.EmailBackend'
)
# EMAIL_BACKEND = env(
#     'DJANGO_EMAIL_BACKEND',
#     default='django_amazon_ses.EmailBackend'
# )
PORTAL_ACCESS_URL = env(
    'PORTAL_ACCESS_URL',
    default='http://localhost:8000'
)
ADMIN_PORTAL_URL = env(
    'ADMIN_PORTAL_URL',
    default='http://profit_pulse-frontend.s3-website-us-west-2.amazonaws.com'
)
CUSTOMER_PORTAL_URL = env(
    'CUSTOMER_PORTAL_URL',
    default='http://profit_pulse-customer-dev.s3-website-us-west-2.amazonaws.com'
)

# HAYSTACK SETTINGS
# --------------------------------------------------------------------
HAYSTACK_CONNECTIONS = {
    'default': {},
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres',
        'HOST': 'db',
        'PORT': 5432,
    }
}
