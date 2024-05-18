from django.utils.translation import ugettext_lazy as _

from ..models import SwitchingReport, SwitchingFee
from .exceptions import InvalidParameterException
from .reader import AwsS3CsvReader, CsvReader
from .utils import (
    get_amount_value,
    get_or_create_customer,
    get_date_value,
)


class SwitchingFeeImporter:

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
        switching_fee_reports = SwitchingReport.objects.filter(
            status=SwitchingReport.STATUS.pending
        )
        for switching_fee_report in switching_fee_reports.iterator():
            self.import_dispense_history(switching_fee_report)

    def import_dispense_history(self, switching_fee_report):
        """
        :param switching_fee_report: SwitchingReport
        :return:
        """
        try:
            self.import_csv(switching_fee_report)
            switching_fee_report.status = SwitchingReport.STATUS.imported
            switching_fee_report.save()
        except Exception:
            switching_fee_report.status = SwitchingReport.STATUS.parse_error
            SwitchingFee.objects.filter(report=switching_fee_report).delete()
            raise

    def import_csv(self, switching_fee_report):
        if not isinstance(switching_fee_report, SwitchingReport):
            raise InvalidParameterException(
                _('expected an instance of SwitchingReport')
            )

        file_path = switching_fee_report.report_url
        csv_data = self.read_csv(file_path=file_path)

        for row in csv_data:
            amount = get_amount_value(row)
            customers = get_or_create_customer(row)
            date = get_date_value(row)

            SwitchingFee.objects.update_or_create(
                order_date=date,
                amount=amount,
                defaults={
                    'customer': customers,
                },
            )

    def read_csv(self, file_path):
        return self.reader.read(file_path=file_path)
