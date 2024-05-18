from django.urls import reverse

from faker import Faker
from rest_framework import status
from rest_framework.test import APITestCase

from profit_pulse.profiles.tests.test_customer import CreateCustomerMixin


class TestCustomerEnrollment(CreateCustomerMixin, APITestCase):
    """
    Test cases for customer enrollment endpoints
    """
    def setUp(self):
        self.fake = Faker()
        self.payload = self.get_full_payload()
        self.url = reverse('enrollment-customer')

    def test_enroll_customer(self):
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
