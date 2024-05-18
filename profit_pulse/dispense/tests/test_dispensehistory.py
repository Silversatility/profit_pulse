import pytz

from django.urls import reverse
from django.utils import timezone

from faker import Faker
from rest_framework import status
from rest_framework.test import APITestCase

from .factories import DispenseHistoryFactory, DispenseReportFactory
from profit_pulse.products.tests.factories import ProductFactory
from profit_pulse.profiles.tests.factories import (
    CustomerFactory,
    PhysicianFactory,
    SalesRepresentativeFactory,
)
from profit_pulse.users.tests.factories import (
    AdminUserFactory,
    RegularUserFactory,
)


class CreateDispenseHistoryMixin(object):

    def create_histories(self,
                         user,
                         duration,
                         number=1,
                         customer=None,
                         physician=None,
                         user_type='customer'):
        now = timezone.now()
        if duration == 'today':
            order_date = now
        elif duration == 'last_week':
            order_date = self.fake.date_time_between(
                start_date='-7d',
                end_date='now',
                tzinfo=now.tzinfo
            )
        elif duration == 'last_month':
            order_date = self.fake.date_time_between(
                start_date='-30d',
                end_date='now',
                tzinfo=now.tzinfo
            )
        elif duration == 'year_to_date':
            order_date = self.fake.date_time_this_year()

        for num in range(number):
            self.create_history(
                user,
                customer=customer,
                physician=physician,
                order_date=order_date,
                user_type=user_type,
            )

    def create_representative(self, user):
        return SalesRepresentativeFactory(
            user=user,
            street_address=self.fake.street_address(),
            city=self.fake.city(),
            state=self.fake.state(),
            zip_code=self.fake.zipcode(),
            phone_number="+1-213-621-0002",
        )

    def create_history(self,
                       user,
                       report=None,
                       customer=None,
                       physician=None,
                       order_date=None,
                       written_date=None,
                       user_type='customer'):
        if report is None:
            report = DispenseReportFactory(
                report_url=self.fake.image_url()
            )

        if customer is None:
            other_user = RegularUserFactory()
            if user_type == 'customer':
                representative = self.create_representative(other_user)
                customer_kwargs = {
                    'business_name': self.fake.name(),
                    'user': user,
                    'sales_representative': representative
                }
            elif user_type == 'representative':
                customer_kwargs = {
                    'business_name': self.fake.name(),
                    'user': other_user,
                    'sales_representative': self.create_representative(user)
                }
            customer = CustomerFactory(**customer_kwargs)

        if physician is None:
            physician = PhysicianFactory(
                first_name=self.fake.first_name(),
                last_name=self.fake.last_name()
            )

        if order_date is None:
            tzinfo = pytz.timezone(self.fake.timezone())
            order_date = self.fake.date_time_between(
                start_date="-30d",
                end_date="now",
                tzinfo=tzinfo
            )

        if written_date is None:
            tzinfo = pytz.timezone(self.fake.timezone())
            written_date = self.fake.date_time_between(
                start_date="-30d",
                end_date="now",
                tzinfo=tzinfo
            )

        product = ProductFactory(
            title=self.fake.name()
        )

        trans_amount_paid = self.fake.pydecimal(
            left_digits=5,
            right_digits=2,
            positive=True
        )
        insurance_paid = self.fake.pydecimal(
            left_digits=5,
            right_digits=2,
            positive=True
        )
        total_paid = self.fake.pydecimal(
            left_digits=5,
            right_digits=2,
            positive=True
        )
        cost = self.fake.pydecimal(
            left_digits=3,
            right_digits=2,
            positive=True
        )

        return DispenseHistoryFactory(
            report=report,
            product=product,
            customer=customer,
            physician=physician,
            trans_amount_paid=trans_amount_paid,
            insurance_paid=insurance_paid,
            total_paid=total_paid,
            cost=cost,
            quantity=self.fake.pyint(),
            rx_number=self.fake.isbn10(separator="-"),
            written_date=written_date,
            order_date=order_date
        )


