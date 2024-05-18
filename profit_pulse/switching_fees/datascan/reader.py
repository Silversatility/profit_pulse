import boto3
import codecs
import csv
from django.conf import settings

DEFAULT_CHARSET = 'utf-8'


class CsvReader:
    def read(self, file_path, **kwargs):
        raise NotImplementedError()


class LocalFileCsvReader(CsvReader):
    def read(self, file_path, **kwargs):
        return csv.reader(open(file_path))


class AwsS3CsvReader(CsvReader):
    def __init__(self, bucket_name=None):
        super().__init__()
        self.bucket_name = None
        self.s3 = None
        self.s3_bucket = None

        # Init S3 bucket
        self.set_bucket_name(bucket_name=bucket_name)
        self.init()

    def set_bucket_name(self, bucket_name):
        if not bucket_name:
            bucket_name = settings.AWS_S3_BUCKET_DATA_SCAN
        self.bucket_name = bucket_name

    def init(self):
        s3 = boto3.resource('s3')
        self.s3_bucket = s3.Bucket(self.bucket_name)

    def read(self, file_path, **kwargs):
        obj = self.s3_bucket.Object(key=file_path)
        response = obj.get()
        return csv.reader(codecs.getreader(DEFAULT_CHARSET)(response[u'Body']), **kwargs)
