import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class KYCSubmission(models.Model):
    STATUS_CHOICES = [
        ('draft',                'Draft'),
        ('submitted',            'Submitted'),
        ('under_review',         'Under Review'),
        ('approved',             'Approved'),
        ('rejected',             'Rejected'),
        ('more_info_requested',  'More Info Requested'),
    ]

    BUSINESS_TYPE_CHOICES = [
        ('individual',       'Individual / Freelancer'),
        ('sole_proprietor',  'Sole Proprietorship'),
        ('partnership',      'Partnership'),
        ('private_limited',  'Private Limited'),
        ('llp',              'LLP'),
        ('other',            'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    merchant = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='kyc_submission',
    )

    # Step 1 – Personal details
    full_name    = models.CharField(max_length=255, blank=True)
    email        = models.EmailField(blank=True)
    phone        = models.CharField(max_length=20, blank=True)

    # Step 2 – Business details
    business_name   = models.CharField(max_length=255, blank=True)
    business_type   = models.CharField(max_length=30, choices=BUSINESS_TYPE_CHOICES, blank=True)
    monthly_volume  = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)

    # Review
    status          = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft', db_index=True)
    reviewer        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_submissions',
    )
    reviewer_notes  = models.TextField(blank=True)

    # Timestamps
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)
    submitted_at  = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        ordering = ['submitted_at', 'created_at']

    def __str__(self):
        return f"KYC({self.merchant.username}) [{self.status}]"

    # ── SLA helper ─────────────────────────────────────────────────────────────
    @property
    def is_at_risk(self) -> bool:
        """
        A submission is at-risk when it has been waiting for more than 24 hours.
        Computed dynamically so the flag never goes stale.
        """
        if self.status not in ('submitted', 'under_review'):
            return False
        if self.submitted_at is None:
            return False
        return (timezone.now() - self.submitted_at).total_seconds() > 86_400  # 24 h


def _document_upload_path(instance, filename):
    return f"kyc_docs/{instance.submission.merchant.username}/{instance.doc_type}/{filename}"


class Document(models.Model):
    DOC_TYPE_CHOICES = [
        ('pan',            'PAN Card'),
        ('aadhaar',        'Aadhaar Card'),
        ('bank_statement', 'Bank Statement'),
    ]

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(KYCSubmission, on_delete=models.CASCADE, related_name='documents')
    doc_type   = models.CharField(max_length=20, choices=DOC_TYPE_CHOICES)
    file       = models.FileField(upload_to=_document_upload_path)
    file_name  = models.CharField(max_length=255, blank=True)
    file_size  = models.PositiveIntegerField(default=0)   # bytes
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Each submission may have at most one document of each type
        unique_together = ('submission', 'doc_type')

    def __str__(self):
        return f"{self.doc_type} for {self.submission.merchant.username}"


class NotificationEvent(models.Model):
    """
    Append-only log of notification events.
    Does not send anything; just records what *should* be sent.
    """
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    merchant   = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_events',
    )
    event_type = models.CharField(max_length=60)   # e.g. "kyc_submitted", "kyc_approved"
    timestamp  = models.DateTimeField(auto_now_add=True)
    payload    = models.JSONField(default=dict)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.event_type} for {self.merchant.username} at {self.timestamp}"
