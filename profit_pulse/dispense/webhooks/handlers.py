from profit_pulse.core.logger import logger
from ..models import DispenseReport
from ..tasks import DispenseHistoryImportTask
from profit_pulse.webhooks.hook import WebHookEventHandler
from .serializers import DispenseReportSerializer


class WebHookDataScanHandler(WebHookEventHandler):
    def run(self):
        event_data = self.event.get_event_data()
        file_path = event_data.get('csv_file_path')
        if not file_path:
            logger.error('DataScan WebHook failed')
            return

        # Queue CSV file
        report = DispenseReport.objects.create(
            report_url=file_path,
            status=DispenseReport.STATUS.pending
        )

        # Trigger task to import data
        DispenseHistoryImportTask().apply_async(queue="profit_pulse-dispense")

        return DispenseReportSerializer(report).data
