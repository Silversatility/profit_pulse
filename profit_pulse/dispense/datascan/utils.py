from ...products.models import Product
from ...profiles.models import Customer, Physician
from ...users.models import User
from dateutil import parser
from decimal import Decimal, InvalidOperation
from datetime import date
from dateutil.relativedelta import relativedelta
from django.db.models import Q
from django.utils.text import slugify
from pytz import utc
from .settings import (
    DEFAULT_CUSTOMER_USER_ID,
    DISPENSE_HISTORY_CSV_FIELD_MAPS,
    USE_DEFAULT_CUSTOMER_IF_EMPTY,
    CUSTOMER_ALIASES,
)
from profit_pulse.core.logger import logger


def get_default_customer():
    if USE_DEFAULT_CUSTOMER_IF_EMPTY is False:
        return None
    customers = Customer.objects.filter(user_id=DEFAULT_CUSTOMER_USER_ID)
    if not customers.exists():
        fields = {'business_name': 'admin',
                  'user_id': DEFAULT_CUSTOMER_USER_ID}
        customer = Customer.objects.create(**fields)
    else:
        customer = customers.first()
    return customer


def create_dummy_customer(name):
    start_date = date.today() - relativedelta(years=5)
    user, created = User.objects.get_or_create(
        email=slugify(name).replace('-', '.') + '@example.com')
    if created:
        user.set_password('Password123')
        user.save()
    customer = Customer.objects.create(user=user, business_name=name)
    customer.fee_structures.create(
        start_date=start_date,
        monthly_fee=450,
        billing_percentage=10
    )
    return customer


def get_insurance_paid_value(row):
    try:
        return Decimal(
            row.get(DISPENSE_HISTORY_CSV_FIELD_MAPS['insurance_paid']) or 0
        )
    except InvalidOperation:
        write_log('Insurance Paid must be number!')


def get_total_paid_value(row):
    try:
        return Decimal(row.get(DISPENSE_HISTORY_CSV_FIELD_MAPS['total_paid']))
    except InvalidOperation:
        write_log('Total Paid must be number!')
    return None


def get_cost_value(row):
    try:
        return Decimal(row.get(DISPENSE_HISTORY_CSV_FIELD_MAPS['cost']))
    except InvalidOperation:
        write_log('Cost must be number!')
    return None


def get_quantity_value(row):
    try:
        qty_field = DISPENSE_HISTORY_CSV_FIELD_MAPS['quantity']
        value = float(row.get(qty_field, 0))
        return int(value)
    except ValueError:
        write_log('Quantity must be integer!')
    return None


def get_rx_number_value(row):
    return row.get(DISPENSE_HISTORY_CSV_FIELD_MAPS['rx_number'])


def get_rf_number_value(row):
    return row.get(DISPENSE_HISTORY_CSV_FIELD_MAPS['rf_number'])


def get_rx_copay_value(row):
    return Decimal(row.get(DISPENSE_HISTORY_CSV_FIELD_MAPS['rx_copay']) or 0)


def get_order_date_value(row):
    try:
        value = row.get(DISPENSE_HISTORY_CSV_FIELD_MAPS['order_date'])
        return parse_timestamp(value)
    except Exception as ex:
        write_log(ex)


def get_or_create_product(row):
    product_name = row.get(DISPENSE_HISTORY_CSV_FIELD_MAPS['product']).strip()
    ndc = row.get(DISPENSE_HISTORY_CSV_FIELD_MAPS['product_ndc']).strip()
    products = Product.objects.filter(
        ndc=ndc,
        is_active=True
    )
    if products.exists():
        product = products.first()
        if not product.is_datascan_import:
            product.is_datascan_import = True
            product.save()
    else:
        fields = {
            'title': product_name,
            'ndc': ndc,
            'is_datascan_import': True
        }
        product = Product.objects.create(**fields)
    return product


def get_or_create_customer(row):
    name = row.get(DISPENSE_HISTORY_CSV_FIELD_MAPS['customer']).strip()
    if name in CUSTOMER_ALIASES:
        name = CUSTOMER_ALIASES[name]
    customers = Customer.objects.filter(business_name__icontains=name, user__is_removed=False)
    if customers.exists():
        return customers.first()
    else:
        customers = Customer.objects.filter(business_name__icontains=name, user__is_removed=True)
        if customers.exists():
            return customers.first()
    return create_dummy_customer(name)


def get_or_create_physician(row, customer):
    first_name = row.get(DISPENSE_HISTORY_CSV_FIELD_MAPS['physician_first_name']).strip()
    last_name = row.get(DISPENSE_HISTORY_CSV_FIELD_MAPS['physician_last_name']).strip()

    physicians = Physician.objects.filter(
        Q(customers=customer) | Q(customers__parent__children=customer),
        first_name=first_name,
        last_name=last_name,
    )
    if physicians.exists():
        physician = physicians.first()
    else:
        fields = {'first_name': first_name, 'last_name': last_name}
        physician = Physician.objects.create(**fields)
    physician.customers.add(customer)
    return physician


def get_dispense_history_csv_field():
    fields = []
    for key, csv_field in DISPENSE_HISTORY_CSV_FIELD_MAPS.items():
        fields.append(csv_field)
    return fields


def parse_timestamp(timestamp):
    return parser.parse(timestamp).replace(tzinfo=utc)


def write_log(message):
    logger.info(message)
