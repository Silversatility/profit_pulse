from celery.schedules import crontab
from celery.task import Task
from .datascan.importer import DispenseHistoryImporter
from .datascan.queue import DataScanQueueing
from ..products.models import Product
from profit_pulse.core.logger import logger

import redis

REDIS_CLIENT = redis.Redis()


def only_one(function=None, key="", timeout=None):
    """Enforce only one celery task at a time."""

    def _dec(run_func):
        """Decorator."""

        def _caller(*args, **kwargs):
            """Caller."""
            ret_value = None
            have_lock = False
            lock = REDIS_CLIENT.lock(key, timeout=timeout)
            try:
                have_lock = lock.acquire(blocking=False)
                if have_lock:
                    ret_value = run_func(*args, **kwargs)
            finally:
                if have_lock:
                    lock.release()

            return ret_value

        return _caller

    return _dec(function) if function is not None else _dec


class DispenseHistoryImportTask(Task):

    @classmethod
    def import_csv_dispense_history(cls, customer_input=None):
        importer = DispenseHistoryImporter()
        if customer_input:
            importer.import_all_pending_files_by_customer(customer_input)
        else:
            importer.import_all_pending_files()

    def run(self, customer_input=None):
        print(customer_input)
        if customer_input:
            self.import_csv_dispense_history(customer_input)
        else:
            self.import_csv_dispense_history()


class DispenseHistoryImportPeriodicTask(Task):

    # @only_one(key='DispenseHistoryImportPeriodicTask')
    def run(self, customer_input=None):
        logger.info("=== DispenseHistoryImportCronTask  ===")
        # Queuing task
        DataScanQueueing().enqueue()
        import_task = DispenseHistoryImportTask()
        if customer_input:
            # Import
            import_task.run(customer_input)
        else:
            import_task.apply_async(queue="profit_pulse-dispense")


class RecomputeRanksTask(Task):

    @only_one(key='RecomputeRanksTask')
    def run(self):
        logger.info("=== RecomputeRanksTask  ===")
        Product.recompute_averages_and_ranks()
