from django.core.management.base import BaseCommand
from profit_pulse.products.models import Product


class Command(BaseCommand):
    help = "Merge products duplicated by earlier dispense import runs"

    def handle(self, *args, **options):
        has_duplicates = True
        while has_duplicates:
            has_duplicates = False
            for product in Product.objects.filter(is_active=True):
                duplicates = Product.objects.exclude(id=product.id).filter(ndc=product.ndc, is_active=True)
                if duplicates.count() > 0:
                    for duplicate in duplicates:
                        duplicate.dispense_histories.all().update(product=product)
                        duplicate.is_active = False
                        duplicate.save()
                        print('{}: Duplicated product #{} merged to #{}'.format(product.ndc, duplicate.id, product.id))
                    has_duplicates = True
                    break
