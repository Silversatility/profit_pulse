import boto3
import pytz

from django.conf import settings
from django.utils import timezone
from ..models import SwitchingReport
from datetime import datetime, timedelta
from .settings import S3_BUCKET_DATA_SCAN_PREFIX_TEMPLATE, CHECK_S3_BUCKET_IN_MINUTES


class DataScanQueueing:
    """
    Scan folder in S3 and add CSV files in Queue for import

    """
    def __init__(self, bucket_name=None, queue_date=None):
        """
        :param bucket_name: str S3 Bucket Name, if None default bucket from settings will be used
        :param queue_date: datetime optional.
            It is used to queue data at a specific date. If not provided, current date will be used
        """

        self.bucket_name = None
        self.queue_date = None

        self.set_bucket_name(bucket_name=bucket_name)
        self.set_queue_date(queue_date=queue_date)

    def set_bucket_name(self, bucket_name):
        if not bucket_name:
            bucket_name = settings.AWS_S3_BUCKET_DATA_SCAN
        self.bucket_name = bucket_name

    def set_queue_date(self, queue_date):
        if not isinstance(queue_date, datetime):
            # queue_date = datetime.now(tz=utc)
            now = timezone.now()
            est = pytz.timezone(settings.TIME_ZONE)
            queue_date = now.astimezone(est)

        # Scan file before X minutes to avoid missing files if the task execute at 0:00 AM
        queue_date = queue_date - timedelta(minutes=CHECK_S3_BUCKET_IN_MINUTES)
        self.queue_date = queue_date

    def enqueue(self):
        s3 = boto3.resource('s3')
        bucket = s3.Bucket(self.bucket_name)
        prefix = self.get_filter_prefix()

        for obj in bucket.objects.filter(Prefix=prefix):
            file_path = obj.key
            if self.is_csv_file(file_path=file_path) and not self.csv_file_exists(file_path=file_path):
                self.enqueue_csv_file(file_path=file_path)

    def get_filter_prefix(self):
        """
        Filter only file in a specific folder
        :return: str
        """
        return self.queue_date.strftime(S3_BUCKET_DATA_SCAN_PREFIX_TEMPLATE)

    @classmethod
    def is_csv_file(cls, file_path):
        if not isinstance(file_path, str):
            return False
        return file_path.upper().endswith('.CSV')

    @classmethod
    def csv_file_exists(cls, file_path):
        ignore_statuses = [
            SwitchingReport.STATUS.pending,
            SwitchingReport.STATUS.imported
        ]
        return SwitchingReport.objects.filter(report_url=file_path, status__in=ignore_statuses)\
            .exists()

    @classmethod
    def enqueue_csv_file(cls, file_path):
        return SwitchingReport.objects.create(report_url=file_path, status=SwitchingReport.STATUS.pending)
