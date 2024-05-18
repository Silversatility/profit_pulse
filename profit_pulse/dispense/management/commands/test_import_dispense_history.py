from django.core.management.base import BaseCommand
import os
from profit_pulse.dispense.datascan.importer import DispenseHistoryImporter
from profit_pulse.dispense.models import DispenseReport
from profit_pulse.dispense.datascan.reader import LocalFileCsvReader
from profit_pulse.core.logger import logger


class Command(BaseCommand):
    help = "Test command to import CSV from local file"

    def add_arguments(self, parser):
        parser.add_argument('--file', nargs='?', type=str)

    def handle(self, *args, **options):
        file_name = options.get('file', '16.csv')
        src = os.path.dirname(__file__)
        report_url = '{}/{}'.format(src, file_name)
        self.create_dispense_report(report_url)

        reader = LocalFileCsvReader()
        importer = DispenseHistoryImporter(reader=reader)
        importer.import_all_pending_files()
        logger.info('Imported successfully.')

    @classmethod
    def create_dispense_report(cls, report_url):
        return DispenseReport.objects.create(
            report_url=report_url,
            status=DispenseReport.STATUS.pending
        )
