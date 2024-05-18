# -*- coding: utf-8 -*-

from .base import *

import elasticsearch
from requests_aws4auth import AWS4Auth


DEBUG = env.bool('DJANGO_DEBUG', False)


ALLOWED_HOSTS = env.list(
    'DJANGO_ALLOWED_HOSTS',
    default=[
        '.elasticbeanstalk.com'
    ]
)


# Enable this back once development code is ready
CORS_ORIGIN_WHITELIST = env(
    'CORS_ORIGIN_WHITELIST',
    default=[
        'profit_pulse-admin-prod.s3-website-us-west-2.amazonaws.com',
        'profit_pulse-customer-prod.s3-website-us-west-2.amazonaws.com',
        'profit_pulse-frontend.s3-website-us-west-2.amazonaws.com',
        'profit_pulse-customer-dev.s3-website-us-west-2.amazonaws.com',
    ]
)

# Remove this when CORS_ORIGIN_WHITELIST is re-enabled
# CORS_ORIGIN_ALLOW_ALL = env.bool(
#     'CORS_ORIGIN_ALLOW_ALL',
#     default=True
# )

CSRF_TRUSTED_ORIGINS = env(
    'CSRF_TRUSTED_ORIGINS',
    default=[
        # '*',
        # Enable this back when development server
        'profit_pulse-admin-prod.s3-website-us-west-2.amazonaws.com',
        'profit_pulse-customer-prod.s3-website-us-west-2.amazonaws.com',
    ]
)


AWS_S3_BUCKET_DATA_SCAN = env(
    'AWS_S3_BUCKET_DATA_SCAN',
    default='profit_pulse-datascan-prod'
)

AWS_STORAGE_BUCKET_NAME = env(
    'AWS_STORAGE_BUCKET_NAME',
    default='profit_pulse-prod-media'
)
AWS_S3_CUSTOM_DOMAIN = '%s.s3.amazonaws.com' % AWS_STORAGE_BUCKET_NAME
MEDIAFILES_LOCATION = 'media'
DEFAULT_FILE_STORAGE = 'profit_pulse.core.custom_storages.MediaStorage'


# EMAIL
# --------------------------------------------------------------------------
PORTAL_ACCESS_URL = env(
    'PORTAL_ACCESS_URL',
    default='http://profit_pulse-admin-prod.s3-website-us-west-2.amazonaws.com'
)
ADMIN_PORTAL_URL = env(
    'ADMIN_PORTAL_URL',
    default='http://profit_pulse-admin-prod.s3-website-us-west-2.amazonaws.com'
)
CUSTOMER_PORTAL_URL = env(
    'CUSTOMER_PORTAL_URL',
    default='http://profit_pulse-customer-prod.s3-website-us-west-2.amazonaws.com'
)


# ELASTICSEARCH SETTINGS
# --------------------------------------------------------------------------
AWS_AUTH = AWS4Auth(
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_DEFAULT_REGION,
    'es'
)
AWS_ELASTICSEARCH_URL = env(
    'AWS_ELASTICSEARCH_URL',
    default='https://search-profit_pulse-elasticsearch-prod-fxk4xolp5borlhj6yjoqmd2f4e.us-west-2.es.amazonaws.com/'
)
HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.elasticsearch_backend.ElasticsearchSearchEngine',
        'URL': AWS_ELASTICSEARCH_URL,
        'INDEX_NAME': 'haystack',
        'KWARGS': {
            'port': 9200,
            'http_auth': AWS_AUTH,
            'use_ssl': True,
            'verify_certs': True,
            'connection_class': elasticsearch.RequestsHttpConnection,
        }
    },
}


# CELERY SETTINGS
# --------------------------------------------------------------------------
# CELERY_BROKER_URL = 'amqp://profit_pulse:22zu2ciUrmpeBd@localhost:5672/profit_pulse'
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'
CELERY_WORKER_PREFETCH_MULTIPLIER = 0

# CELERY_TIMEZONE = 'UTC'
# CELERY_ENABLE_UTC = True
CELERY_RESULT_BACKEND = 'django-db'
CELERY_DEFAULT_QUEUE = 'profit_pulse-production'


import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="https://345fe39a41ba4558a79311ecff7da7c2@sentry.io/1252874",
    integrations=[DjangoIntegration(), CeleryIntegration()]
)
