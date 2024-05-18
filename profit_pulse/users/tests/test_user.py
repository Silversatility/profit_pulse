from django.urls import reverse

from faker import Faker
from rest_framework import status
from rest_framework.test import APITestCase

from .factories import (
    AdminUserFactory,
    RegularUserFactory,
)


class TestUserAPI(APITestCase):
    """
    Test cases for :model:`users.User` endpoints
    """

    def setUp(self):
        self.fake = Faker()
        self.admin = AdminUserFactory()
        self.user = RegularUserFactory()
        self.other_user = RegularUserFactory()
        self.url = reverse('user-list')
        self.detail_url = reverse(
            'user-detail',
            kwargs={'pk': self.user.pk}
        )
        self.user_url = reverse('user-logged-in')
        password = self.fake.password(length=10)
        self.payload = {
            'password1': password,
            'password2': password,
            'email': self.fake.email(),
            'first_name': self.fake.first_name(),
            'last_name': self.fake.last_name(),
            'is_owner': True
        }
        self.client.force_authenticate(user=self.admin)

    def test_get_users_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_users_list_unauthenticated(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_users_list_regular(self):
        self.client.logout()
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.data['count'], 1)

    def test_get_user_detail(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_logged_in_user_details(self):
        response = self.client.get(self.user_url)
        self.assertEqual(response.data['id'], self.admin.id)

    def test_get_logged_in_user_details_unauthenticated(self):
        self.client.logout()
        response = self.client.get(self.user_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_detail_not_owner(self):
        self.client.logout()
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_user(self):
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_user_unauthenticated(self):
        self.client.logout()
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_user_not_admin(self):
        self.client.logout()
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, self.payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_full_update_user(self):
        payload = {
            'first_name': self.fake.first_name(),
            'last_name': self.fake.last_name(),
        }
        response = self.client.put(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_user(self):
        payload = {
            'is_owner': False
        }
        response = self.client.patch(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_full_update_user_owner(self):
        self.client.logout()
        self.client.force_authenticate(user=self.user)
        payload = {
            'first_name': self.fake.first_name(),
            'last_name': self.fake.last_name(),
        }
        response = self.client.put(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_user_owner(self):
        self.client.logout()
        self.client.force_authenticate(user=self.user)
        payload = {
            'is_owner': False
        }
        response = self.client.patch(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_user_unauthenticated(self):
        self.client.logout()
        payload = {
            'first_name': self.fake.first_name(),
            'last_name': self.fake.last_name(),
        }
        response = self.client.put(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_user(self):
        response = self.client.delete(self.detail_url, {})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_user_unauthenticated(self):
        self.client.logout()
        response = self.client.delete(self.detail_url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