class TestDispenseHistoryAdmin(CreateDispenseHistoryMixin,
                               APITestCase):
    """
    Test cases for :model:`dispense.DispenseHistory`
    using an admin user
    """

    def setUp(self):
        self.fake = Faker()
        self.admin = AdminUserFactory()
        self.user = RegularUserFactory()
        self.dispense_history = self.create_history(self.user)
        self.url = reverse('dispensehistory-list')
        self.detail_url = reverse(
            'dispensehistory-detail',
            kwargs={'pk': self.dispense_history.pk}
        )
        self.client.force_authenticate(user=self.admin)

    def test_get_dispense_histories_list(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_dispense_histories_list_unauthenticated(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_dispense_history_detail(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def get_dated_dispense_history_tester(self, duration):
        customer = self.dispense_history.customer
        self.create_histories(
            self.user,
            duration=duration,
            number=5,
            customer=customer,
        )
        dated_url = reverse('dispensehistory-dated')
        duration_url = "{}?duration={}".format(dated_url, duration)
        response = self.client.get(duration_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_profit_today(self):
        self.get_dated_dispense_history_tester('today')

    def test_profit_this_week(self):
        self.get_dated_dispense_history_tester('last_week')

    def test_profit_this_month(self):
        self.get_dated_dispense_history_tester('last_month')

    def test_profit_year_to_date(self):
        self.get_dated_dispense_history_tester('year_to_date')


class TestDispenseHistoryCustomer(CreateDispenseHistoryMixin,
                                  APITestCase):
    """
    Test cases for :model:`dispense.DispenseHistory`
    using a customer
    """

    def setUp(self):
        self.fake = Faker()
        self.user = RegularUserFactory()
        self.dispense_history = self.create_history(self.user)
        self.other_user = RegularUserFactory()
        self.other_history = self.create_history(self.other_user)
        self.url = reverse('dispensehistory-list')
        self.history_url = reverse(
            'dispensehistory-detail',
            kwargs={'pk': self.dispense_history.pk}
        )
        self.other_history_url = reverse(
            'dispensehistory-detail',
            kwargs={'pk': self.other_history.pk}
        )
        self.client.force_authenticate(user=self.user)

    def test_get_dispense_histories_list_customer(self):
        for counter in range(10):
            self.create_history(self.other_user)

        response = self.client.get(self.url)
        self.assertEqual(response.data['count'], 1)

    def test_get_dispense_history_detail_customer(self):
        response = self.client.get(self.history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_dispense_history_detail_not_owner(self):
        response = self.client.get(self.other_history_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TestDispenseHistorySalesRepresentative(CreateDispenseHistoryMixin,
                                             APITestCase):
    """
    Test cases for :model:`dispense.DispenseHistory`
    using a sales representative
    """

    def setUp(self):
        self.fake = Faker()
        self.user = RegularUserFactory()
        self.dispense_history = self.create_history(self.user)
        self.other_user = RegularUserFactory()
        self.other_history = self.create_history(self.other_user)
        self.url = reverse('dispensehistory-list')
        self.history_url = reverse(
            'dispensehistory-detail',
            kwargs={'pk': self.dispense_history.pk}
        )
        self.other_history_url = reverse(
            'dispensehistory-detail',
            kwargs={'pk': self.other_history.pk}
        )
        self.client.force_authenticate(user=self.user)

    def test_get_dispense_histories_list_sales_representative(self):
        for counter in range(10):
            self.create_history(self.other_user)

        response = self.client.get(self.url)
        self.assertEqual(response.data['count'], 1)

    def test_get_dispense_history_detail_sales_representative(self):
        response = self.client.get(self.history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_dispense_history_detail_not_owner(self):
        response = self.client.get(self.other_history_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
