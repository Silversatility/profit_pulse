import random

from django.urls import reverse

from faker import Faker
from rest_framework import status
from rest_framework.test import APITestCase

from .factories import CustomerFactory
from ..models import Customer
from profit_pulse.users.tests.factories import (
    AdminUserFactory,
    RegularUserFactory,
)


class CreateCustomerMixin(object):

    def create_customer(self, user):
        return CustomerFactory(
            user=user,
            business_name=self.fake.name(),
            street_address=self.fake.street_address(),
            city=self.fake.city(),
            state=self.fake.state(),
            zip_code=self.fake.zipcode(),
            phone_number="+1-213-621-0002",
            num_locations=random.randint(1, 26),
            num_physicians=random.randint(1, 26),
        )

    def get_full_payload(self):
        return {
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
            'phone_number': "213-621-0002",
            'overhead': round(random.uniform(1.00, 10000.00), 2),
            'commissions_owed': round(random.uniform(2.00, 100.00), 2),
            'num_locations': random.randint(1, 26),
            'num_physicians': random.randint(1, 26),
        }


class TestCustomerAdmin(CreateCustomerMixin, APITestCase):
    """
    Test cases for :model:`profiles.Customer` using
    an admin user.
    """

    def setUp(self):
        self.fake = Faker()
        self.admin = AdminUserFactory()
        self.user = RegularUserFactory()
        self.customer = self.create_customer(self.user)
        self.payload = self.get_full_payload()
        self.url = reverse('customer-list')
        self.detail_url = reverse(
            'customer-detail',
            kwargs={'pk': self.customer.pk}
        )
        self.client.force_authenticate(user=self.admin)

    def test_get_customers_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_customers_list_unauthenticated(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_customer_detail(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_customer(self):
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_customer_empty_email(self):
        payload = self.payload
        user = payload.pop('user')
        user.pop('email')
        payload.update({
            'user': user
        })
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_customer_unauthenticated(self):
        self.client.logout()
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_full_update_customer(self):
        payload = {
            'user': {
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'business_name': self.fake.name(),
            'clinic_type': Customer.CLINIC_TYPE.podiatry,
            'portal_access': True,
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': "213-621-0002",
        }
        response = self.client.put(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_customer(self):
        payload = {
            'clinic_type': Customer.CLINIC_TYPE.opthalmology,
            'portal_access': True
        }
        response = self.client.patch(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_customer_invalid(self):
        payload = {
            'num_locations': 0,
            'num_physicians': 50
        }
        response = self.client.patch(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_customer_unauthenticated(self):
        self.client.logout()
        payload = {
            'user': {
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'business_name': self.fake.name(),
            'clinic_type': Customer.CLINIC_TYPE.podiatry,
            'portal_access': True,
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': "213-621-0002",
        }
        response = self.client.put(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_customer(self):
        response = self.client.delete(self.detail_url, {})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_customer_unauthenticated(self):
        self.client.logout()
        response = self.client.delete(self.detail_url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_minified_customers(self):
        url = reverse('customer-minified')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_customer_states(self):
        url = reverse('customer-states')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class TestCustomerRegular(CreateCustomerMixin, APITestCase):
    """
    Test cases for :model:`profiles.Customer` using
    a regular user.
    """

    def setUp(self):
        self.fake = Faker()
        self.user = RegularUserFactory()
        self.customer = self.create_customer(self.user)
        self.other_user = RegularUserFactory()
        self.other_customer = self.create_customer(self.other_user)
        self.payload = self.get_full_payload()
        self.url = reverse('customer-list')
        self.customer_url = reverse(
            'customer-detail',
            kwargs={'pk': self.customer.pk}
        )
        self.other_customer_url = reverse(
            'customer-detail',
            kwargs={'pk': self.other_customer.pk}
        )
        self.logged_in_url = reverse('customer-logged-in')
        self.client.force_authenticate(user=self.user)

    def test_get_customers_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.data['count'], 1)

    def test_get_customer_detail(self):
        response = self.client.get(self.customer_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_customer_detail_logged_in(self):
        response = self.client.get(self.logged_in_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_customer_detail_logged_in_unauthenticated(self):
        self.client.logout()
        response = self.client.get(self.logged_in_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_customer_detail_not_owner(self):
        response = self.client.get(self.other_customer_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_customer(self):
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_full_update_customer(self):
        payload = {
            'user': {
                'email': self.customer.user.email,
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'business_name': self.fake.name(),
            'clinic_type': Customer.CLINIC_TYPE.podiatry,
            'portal_access': True,
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': "213-621-0002",
        }
        response = self.client.put(self.customer_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_full_update_customer_not_owner(self):
        payload = {
            'user': {
                'email': self.fake.email(),
                'first_name': self.fake.first_name(),
                'last_name': self.fake.last_name(),
            },
            'business_name': self.fake.name(),
            'clinic_type': Customer.CLINIC_TYPE.podiatry,
            'portal_access': True,
            'street_address': self.fake.street_address(),
            'city': self.fake.city(),
            'state': self.fake.state(),
            'zip_code': self.fake.zipcode(),
            'phone_number': "+1-213-621-0002",
        }
        response = self.client.put(self.other_customer_url, payload)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_partial_update_customer(self):
        payload = {
            'user': {
                'id': self.customer.user.id,
                'email': self.customer.user.email
            },
            'clinic_type': Customer.CLINIC_TYPE.opthalmology,
            'portal_access': True
        }
        response = self.client.patch(self.customer_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_customer_not_owner(self):
        payload = {
            'clinic_type': Customer.CLINIC_TYPE.opthalmology,
            'portal_access': True
        }
        response = self.client.patch(self.other_customer_url, payload)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_customer(self):
        response = self.client.delete(self.customer_url, {})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_customer_not_owner(self):
        response = self.client.delete(self.other_customer_url, {})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
