import random

from django.urls import reverse

from faker import Faker
from rest_framework import status
from rest_framework.test import APITestCase

from .factories import ManagerFactory
from profit_pulse.users.tests.factories import (
    AdminUserFactory,
    RegularUserFactory,
)


class CreateManagerMixin(object):

    def create_manager(self, user):
        return ManagerFactory(
            user=user,
            portal_access=True,
            street_address=self.fake.street_address(),
            city=self.fake.city(),
            state=self.fake.state(),
            zip_code=self.fake.zipcode(),
            phone_number="+1-213-621-0002",
        )

    def get_full_payload(self):
        password = self.fake.password()
        return {
            'user': {
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
                'password1': password,
                'password2': password
            },
            'portal_access': True,
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': "213-621-0002",
            'overhead': round(random.uniform(1.00, 10000.00), 2),
            'commissions_owed': round(random.uniform(2.00, 100.00), 2),
        }


class TestManagerAdmin(CreateManagerMixin, APITestCase):
    """
    Test cases for :model:`profiles.Manager` using
    superuser.
    """

    def setUp(self):
        self.fake = Faker()
        self.admin = AdminUserFactory()
        self.user = RegularUserFactory()
        self.manager = self.create_manager(self.user)
        self.payload = self.get_full_payload()
        self.url = reverse('manager-list')
        self.detail_url = reverse(
            'manager-detail',
            kwargs={'pk': self.manager.pk}
        )
        self.logged_in_url = reverse('manager-logged-in')
        self.client.force_authenticate(user=self.admin)

    def test_get_managers_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_managers_list_unauthenticated(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_manager_detail(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_manager_detail_logged_in(self):
        response = self.client.get(self.logged_in_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_manager_detail_logged_in_unauthenticated(self):
        self.client.logout()
        response = self.client.get(self.logged_in_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_manager(self):
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_manager_empty_email(self):
        payload = self.payload
        user = payload.pop('user')
        user.pop('email')
        payload.update({
            'user': user
        })
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_manager_unauthenticated(self):
        self.client.logout()
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_full_update_manager(self):
        payload = {
            'user': {
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'portal_access': False,
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': "+1-213-621-0002",
        }
        response = self.client.put(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_manager(self):
        payload = {
            'portal_access': False
        }
        response = self.client.patch(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_manager_unauthenticated(self):
        self.client.logout()
        payload = {
            'user': {
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'portal_access': True,
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': "213-621-0002",
        }
        response = self.client.put(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_manager(self):
        response = self.client.delete(self.detail_url, {})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_manager_unauthenticated(self):
        self.client.logout()
        response = self.client.delete(self.detail_url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TestManagerRegular(CreateManagerMixin, APITestCase):
    """
    Test cases for :model:`profiles.Manager` using
    a regular manager account.
    """

    def setUp(self):
        self.fake = Faker()
        self.user = RegularUserFactory()
        self.manager = self.create_manager(self.user)
        self.payload = self.get_full_payload()
        self.url = reverse('manager-list')
        self.manager_url = reverse(
            'manager-detail',
            kwargs={'pk': self.manager.pk}
        )
        self.logged_in_url = reverse('manager-logged-in')
        self.client.force_authenticate(user=self.user)

    def test_get_managers_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.data['count'], 1)

    def test_get_manager_detail(self):
        response = self.client.get(self.manager_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_manager_detail_logged_in(self):
        response = self.client.get(self.logged_in_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_manager_detail_logged_in_unauthenticated(self):
        self.client.logout()
        response = self.client.get(self.logged_in_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_manager(self):
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_full_update_manager(self):
        payload = {
            'user': {
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'portal_access': True,
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': "213-621-0002",
        }
        response = self.client.put(self.manager_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_manager(self):
        payload = {
            'portal_access': True
        }
        response = self.client.patch(self.manager_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_manager(self):
        response = self.client.delete(self.manager_url, {})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
