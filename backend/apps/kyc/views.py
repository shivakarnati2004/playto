from datetime import timedelta

from django.db.models import Avg, Count, F, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Document, KYCSubmission, NotificationEvent
from .permissions import IsMerchant, IsReviewer
from .serializers import (
    DocumentSerializer,
    DocumentUploadSerializer,
    KYCSubmissionSerializer,
    KYCSubmissionUpdateSerializer,
    NotificationEventSerializer,
    ReviewerQueueSerializer,
    ReviewerTransitionSerializer,
)
from .state_machine import InvalidTransition, perform_transition


# ── Helpers ───────────────────────────────────────────────────────────────────

def _log_notification(merchant, event_type: str, payload: dict) -> None:
    NotificationEvent.objects.create(
        merchant=merchant,
        event_type=event_type,
        payload=payload,
    )


def _get_merchant_submission(user):
    """Fetch the submission owned by this merchant (or 404)."""
    try:
        return KYCSubmission.objects.get(merchant=user)
    except KYCSubmission.DoesNotExist:
        return None


# ── Merchant endpoints ────────────────────────────────────────────────────────

class MerchantSubmissionView(APIView):
    """
    GET  /api/v1/kyc/submission/  — retrieve own submission (creates draft if none)
    PUT  /api/v1/kyc/submission/  — save progress
    """
    permission_classes = [IsMerchant]

    def _get_or_create(self, user):
        submission, _ = KYCSubmission.objects.get_or_create(merchant=user)
        return submission

    def get(self, request):
        submission = self._get_or_create(request.user)
        serializer = KYCSubmissionSerializer(submission, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        submission = self._get_or_create(request.user)

        if submission.status not in ('draft', 'more_info_requested'):
            return Response(
                {'error': True, 'message': 'You can only edit a submission in draft or more_info_requested state.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = KYCSubmissionUpdateSerializer(submission, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(KYCSubmissionSerializer(submission, context={'request': request}).data)


class MerchantSubmitView(APIView):
    """
    POST /api/v1/kyc/submission/submit/  — move draft/more_info_requested → submitted
    """
    permission_classes = [IsMerchant]

    def post(self, request):
        submission = _get_merchant_submission(request.user)
        if submission is None:
            return Response(
                {'error': True, 'message': 'No KYC submission found. Please fill the form first.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            perform_transition(submission, 'submitted', actor=request.user)
        except InvalidTransition as exc:
            return Response(
                {'error': True, 'message': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _log_notification(
            merchant=request.user,
            event_type='kyc_submitted',
            payload={'submission_id': str(submission.id), 'submitted_at': str(submission.submitted_at)},
        )
        return Response(KYCSubmissionSerializer(submission, context={'request': request}).data)


class DocumentUploadView(APIView):
    """
    POST /api/v1/kyc/documents/  — upload a KYC document
    GET  /api/v1/kyc/documents/  — list own documents
    """
    permission_classes = [IsMerchant]

    def get(self, request):
        submission = _get_merchant_submission(request.user)
        if submission is None:
            return Response([])
        docs = submission.documents.all()
        return Response(DocumentSerializer(docs, many=True, context={'request': request}).data)

    def post(self, request):
        submission = _get_merchant_submission(request.user)
        if submission is None:
            return Response(
                {'error': True, 'message': 'Complete your KYC form before uploading documents.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if submission.status not in ('draft', 'more_info_requested'):
            return Response(
                {'error': True, 'message': 'Documents can only be uploaded in draft or more_info_requested state.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = DocumentUploadSerializer(
            data=request.data,
            context={'submission': submission, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        doc = serializer.save()
        return Response(
            DocumentSerializer(doc, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class MerchantNotificationsView(APIView):
    """GET /api/v1/kyc/notifications/"""
    permission_classes = [IsMerchant]

    def get(self, request):
        events = NotificationEvent.objects.filter(merchant=request.user)[:20]
        return Response(NotificationEventSerializer(events, many=True).data)


# ── Reviewer endpoints ────────────────────────────────────────────────────────

class ReviewerQueueView(APIView):
    """
    GET /api/v1/reviewer/queue/

    Returns all submissions that are submitted or under_review, oldest first.
    Annotates each with at_risk (SLA > 24 h) computed at query time.
    """
    permission_classes = [IsReviewer]

    def get(self, request):
        submissions = (
            KYCSubmission.objects
            .filter(status__in=['submitted', 'under_review'])
            .select_related('merchant', 'reviewer')
            .prefetch_related('documents')
            .order_by('submitted_at')
        )
        serializer = ReviewerQueueSerializer(submissions, many=True)
        return Response(serializer.data)


class ReviewerMetricsView(APIView):
    """
    GET /api/v1/reviewer/metrics/

    Dashboard metrics:
      - queue_count        : submissions waiting (submitted | under_review)
      - avg_time_in_queue  : seconds (avg time from submitted_at to now for active queue)
      - approval_rate_7d   : 0–100 % over the last 7 days
      - at_risk_count      : submitted/under_review older than 24 h
    """
    permission_classes = [IsReviewer]

    def get(self, request):
        now = timezone.now()
        sla_threshold = now - timedelta(hours=24)
        week_ago = now - timedelta(days=7)

        queue_qs = KYCSubmission.objects.filter(status__in=['submitted', 'under_review'])
        queue_count = queue_qs.count()

        # Average seconds in queue (for currently-waiting submissions)
        # We compute this in Python to stay portable across SQLite and Postgres
        waiting = list(queue_qs.values_list('submitted_at', flat=True))
        if waiting:
            avg_seconds = sum(
                (now - s).total_seconds() for s in waiting if s
            ) / len(waiting)
        else:
            avg_seconds = 0

        at_risk_count = queue_qs.filter(submitted_at__lt=sla_threshold).count()

        # Approval rate over last 7 days
        resolved_qs = KYCSubmission.objects.filter(
            status__in=['approved', 'rejected'],
            updated_at__gte=week_ago,
        )
        total_resolved = resolved_qs.count()
        approved_count = resolved_qs.filter(status='approved').count()
        approval_rate = round((approved_count / total_resolved) * 100, 1) if total_resolved else 0

        return Response({
            'queue_count':       queue_count,
            'avg_time_in_queue': round(avg_seconds),
            'approval_rate_7d':  approval_rate,
            'at_risk_count':     at_risk_count,
            'total_resolved_7d': total_resolved,
        })


class ReviewerSubmissionDetailView(APIView):
    """
    GET  /api/v1/reviewer/submissions/<id>/  — view full submission detail
    POST /api/v1/reviewer/submissions/<id>/transition/  — change state
    """
    permission_classes = [IsReviewer]

    def _get_submission(self, pk):
        try:
            return KYCSubmission.objects.select_related('merchant', 'reviewer').prefetch_related('documents').get(pk=pk)
        except KYCSubmission.DoesNotExist:
            return None

    def get(self, request, pk):
        submission = self._get_submission(pk)
        if submission is None:
            return Response({'error': True, 'message': 'Submission not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(KYCSubmissionSerializer(submission, context={'request': request}).data)

    def post(self, request, pk):
        submission = self._get_submission(pk)
        if submission is None:
            return Response({'error': True, 'message': 'Submission not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReviewerTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target_state = serializer.validated_data['target_state']
        reason       = serializer.validated_data.get('reason', '')

        try:
            perform_transition(submission, target_state, actor=request.user, reason=reason)
        except InvalidTransition as exc:
            return Response(
                {'error': True, 'message': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _log_notification(
            merchant=submission.merchant,
            event_type=f'kyc_{target_state}',
            payload={
                'submission_id': str(submission.id),
                'reviewer': request.user.username,
                'reason': reason,
                'timestamp': str(timezone.now()),
            },
        )

        return Response(KYCSubmissionSerializer(submission, context={'request': request}).data)


class ReviewerAllSubmissionsView(APIView):
    """GET /api/v1/reviewer/submissions/ — all submissions (any status)"""
    permission_classes = [IsReviewer]

    def get(self, request):
        qs = (
            KYCSubmission.objects
            .select_related('merchant', 'reviewer')
            .prefetch_related('documents')
            .order_by('-updated_at')
        )
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        serializer = ReviewerQueueSerializer(qs, many=True)
        return Response(serializer.data)
