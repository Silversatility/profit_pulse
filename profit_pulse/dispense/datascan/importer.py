import logging
import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration

from django.utils.translation import ugettext_lazy as _

from profit_pulse.products.models import Product
from ..models import DispenseReport, DispenseHistory
from .exceptions import InvalidParameterException
from .reader import AwsS3CsvReader, CsvReader
from .settings import IGNORE_FIRST_ROW
from .utils import (
    get_cost_value,
    get_dispense_history_csv_field,
    get_insurance_paid_value,
    get_or_create_customer,
    get_or_create_physician,
    get_or_create_product,
    get_order_date_value,
    get_quantity_value,
    get_rx_copay_value,
    get_total_paid_value,
    get_rx_number_value,
    get_rf_number_value,
)

class DispenseHistoryImporter:

    def __init__(self, reader=None):
        self.reader = None  # type: CsvReader
        self.set_reader(reader=reader)

    def set_reader(self, reader):
        """
        :param reader: CsvReader
        :return:
        """
        if not isinstance(reader, CsvReader):
            reader = AwsS3CsvReader()
        self.reader = reader

    def import_all_pending_files(self):
        dispense_reports = DispenseReport.objects.filter(
            status__in=[DispenseReport.STATUS.pending, DispenseReport.STATUS.parse_error]
        ).order_by('report_url')
        for dispense_report in dispense_reports.iterator():
            print('Importing {}'.format(dispense_report.report_url))
            self.import_dispense_history(dispense_report)

    def import_all_pending_files_by_customer(self, customer_input):
        dispense_reports = DispenseReport.objects.filter(
            status__in=[DispenseReport.STATUS.pending, DispenseReport.STATUS.parse_error]
        ).order_by('report_url')
        for dispense_report in dispense_reports.iterator():
            print('Importing {}'.format(dispense_report.report_url))
            self.import_dispense_history(dispense_report, customer_input)

    def import_dispense_history(self, dispense_report, customer_input=None):
        """
        :param dispense_report: DispenseReport
        :return:
        """
        print(customer_input, "=================")
        dispense_report.status = DispenseReport.STATUS.processing
        dispense_report.save()
        try:
            if customer_input:
                self.import_csv_by_customer(dispense_report, customer_input)
            else:
                self.import_csv(dispense_report)

            dispense_report.status = DispenseReport.STATUS.imported
            dispense_report.save()
        except Exception:
            dispense_report.status = DispenseReport.STATUS.parse_error
            dispense_report.save()
            raise

    def import_csv(self, dispense_report):

        if not isinstance(dispense_report, DispenseReport):
            raise InvalidParameterException(
                _('expected an instance of DispenseReport')
            )

        first_row = True
        file_path = dispense_report.report_url
        csv_data = self.read_csv(file_path=file_path)
        sentry_logging = LoggingIntegration(
            level=logging.INFO,        # Capture info and above as breadcrumbs
            event_level=logging.ERROR  # Send errors as events
        )
        sentry_sdk.init(
            dsn="https://345fe39a41ba4558a79311ecff7da7c2@sentry.io/1252874",
            integrations=[sentry_logging]
        )

        for line, row in enumerate(csv_data):
            if IGNORE_FIRST_ROW and first_row:
                first_row = False
                continue

            product = get_or_create_product(row)
            customer = get_or_create_customer(row)
            physician = get_or_create_physician(row, customer)
            cost = get_cost_value(row)
            insurance_paid = get_insurance_paid_value(row)
            total_paid = get_total_paid_value(row)
            quantity = get_quantity_value(row)
            rx_number = get_rx_number_value(row)
            rf_number = get_rf_number_value(row)
            order_date = get_order_date_value(row)

            check_zero_quantity = DispenseHistory.objects.filter(
                customer=customer,
                rx_number=rx_number,
                rf_number=rf_number,
                quantity=0,
            )

            if check_zero_quantity:
                print("Warning: DispenseHistory Quantity Zero ({})".format(customer))
            # else:
            if True:
                try:
                    instance, created = DispenseHistory.objects.update_or_create(
                        customer=customer,
                        rx_number=rx_number,
                        rf_number=rf_number,
                        defaults={
                            'order_date': order_date,
                            'product': product,
                            'physician': physician,
                            'report': dispense_report,
                            'insurance_paid': insurance_paid,
                            'total_paid': total_paid,
                            'cost': cost,
                            'quantity': quantity,
                        },
                    )
                except DispenseHistory.MultipleObjectsReturned:
                    for other in DispenseHistory.objects.filter(
                        customer=customer,
                        rx_number=rx_number,
                        rf_number=rf_number,
                    ).order_by('-order_date')[1:]:
                        other.delete()
                    instance, created = DispenseHistory.objects.update_or_create(
                        customer=customer,
                        rx_number=rx_number,
                        rf_number=rf_number,
                        defaults={
                            'order_date': order_date,
                            'product': product,
                            'physician': physician,
                            'report': dispense_report,
                            'insurance_paid': insurance_paid,
                            'total_paid': total_paid,
                            'cost': cost,
                            'quantity': quantity,
                        },
                    )
                print('.', end='', flush=True)
        print('')

    def import_csv_by_customer(self, dispense_report, customer_input):

        if not isinstance(dispense_report, DispenseReport):
            raise InvalidParameterException(
                _('expected an instance of DispenseReport')
            )

        first_row = True
        file_path = dispense_report.report_url
        csv_data = self.read_csv(file_path=file_path)
        sentry_logging = LoggingIntegration(
            level=logging.INFO,        # Capture info and above as breadcrumbs
            event_level=logging.ERROR  # Send errors as events
        )
        sentry_sdk.init(
            dsn="https://345fe39a41ba4558a79311ecff7da7c2@sentry.io/1252874",
            integrations=[sentry_logging]
        )

        for line, row in enumerate(csv_data):
            if IGNORE_FIRST_ROW and first_row:
                first_row = False
                continue

            product = get_or_create_product(row)
            customer = get_or_create_customer(row)
            physician = get_or_create_physician(row, customer)
            cost = get_cost_value(row)
            insurance_paid = get_insurance_paid_value(row)
            total_paid = get_total_paid_value(row)
            quantity = get_quantity_value(row)
            rx_number = get_rx_number_value(row)
            rf_number = get_rf_number_value(row)
            order_date = get_order_date_value(row)

            check_zero_quantity = DispenseHistory.objects.filter(customer__business_name=customer, rx_number=rx_number, quantity=0)
            if customer_input == customer.business_name:
                if check_zero_quantity:
                    print("Sentry:")
                    logging.error("Warning: DispenseHistory Quantity Zero ({})".format(customer), extra=dict(customer=customer, rx_number=rx_number))
                    print("\n")
                else:
                    try:
                        instance, created = DispenseHistory.objects.update_or_create(
                            customer=customer,
                            physician=physician,
                            rx_number=rx_number,
                            rf_number=rf_number,
                            defaults={
                                'order_date': order_date,
                                'product': product,
                                'report': dispense_report,
                                'insurance_paid': insurance_paid,
                                'total_paid': total_paid,
                                'cost': cost,
                                'quantity': quantity,
                            },
                        )
                    except DispenseHistory.MultipleObjectsReturned:
                        for other in DispenseHistory.objects.filter(
                            customer=customer,
                            physician=physician,
                            rx_number=rx_number,
                            rf_number=rf_number,
                        ).order_by('-order_date')[1:]:
                            other.delete()
                        instance, created = DispenseHistory.objects.update_or_create(
                            customer=customer,
                            physician=physician,
                            rx_number=rx_number,
                            rf_number=rf_number,
                            defaults={
                                'order_date': order_date,
                                'product': product,
                                'report': dispense_report,
                                'insurance_paid': insurance_paid,
                                'total_paid': total_paid,
                                'cost': cost,
                                'quantity': quantity,
                            },
                        )
                    print('.', end='', flush=True)
        print('')

    def read_csv(self, file_path):
        fields = get_dispense_history_csv_field()
        return self.reader.read(file_path=file_path, fieldnames=fields)
