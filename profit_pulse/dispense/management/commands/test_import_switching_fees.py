from django.core.management.base import BaseCommand
import os
from profit_pulse.switching_fees.datascan.importer import SwitchingFeeImporter
from profit_pulse.switching_fees.models import SwitchingReport
from profit_pulse.switching_fees.datascan.reader import LocalFileCsvReader
from profit_pulse.core.logger import logger


class Command(BaseCommand):
    help = "Test command to import CSV from local file"

    def add_arguments(self, parser):
        parser.add_argument('--file', nargs='?', type=str)

    def handle(self, *args, **options):
        try:
            file_name = options.get('file', 'test.csv')
            src = os.path.dirname(__file__)
            report_url = '{}/{}'.format(src, file_name)
            self.create_switching_fee_report(report_url)

            reader = LocalFileCsvReader()
            importer = SwitchingFeeImporter(reader=reader)
            importer.import_all_pending_files()
            logger.info('Imported successfully.')

        except Exception as ex:
            logger.error(str(ex))

    @classmethod
    def create_switching_fee_report(cls, report_url):
        return SwitchingReport.objects.create(
            report_url=report_url,
            status=SwitchingReport.STATUS.pending
        )
