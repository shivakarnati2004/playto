#!/usr/bin/env python
"""
Seed script — creates test users and submissions.

Usage (from /backend):
    python seed.py

Accounts created:
    merchant1 / password123   -> KYC in 'draft'
    merchant2 / password123   -> KYC in 'under_review'
    reviewer1 / password123   -> Reviewer dashboard access
"""

import os
import sys
import django
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from datetime import timedelta
from apps.accounts.models import User
from apps.kyc.models import KYCSubmission, NotificationEvent
from rest_framework.authtoken.models import Token


def create_user(username, password, role, email=''):
    user, created = User.objects.get_or_create(username=username, defaults={
        'email': email or f'{username}@playto.test',
        'role': role,
    })
    if created:
        user.set_password(password)
        user.save()
        print(f"  + Created {role}: {username}")
    else:
        print(f"  * Exists:  {role}: {username}")
    token, _ = Token.objects.get_or_create(user=user)
    return user, token


def run():
    print("\n-- Playto KYC Seed --------------------------------------")

    # Users
    m1, t1 = create_user('merchant1', 'password123', 'merchant', 'merchant1@example.com')
    m2, t2 = create_user('merchant2', 'password123', 'merchant', 'merchant2@example.com')
    rv, tr  = create_user('reviewer1', 'password123', 'reviewer', 'reviewer@playtopay.com')

    print(f"\n  Tokens:")
    print(f"    merchant1 -> {t1.key}")
    print(f"    merchant2 -> {t2.key}")
    print(f"    reviewer1 -> {tr.key}")

    # Merchant 1 — draft submission
    sub1, _ = KYCSubmission.objects.get_or_create(merchant=m1, defaults={
        'full_name': 'Arjun Sharma',
        'email': 'arjun@example.com',
        'phone': '+91 98765 43210',
        'business_name': 'Arjun Designs',
        'business_type': 'individual',
        'monthly_volume': 2500.00,
        'status': 'draft',
    })
    print(f"\n  + merchant1 KYC: {sub1.status} (id={sub1.id})")

    # Merchant 2 — under_review, submitted >24 h ago (at-risk)
    sub2, created2 = KYCSubmission.objects.get_or_create(merchant=m2, defaults={
        'full_name': 'Priya Nair',
        'email': 'priya@example.com',
        'phone': '+91 91234 56789',
        'business_name': 'Nair Creative Studio',
        'business_type': 'sole_proprietor',
        'monthly_volume': 8000.00,
        'status': 'under_review',
        'reviewer': rv,
        'submitted_at': timezone.now() - timedelta(hours=30),  # at-risk
    })
    if created2:
        NotificationEvent.objects.create(
            merchant=m2,
            event_type='kyc_submitted',
            payload={'submission_id': str(sub2.id)},
        )
        NotificationEvent.objects.create(
            merchant=m2,
            event_type='kyc_under_review',
            payload={'submission_id': str(sub2.id), 'reviewer': rv.username},
        )
    print(f"  + merchant2 KYC: {sub2.status}, at_risk={sub2.is_at_risk} (id={sub2.id})")

    print("\n-- Done -------------------------------------------------")
    print("  Login at http://localhost:5173")
    print("  Merchant: merchant1 / password123  (draft)")
    print("  Merchant: merchant2 / password123  (under review)")
    print("  Reviewer: reviewer1 / password123\n")


if __name__ == '__main__':
    run()
