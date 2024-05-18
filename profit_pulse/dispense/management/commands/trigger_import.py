from django.core.management.base import BaseCommand
from profit_pulse.core.logger import logger
from profit_pulse.dispense.tasks import DispenseHistoryImportPeriodicTask


class Command(BaseCommand):
    help = "Trigger import from S3/Datascan"

    def handle(self, *args, **options):
        logger.info("=== trigger DispenseHistoryImportPeriodicTask  ===")
        DispenseHistoryImportPeriodicTask().apply_async(queue="profit_pulse-dispense")
