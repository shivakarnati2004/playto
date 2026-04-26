from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer
from .models import User
import random
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
import threading


def _generate_otp():
    """Generate a 6-digit OTP string."""
    length = getattr(settings, 'OTP_LENGTH', 6)
    lower = 10 ** (length - 1)
    upper = (10 ** length) - 1
    return str(random.randint(lower, upper))


def _send_otp_email(email, otp):
    """Send OTP email in a background thread so it doesn't block the request."""
    def _send():
        try:
            send_mail(
                'Playto KYC - Your Verification Code',
                f'Your verification code is: {otp}. It is valid for {getattr(settings, "OTP_EXPIRY_MINUTES", 10)} minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=True,
            )
        except Exception:
            pass  # Don't crash the thread
    t = threading.Thread(target=_send, daemon=True)
    t.start()


class RegisterView(APIView):
    """Register a new merchant account and auto-send OTP for email verification."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)

        # Auto-generate and send OTP
        otp = _generate_otp()
        user.otp = otp
        user.otp_created_at = timezone.now()
        user.save()
        _send_otp_email(user.email, otp)

        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data,
                'otp_sent': True,
                'message': 'Account created. Please verify your email with the OTP sent to your inbox.',
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'detail': 'Logged out successfully.'})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class RequestOTPView(APIView):
    """Resend OTP to the authenticated user's email."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_email_verified:
            return Response({'detail': 'Email already verified.'}, status=status.HTTP_400_BAD_REQUEST)

        otp = _generate_otp()
        user.otp = otp
        user.otp_created_at = timezone.now()
        user.save()
        _send_otp_email(user.email, otp)

        return Response({'detail': 'OTP sent to email.'})


class VerifyOTPView(APIView):
    """Verify the OTP and mark the user's email as verified."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        otp = request.data.get('otp')

        if not otp:
            return Response({'detail': 'OTP is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_email_verified:
            return Response({'detail': 'Email already verified.'}, status=status.HTTP_400_BAD_REQUEST)

        if user.otp != str(otp):
            return Response({'detail': 'Invalid OTP. Please check and try again.'}, status=status.HTTP_400_BAD_REQUEST)

        expiry_minutes = getattr(settings, 'OTP_EXPIRY_MINUTES', 10)
        if user.otp_created_at and timezone.now() > user.otp_created_at + timedelta(minutes=expiry_minutes):
            return Response({'detail': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_email_verified = True
        user.otp = None
        user.save()
        return Response({'detail': 'Email verified successfully.'})


class ForgotPasswordView(APIView):
    """Send OTP to email for password reset. No auth required."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal whether the email exists
            return Response({'detail': 'If this email is registered, an OTP has been sent.'})

        otp = _generate_otp()
        user.otp = otp
        user.otp_created_at = timezone.now()
        user.save()
        _send_otp_email(user.email, otp)

        return Response({'detail': 'If this email is registered, an OTP has been sent.'})


class ResetPasswordView(APIView):
    """Verify OTP and reset password. No auth required."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        otp = request.data.get('otp', '').strip()
        new_password = request.data.get('new_password', '')

        if not email or not otp or not new_password:
            return Response({'detail': 'Email, OTP, and new password are all required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({'detail': 'Password must be at least 6 characters.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid email or OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        if user.otp != str(otp):
            return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        expiry_minutes = getattr(settings, 'OTP_EXPIRY_MINUTES', 10)
        if user.otp_created_at and timezone.now() > user.otp_created_at + timedelta(minutes=expiry_minutes):
            return Response({'detail': 'OTP has expired. Please request a new one.'},
                            status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.otp = None
        user.is_email_verified = True  # They proved they own the email
        user.save()

        return Response({'detail': 'Password reset successfully. You can now log in.'})
