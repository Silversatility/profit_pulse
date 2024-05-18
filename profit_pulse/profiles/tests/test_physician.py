from django.db.models import Sum, ExpressionWrapper, F, DecimalField
from django.urls import reverse
from django.utils import timezone

from datetime import datetime, time
from dateutil.relativedelta import relativedelta
from decimal import Decimal
from faker import Faker
from rest_framework import status
from rest_framework.test import APITestCase

from .factories import PhysicianFactory
from .test_customer import CreateCustomerMixin
from profit_pulse.dispense.models import DispenseHistory
from profit_pulse.dispense.tests.test_dispensehistory import (
    CreateDispenseHistoryMixin,
)
from profit_pulse.users.tests.factories import (
    AdminUserFactory,
    RegularUserFactory,
)


class TestPhysicianAdmin(APITestCase):
    """
    Test cases for :model:`profiles.Physician`
    using an admin user
    """

    def setUp(self):
        self.fake = Faker()
        self.admin = AdminUserFactory()
        self.physician = PhysicianFactory(
            first_name=self.fake.first_name(),
            last_name=self.fake.last_name()
        )
        self.url = reverse('physician-list')
        self.detail_url = reverse(
            'physician-detail',
            kwargs={'pk': self.physician.pk}
        )
        self.client.force_authenticate(user=self.admin)

    def test_get_physicians_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_physicians_list_unauthenticated(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_physician_detail(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class TestPhysicianCustomer(CreateCustomerMixin,
                            CreateDispenseHistoryMixin,
                            APITestCase):
    """
    Test cases for :model:`profiles.Physician`
    using a customer user
    """

    def setUp(self):
        self.fake = Faker()
        self.user = RegularUserFactory()
        self.customer = self.create_customer(self.user)
        self.history = self.create_history(self.user, customer=self.customer)
        self.other_user = RegularUserFactory()
        self.other_customer = self.create_customer(self.other_user)
        self.physician = self.history.physician
        self.url = reverse('physician-list')
        self.detail_url = reverse(
            'physician-detail',
            kwargs={'pk': self.physician.pk}
        )
        self.client.force_authenticate(user=self.user)

    def test_get_physicians_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.data['count'], 1)

    def test_get_physicians_list_not_owner(self):
        self.client.logout()
        self.client.force_authenticate(self.other_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data['count'], 0)

    def test_get_physician_detail(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_physician_detail_not_owner(self):
        self.client.logout()
        self.client.force_authenticate(self.other_user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # def get_profit_tester(self, duration):
    #     now = timezone.now()
    #     physician = PhysicianFactory(
    #         name=self.fake.name()
    #     )
    #     self.create_histories(
    #         self.user,
    #         duration=duration,
    #         number=5,
    #         customer=self.customer,
    #         physician=physician
    #     )

    #     # Create random DispenseHistory for physician but random customer
    #     self.create_histories(
    #         self.user,
    #         duration=duration,
    #         number=5,
    #         physician=physician
    #     )

    #     kwargs = {
    #         'customer': self.customer,
    #         'physician': physician,
    #     }
    #     if duration == 'today':
    #         kwargs.update({
    #             'order_date__date': now.date()
    #         })
    #     elif duration == 'last_week':
    #         start_date = now - relativedelta(days=7)
    #         end_date = datetime.combine(now.date(), time.max)
    #         kwargs.update({
    #             'order_date__range': (start_date, end_date)
    #         })
    #     elif duration == 'last_month':
    #         start_date = now - relativedelta(months=1)
    #         end_date = datetime.combine(now.date(), time.max)
    #         kwargs.update({
    #             'order_date__range': (start_date, end_date)
    #         })
    #     elif duration == 'year_to_date':
    #         kwargs.update({
    #             'order_date__date__year': now.date().year
    #         })

    #     histories = DispenseHistory.objects.filter(**kwargs)
    #     profit_queryset = histories.annotate(
    #         profit=ExpressionWrapper(
    #             F('insurance_paid') - F('cost'),
    #             output_field=DecimalField(max_digits=7, decimal_places=2)
    #         )
    #     )
    #     data = profit_queryset.aggregate(Sum('profit'))
    #     total = data['profit__sum'] if data and 'profit__sum' in data \
    #         else Decimal('0.00')
    #     detail_url = reverse(
    #         'physician-detail',
    #         kwargs={'pk': physician.pk}
    #     )
    #     response = self.client.get(detail_url)
    #     self.assertEqual(response.data['profit_{}'.format(duration)], total)

    # def test_profit_today(self):
    #     self.get_profit_tester('today')

    # def test_profit_this_week(self):
    #     self.get_profit_tester('last_week')

    # def test_profit_this_month(self):
    #     self.get_profit_tester('last_month')

    # def test_profit_year_to_date(self):
    #     self.get_profit_tester('year_to_date')


class TestPhysicianSalesRepresentative(CreateDispenseHistoryMixin,
                                       APITestCase):
    """
    Test cases for :model:`profiles.Physician`
    using a sales representative user
    """

    def setUp(self):
        self.fake = Faker()
        self.user = RegularUserFactory()
        self.history = self.create_history(self.user,
                                           user_type='representative')
        self.other_user = RegularUserFactory()
        self.other_representative = self.create_representative(self.other_user)
        self.physician = self.history.physician
        self.url = reverse('physician-list')
        self.detail_url = reverse(
            'physician-detail',
            kwargs={'pk': self.physician.pk}
        )
        self.client.force_authenticate(user=self.user)

    def test_get_physicians_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.data['count'], 1)

    def test_get_physicians_list_not_owner(self):
        self.client.logout()
        self.client.force_authenticate(self.other_user)
        response = self.client.get(self.url)
        self.assertEqual(response.data['count'], 0)

    def test_get_physician_detail(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_physician_detail_not_owner(self):
        self.client.logout()
        self.client.force_authenticate(self.other_user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
