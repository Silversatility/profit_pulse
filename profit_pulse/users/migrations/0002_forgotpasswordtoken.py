# Generated by Django 2.0.5 on 2019-12-18 05:51

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ForgotPasswordToken',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(max_length=1024)),
                ('is_expired', models.BooleanField(default=False)),
                ('expiration_date', models.DateTimeField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='tokens', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
