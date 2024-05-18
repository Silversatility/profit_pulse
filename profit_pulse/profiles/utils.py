from datetime import date

from django.db.models import Q, Sum
from django.utils import timezone

def get_transaction_fee(customer, start_date, end_date, transactions):
    transaction_fees = []
    for fs in customer.fee_structures.filter(
        Q(end_date__gte=start_date) | Q(end_date__isnull=True), start_date__lte=end_date
    ):
        new_start_date = max(start_date, fs.start_date)
        new_end_date = min(end_date, fs.end_date or max(timezone.localtime().date(), end_date))

        total = transactions.filter(
            customer=customer,
            order_date__date__range=(new_start_date, new_end_date)
        ).aggregate(total=Sum('total_paid'))['total'] or 0
        transaction_fees.append(total * fs.billing_percentage / 100)
    return sum(transaction_fees)


def get_software_fee(customer, start_date, end_date):
    software_fees = []
    for fs in customer.fee_structures.filter(
        Q(end_date__gte=start_date) | Q(end_date__isnull=True), start_date__lte=end_date
    ):
        new_start_date = max(start_date, fs.start_date)
        new_end_date = min(end_date, fs.end_date or max(timezone.localtime().date(), end_date))
        monthly_fee_start_date = customer.monthly_fee_start_date

        if monthly_fee_start_date and monthly_fee_start_date <= new_end_date:
            new_start_date = max(new_start_date, monthly_fee_start_date)
            months = (new_end_date.year - new_start_date.year) * 12 + (new_end_date.month - new_start_date.month)
            if new_start_date.day <= 15 and new_end_date.day >= 15:
                months += 1
            elif new_start_date.day > 15 and new_end_date.day < 15 and new_start_date < new_end_date:
                months += -1
            software_fees.append(fs.monthly_fee * months)
    return sum(software_fees)


def get_switching_charges(customer, start_date, end_date, switching_fees):
    switching_charges = []
    for fs in customer.fee_structures.filter(
        Q(end_date__gte=start_date) | Q(end_date__isnull=True), start_date__lte=end_date
    ):
        new_start_date = max(start_date, fs.start_date)
        new_end_date = min(end_date, fs.end_date or max(timezone.localtime().date(), end_date))

        total = switching_fees.filter(
            customer=customer,
            order_date__date__range=(new_start_date, new_end_date)
        ).aggregate(total=Sum('amount'))['total'] or 0
        switching_charges.append(total * fs.switching_fee)
    return sum(switching_charges)
