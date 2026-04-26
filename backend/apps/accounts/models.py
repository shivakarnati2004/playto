from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_MERCHANT = 'merchant'
    ROLE_REVIEWER = 'reviewer'
    ROLE_CHOICES = [
        (ROLE_MERCHANT, 'Merchant'),
        (ROLE_REVIEWER, 'Reviewer'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_MERCHANT)
    phone = models.CharField(max_length=20, blank=True)
    is_email_verified = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)

    @property
    def is_merchant(self):
        return self.role == self.ROLE_MERCHANT

    @property
    def is_reviewer(self):
        return self.role == self.ROLE_REVIEWER

    def __str__(self):
        return f"{self.username} ({self.role})"
