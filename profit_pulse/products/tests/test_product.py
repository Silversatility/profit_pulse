from faker import Faker
from io import BytesIO
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from .factories import ProductFactory
from profit_pulse.profiles.tests.test_customer import CreateCustomerMixin
from profit_pulse.dispense.tests.test_dispensehistory import (
    CreateDispenseHistoryMixin,
)
from profit_pulse.users.tests.factories import (
    AdminUserFactory,
    RegularUserFactory,
)


class CreateProductMixin(object):

    def get_product_image(self):
        stream = BytesIO()
        image = Image.new('RGB', (100, 100))
        image.save(stream, format='jpeg')
        uploaded_file = SimpleUploadedFile(
            "file.jpg",
            stream.getvalue(),
            content_type="image/jpg"
        )
        return uploaded_file

    def create_product(self):
        return ProductFactory(
            title=self.fake.name(),
            description=self.fake.sentence(nb_words=10),
            image=self.get_product_image(),
            size="15x15",
            ndc=self.fake.word(),
            awp=self.fake.word(),
        )

    def get_full_payload(self):
        return {
            'title': self.fake.name(),
            'description': self.fake.sentence(nb_words=10),
            'image': self.get_product_image(),
            'size': "15x15",
            'ndc': self.fake.word(),
            'awp': self.fake.word(),
        }


class TestProductAdmin(CreateProductMixin, APITestCase):
    """
    Test cases for :model:`core.Product`
    """

    def setUp(self):
        self.fake = Faker()
        self.admin = AdminUserFactory()
        self.product = self.create_product()
        self.payload = self.get_full_payload()
        self.url = reverse('product-list')
        self.detail_url = reverse(
            'product-detail',
            kwargs={'pk': self.product.pk}
        )
        self.client.force_authenticate(user=self.admin)

    def test_get_products_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_products_list_unauthenticated(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_product_detail(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_product(self):
        response = self.client.post(self.url, self.payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_product_unauthenticated(self):
        self.client.logout()
        response = self.client.post(self.url, self.payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_full_update_product(self):
        payload = self.get_full_payload()
        response = self.client.put(
            self.detail_url,
            payload,
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_partial_update_product(self):
        payload = {
            'description': self.fake.sentence(nb_words=10),
        }
        response = self.client.patch(
            self.detail_url,
            payload,
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_product_unauthenticated(self):
        self.client.logout()
        payload = self.get_full_payload()
        response = self.client.put(
            self.detail_url,
            payload,
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_product(self):
        response = self.client.delete(self.detail_url, {})
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_product_unauthenticated(self):
        self.client.logout()
        response = self.client.delete(self.detail_url, {}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TestProductCustomer(CreateProductMixin,
                          CreateDispenseHistoryMixin,
                          CreateCustomerMixin,
                          APITestCase):
    """
    Test cases for :model:`core.Product`
    using a customer user
    """

    def setUp(self):
        self.fake = Faker()
        self.user = RegularUserFactory()
        self.history = self.create_history(self.user)
        self.other_user = RegularUserFactory()
        self.other_customer = self.create_customer(self.other_user)
        self.product = self.history.product
        self.payload = self.get_full_payload()
        self.url = reverse('product-list')
        self.detail_url = reverse(
            'product-detail',
            kwargs={'pk': self.product.pk}
        )
        self.client.force_authenticate(user=self.user)

    def test_get_products_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.data['count'], 1)

    def test_get_products_list_not_owner(self):
        self.client.logout()
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data['count'], 1)

    def test_get_product_detail(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_product_detail_not_owner(self):
        self.client.logout()
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_product(self):
        response = self.client.post(self.url, self.payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_full_update_product(self):
        payload = self.get_full_payload()
        response = self.client.put(
            self.detail_url,
            payload,
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_full_update_product_not_owner(self):
        self.client.logout()
        self.client.force_authenticate(user=self.other_user)
        payload = self.get_full_payload()
        response = self.client.put(
            self.detail_url,
            payload,
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partial_update_product(self):
        payload = {
            'description': self.fake.sentence(nb_words=10),
        }
        response = self.client.patch(
            self.detail_url,
            payload,
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partial_update_product_not_owner(self):
        self.client.logout()
        self.client.force_authenticate(user=self.other_user)
        payload = {
            'description': self.fake.sentence(nb_words=10),
        }
        response = self.client.patch(self.detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_product(self):
        response = self.client.delete(self.detail_url, {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_product_not_owner(self):
        self.client.logout()
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(self.detail_url, {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
