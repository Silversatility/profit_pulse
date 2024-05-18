import random

from django.urls import reverse

from faker import Faker
from rest_framework import status
from rest_framework.test import APITestCase

from .factories import SalesRepresentativeFactory
from profit_pulse.users.tests.factories import (
    AdminUserFactory,
    RegularUserFactory,
)


class CreateSalesRepresentativeMixin(object):

    def create_representative(self, user):
        return SalesRepresentativeFactory(
            user=user,
            street_address=self.fake.street_address(),
            city=self.fake.city(),
            state=self.fake.state(),
            zip_code=self.fake.zipcode(),
            phone_number="213-621-0002",
        )


class TestSalesRepresentativeAdmin(CreateSalesRepresentativeMixin,
                                   APITestCase):
    """
    Test cases for :model:`profiles.SalesRepresentative`
    using an admin user
    """

    def setUp(self):
        self.fake = Faker()
        self.admin = AdminUserFactory()
        self.user = RegularUserFactory()
        self.representative = self.create_representative(self.user)
        self.payload = {
            'user': {
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': "213-621-0002",
            'overhead': round(random.uniform(1.00, 10000.00), 2),
            'commissions_owed': round(random.uniform(2.00, 100.00), 2),
        }
        self.url = reverse('salesrepresentative-list')
        self.detail_url = reverse(
            'salesrepresentative-detail',
            kwargs={'pk': self.representative.pk}
        )
        self.client.force_authenticate(user=self.admin)

    def test_get_sales_representatives_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_sales_representatives_list_unauthenticated(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_sales_representative_detail(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_sales_representative(self):
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_sales_representative_empty_email(self):
        payload = self.payload
        user = payload.pop('user')
        user.pop('email')
        payload.update({
            'user': user
        })
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_sales_representative_unauthenticated(self):
        self.client.logout()
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_full_update_sales_representative(self):
        payload = {
            'user': {
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': "213-621-0002",
        }
        response = self.client.put(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_sales_representative(self):
        payload = {
            'user': {
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'street_address': self.fake.street_address(),
            'phone_number': "+1-213-621-0002",
        }
        response = self.client.patch(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_sales_representative_unauthenticated(self):
        self.client.logout()
        payload = {
            'user': {
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': "213-621-0002",
        }
        response = self.client.put(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_sales_representative(self):
        response = self.client.delete(self.detail_url, {})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_sales_representative_unauthenticated(self):
        self.client.logout()
        response = self.client.delete(self.detail_url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TestSalesRepresentativeRegularUser(CreateSalesRepresentativeMixin,
                                         APITestCase):
    """
    Test cases for :model:`profiles.SalesRepresentative` using
    a regular user.
    """

    def setUp(self):
        self.fake = Faker()
        self.user = RegularUserFactory()
        self.representative = self.create_representative(self.user)
        self.other_user = RegularUserFactory()
        self.other_representative = self.create_representative(self.other_user)
        self.payload = {
            'user': {
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'business_name': self.fake.name(),
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': self.fake.phone_number(),
        }
        self.url = reverse('salesrepresentative-list')
        self.representative_url = reverse(
            'salesrepresentative-detail',
            kwargs={'pk': self.representative.pk}
        )
        self.other_representative_url = reverse(
            'salesrepresentative-detail',
            kwargs={'pk': self.other_representative.pk}
        )
        self.client.force_authenticate(user=self.user)

    def test_get_sales_representatives_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.data['count'], 1)

    def test_get_sales_representative_detail(self):
        response = self.client.get(self.representative_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_sales_representative_detail_not_owner(self):
        response = self.client.get(self.other_representative_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_sales_representative(self):
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_full_update_sales_representative(self):
        payload = {
            'user': {
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': "213-621-0002",
        }
        response = self.client.put(self.representative_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_full_update_sales_representative_not_owner(self):
        payload = {
            'user': {
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': "213-621-0002",
        }
        response = self.client.put(self.other_representative_url, payload)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_partial_update_sales_representative(self):
        payload = {
            'user': {
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'street_address': self.fake.street_address(),
            'phone_number': "213-621-0002",
        }
        response = self.client.patch(self.representative_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_sales_representative_not_owner(self):
        payload = {
            'user': {
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'street_address': self.fake.street_address(),
            'phone_number': "213-621-0002",
        }
        response = self.client.patch(self.other_representative_url, payload)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_sales_representative(self):
        response = self.client.delete(self.representative_url, {})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_sales_representative_not_owner(self):
        response = self.client.delete(self.other_representative_url, {})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
