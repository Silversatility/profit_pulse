from ...profiles.models import Customer
from ...users.models import User
from dateutil import parser
from decimal import Decimal, InvalidOperation
from django.utils.text import slugify
from pytz import utc
from .settings import CUSTOMER_ALIASES
from profit_pulse.core.logger import logger


def create_dummy_customer(name):
    user, created = User.objects.get_or_create(
        email=slugify(name).replace('-', '.') + '@example.com')
    if created:
        user.set_password('Password123')
        user.save()
    customer = Customer.objects.create(user=user, business_name=name)
    return customer


def get_amount_value(row):
    try:
        return Decimal(
            row[3]
        )
    except InvalidOperation:
        write_log('Insurance Paid must be number!')


def get_date_value(row):
    try:
        value = row[2]
        return parse_timestamp(value)
    except Exception as ex:
        write_log(ex)


def get_or_create_customer(row):
    name = row[1]
    if name in CUSTOMER_ALIASES:
        name = CUSTOMER_ALIASES[name]
    customers = Customer.objects.filter(business_name__icontains=name)
    if customers.exists():
        return customers.first()
    return create_dummy_customer(name)


def parse_timestamp(timestamp):
    return parser.parse(timestamp).replace(tzinfo=utc)


def write_log(message):
    logger.info(message)
