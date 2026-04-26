from django.urls import path
from .views import (
    LoginView, LogoutView, MeView, RegisterView,
    RequestOTPView, VerifyOTPView,
    ForgotPasswordView, ResetPasswordView,
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('auth/request-otp/', RequestOTPView.as_view(), name='auth-request-otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='auth-verify-otp'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='auth-reset-password'),
]
