# -*- coding: utf-8 -*-

from .base import *

import elasticsearch
from requests_aws4auth import AWS4Auth


DEBUG = env.bool('DJANGO_DEBUG', True)

ALLOWED_HOSTS = env.list(
    'DJANGO_ALLOWED_HOSTS',
    default=[
        '.elasticbeanstalk.com'
    ]
)

SECRET_KEY = env(
    'DJANGO_SECRET_KEY',
    default='qf)+^)=uz!9&ass!a2e!$qr@$kv$l8!qr@tszxakemu5v6=(+5'
)

CORS_ORIGIN_WHITELIST = [
    'profit_pulse-frontend.s3-website-us-west-2.amazonaws.com',
    'profit_pulse-customer-dev.s3-website-us-west-2.amazonaws.com',
]

# Remove this when CORS_ORIGIN_WHITELIST is re-enabled
CORS_ORIGIN_ALLOW_ALL = env.bool(
    'CORS_ORIGIN_ALLOW_ALL',
    default=True
)

CSRF_TRUSTED_ORIGINS = env(
    'CSRF_TRUSTED_ORIGINS',
    default=[
        '*',
        # Enable this back when development server
        # 'profit_pulse-frontend.s3-website-us-west-2.amazonaws.com',
        # 'profit_pulse-customer-dev.s3-website-us-west-2.amazonaws.com',
    ]
)


AWS_S3_BUCKET_DATA_SCAN = env(
    'AWS_S3_BUCKET_DATA_SCAN',
    default='profit_pulse-datascan-dev'
)

AWS_STORAGE_BUCKET_NAME = env(
    'AWS_STORAGE_BUCKET_NAME',
    default='profit_pulse-dev-media'
)
AWS_S3_CUSTOM_DOMAIN = '%s.s3.amazonaws.com' % AWS_STORAGE_BUCKET_NAME
MEDIAFILES_LOCATION = 'media'
DEFAULT_FILE_STORAGE = 'profit_pulse.core.custom_storages.MediaStorage'


# EMAIL
# --------------------------------------------------------------------------
PORTAL_ACCESS_URL = env(
    'PORTAL_ACCESS_URL',
    default='http://profit_pulse-frontend.s3-website-us-west-2.amazonaws.com'
)
ADMIN_PORTAL_URL = env(
    'ADMIN_PORTAL_URL',
    default='http://profit_pulse-frontend.s3-website-us-west-2.amazonaws.com'
)
CUSTOMER_PORTAL_URL = env(
    'CUSTOMER_PORTAL_URL',
    default='http://profit_pulse-customer-dev.s3-website-us-west-2.amazonaws.com'
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
    default='https://search-profit_pulse-elasticsearch-dev-bnh5brqz7dq7sqj46fj4vy6kyu.us-west-2.es.amazonaws.com'
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
CELERY_BROKER_URL = 'sqs://%s:%s@' % (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
CELERY_BROKER_TRANSPORT_OPTIONS = {
    "region": AWS_DEFAULT_REGION,
    'queue_name_prefix': 'profit_pulse-development',
    'visibility_timeout': 600,
    'polling_interval': 1
}
CELERY_BROKER_TRANSPORT = 'sqs'
CELERY_BROKER_TRANSPORT_OPTIONS = {
    'region': AWS_DEFAULT_REGION,
}
CELERY_BROKER_USER = AWS_ACCESS_KEY_ID
CELERY_BROKER_PASSWORD = AWS_SECRET_ACCESS_KEY
# CELERY_WORKER_STATE_DB = '/var/run/celery/worker.db'
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'
CELERY_WORKER_PREFETCH_MULTIPLIER = 0

# CELERY_TIMEZONE = 'UTC'
# CELERY_ENABLE_UTC = True
CELERY_RESULT_BACKEND = 'django-db'
CELERY_DEFAULT_QUEUE = 'profit_pulse-development'
