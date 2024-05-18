from __future__ import unicode_literals

from django.core.mail import send_mail
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _

from model_utils.models import TimeStampedModel, SoftDeletableModel

from .signals import user_post_save


class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """
        Creates and saves a User with the given email and password.
        """
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


@python_2_unicode_compatible
class User(SoftDeletableModel,
           TimeStampedModel,
           AbstractBaseUser,
           PermissionsMixin):
    has_local_auth = models.BooleanField(default=False)
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('first name'), max_length=30, blank=True)
    last_name = models.CharField(_('last name'), max_length=30, blank=True)
    is_owner = models.BooleanField(_('owner'), default=True)
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into this admin site.'),
    )
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_(
            'Designates whether this user should be treated as active. '
            'Unselect this instead of deleting accounts.'
        ),
    )
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    def clean(self):
        super(User, self).clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def get_full_name(self):
        """
        Returns the first_name plus the last_name, with a space in between.
        """
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        "Returns the short name for the user."
        return self.first_name

    def email_user(self, subject, message, from_email=None, **kwargs):
        """
        Sends an email to this User.
        """
        send_mail(subject, message, from_email, [self.email], **kwargs)

    @property
    def is_sales_representative(self):
        return hasattr(self, 'sales_representative') and \
            self.sales_representative is not None

    @property
    def is_customer(self):
        return hasattr(self, 'customer') and self.customer is not None

    @property
    def is_manager(self):
        return hasattr(self, 'manager') and self.manager is not None

    @property
    def is_admin(self):
        return self.is_superuser or self.is_manager


class ForgotPasswordToken(models.Model):
    user = models.ForeignKey(User, related_name='forgot_password_tokens', on_delete=models.CASCADE)
    token = models.CharField(max_length=8)
    is_expired = models.BooleanField(default=False)
    expiration_datetime = models.DateTimeField()

# SIGNALS


models.signals.post_save.connect(user_post_save, sender=User)
