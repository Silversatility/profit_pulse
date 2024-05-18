from django.urls import reverse

from faker import Faker
from rest_framework import status
from rest_framework.test import APITestCase

from .factories import (
    RegularUserFactory,
)


class TestChangePassword(APITestCase):
    """
    Test cases for changing password
    """

    def setUp(self):
        self.fake = Faker()
        old_password = self.fake.password(length=10)
        self.password = self.fake.password(length=10)
        self.user = RegularUserFactory()
        self.user.set_password(old_password)
        self.payload = {
            "old_password": old_password,
            "new_password1": self.password,
            "new_password2": self.password
        }
        self.url = reverse('rest_password_change')
        self.client.force_authenticate(user=self.user)

    def test_change_password(self):
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_new_password_do_not_match(self):
        payload = self.payload
        payload['new_password2'] = self.fake.password(length=10)
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_old_password(self):
        self.payload.pop('old_password')
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_wrong_old_password(self):
        payload = self.payload
        payload['old_password'] = self.fake.password(length=10)
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
