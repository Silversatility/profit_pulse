# -*- coding: utf-8 -*-
from __future__ import absolute_import

import logging

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from profit_pulse.core.mailer import BaseMailer

logger = logging.getLogger(__name__)


class ProfilesMailer(BaseMailer):

    def _generate_uidb64_token(self, user):
        token_generator = default_token_generator
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk)).decode()
        token = token_generator.make_token(user)
        return (uidb64, token)

    def _get_current_site(self, user_type):
        lookup = {
            'manager': settings.ADMIN_PORTAL_URL,
            'customer': settings.CUSTOMER_PORTAL_URL
        }
        return lookup[user_type]

    def send_portal_access_credentials(self, profile):
        """
        Sends email to user if the portal access in the profile
        was marked as `True`.
        """
        user = profile.user
        uidb64, token = self._generate_uidb64_token(user)
        subject = 'Welcome to your Karis Pharma Portal!'
        context = {
            "user": user,
            "uidb64": uidb64,
            "token": token,
            "current_site": settings.CUSTOMER_PORTAL_URL,
        }
        email_template = 'profiles/email/portal_access.html'
        return self.send_mail(
            subject,
            email_template,
            user.email,
            context
        )

    def send_profile_password_reset_email(self, profile, user_type):
        """
        Sends email to manager when invoking the forgot password form.
        """
        user = profile.user
        uidb64, token = self._generate_uidb64_token(user)
        subject = 'Karis Pharma Portal - Forgot Password'

        context = {
            "user": user,
            "uidb64": uidb64,
            "token": token,
            "current_site": self._get_current_site(user_type),
        }
        email_template = 'profiles/email/forgot_password.html'
        return self.send_mail(
            subject,
            email_template,
            user.email,
            context
        )

    def send_profile_password_reset_email_mobile(self, user, token):
        """
        Sends email to manager when invoking the forgot password form.
        """
        subject = 'Karis Pharma Portal Mobile - Forgot Password'

        context = {
            "user": user,
            "token": token,
        }
        email_template = 'profiles/email/forgot_password_mobile.html'
        return self.send_mail(
            subject,
            email_template,
            user.email,
            context
        )
