# Generated by Django 2.0.5 on 2019-12-18 05:51

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_forgotpasswordtoken'),
    ]

    operations = [
        migrations.AlterField(
            model_name='forgotpasswordtoken',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tokens', to=settings.AUTH_USER_MODEL),
        ),
    ]