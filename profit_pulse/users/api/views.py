import random
from string import ascii_letters, digits

from django.utils import timezone
from rest_framework import status
from rest_framework.generics import (
    RetrieveAPIView,
)
from rest_framework.serializers import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from profit_pulse.profiles.mailer import ProfilesMailer

from .serializers import UserSerializer
from ..models import ForgotPasswordToken, User


class LoggedInUser(RetrieveAPIView):
    """
    Returns user details about the logged in user
    """
    model = User
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated, )

    def get_object(self):
        return self.request.user


class ForgotPasswordMobile(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        token = ''.join(random.choices(ascii_letters + digits, k=8))
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'detail': ['No user matching that email address.']}, status=status.HTTP_400_BAD_REQUEST)

        if user.forgot_password_tokens.exists():
            user.forgot_password_tokens.update(is_expired=True)

        token = user.forgot_password_tokens.create(
            token=token,
            is_expired=False,
            expiration_datetime=timezone.now() + timezone.timedelta(hours=1)
        )
        mailer = ProfilesMailer()
        mailer.send_profile_password_reset_email_mobile(user, token.token)
        return Response({'token': token.token})


class ResetPasswordMobile(APIView):
    def post(self, request, *args, **kwargs):
        password = request.data.get('password')
        password_confirm = request.data.get('confirm_password')
        token = request.data.get('token')
        try:
            token = ForgotPasswordToken.objects.get(token=token, is_expired=False, expiration_datetime__gte=timezone.now())
        except ForgotPasswordToken.DoesNotExist:
            raise ValidationError('Verification code does not match.')

        if password == password_confirm:
            token.user.set_password(password)
            token.user.save()
            token.is_expired = True
            token.save()
            return Response({'message': 'Password successfully changed.'}, status=status.HTTP_200_OK)

        raise ValidationError('Password did not match.')
