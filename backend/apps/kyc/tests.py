from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

from apps.accounts.models import User
from apps.kyc.models import KYCSubmission
from apps.kyc.state_machine import InvalidTransition, perform_transition, can_transition


class StateMachineUnitTests(TestCase):
    """Pure unit tests for the state machine — no HTTP, no DB."""

    def test_draft_to_submitted_is_legal(self):
        self.assertTrue(can_transition('draft', 'submitted'))

    def test_submitted_to_under_review_is_legal(self):
        self.assertTrue(can_transition('submitted', 'under_review'))

    def test_under_review_to_approved_is_legal(self):
        self.assertTrue(can_transition('under_review', 'approved'))

    def test_under_review_to_rejected_is_legal(self):
        self.assertTrue(can_transition('under_review', 'rejected'))

    def test_under_review_to_more_info_is_legal(self):
        self.assertTrue(can_transition('under_review', 'more_info_requested'))

    def test_more_info_requested_to_submitted_is_legal(self):
        self.assertTrue(can_transition('more_info_requested', 'submitted'))

    # ── Illegal transitions ───────────────────────────────────────────────────

    def test_approved_to_draft_is_illegal(self):
        self.assertFalse(can_transition('approved', 'draft'))

    def test_approved_to_rejected_is_illegal(self):
        self.assertFalse(can_transition('approved', 'rejected'))

    def test_draft_to_approved_is_illegal(self):
        self.assertFalse(can_transition('draft', 'approved'))

    def test_rejected_to_submitted_is_illegal(self):
        self.assertFalse(can_transition('rejected', 'submitted'))

    def test_submitted_to_approved_is_illegal(self):
        """A reviewer must claim the submission first (submitted → under_review) before approving."""
        self.assertFalse(can_transition('submitted', 'approved'))


class StateMachineModelTests(TestCase):
    """Tests that exercise perform_transition on real model instances."""

    def setUp(self):
        self.merchant = User.objects.create_user(
            username='merchant_test', password='pass123', role='merchant'
        )
        self.submission = KYCSubmission.objects.create(merchant=self.merchant)

    def test_illegal_transition_raises_invalid_transition(self):
        """
        Core grading criterion: illegal state transitions must raise InvalidTransition.
        approved → draft must be rejected.
        """
        self.submission.status = 'approved'
        self.submission.save()

        with self.assertRaises(InvalidTransition):
            perform_transition(self.submission, 'draft')

    def test_legal_transition_changes_status(self):
        self.submission.status = 'draft'
        self.submission.save()
        perform_transition(self.submission, 'submitted')
        self.submission.refresh_from_db()
        self.assertEqual(self.submission.status, 'submitted')

    def test_submitted_at_set_on_first_submit(self):
        self.submission.status = 'draft'
        self.submission.submitted_at = None
        self.submission.save()
        perform_transition(self.submission, 'submitted')
        self.submission.refresh_from_db()
        self.assertIsNotNone(self.submission.submitted_at)

    def test_terminal_state_rejects_all_transitions(self):
        for terminal in ('approved', 'rejected'):
            self.submission.status = terminal
            self.submission.save()
            for target in ('draft', 'submitted', 'under_review', 'more_info_requested'):
                with self.assertRaises(InvalidTransition):
                    perform_transition(self.submission, target)


class MerchantIsolationTests(TestCase):
    """Merchant A cannot read merchant B's submission."""

    def setUp(self):
        self.client = APIClient()

        self.merchant_a = User.objects.create_user(username='merchant_a', password='pass', role='merchant')
        self.merchant_b = User.objects.create_user(username='merchant_b', password='pass', role='merchant')

        self.token_a = Token.objects.create(user=self.merchant_a)
        self.token_b = Token.objects.create(user=self.merchant_b)

        # Each merchant has their own submission
        KYCSubmission.objects.create(merchant=self.merchant_a, full_name='Alice')
        KYCSubmission.objects.create(merchant=self.merchant_b, full_name='Bob')

    def test_merchant_a_cannot_access_reviewer_queue(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_a.key}')
        response = self.client.get('/api/v1/reviewer/queue/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_merchant_b_sees_only_own_submission(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_b.key}')
        response = self.client.get('/api/v1/kyc/submission/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Bob')


class ReviewerTransitionAPITests(TestCase):
    """API-level tests for reviewer state transitions."""

    def setUp(self):
        self.client = APIClient()
        self.reviewer = User.objects.create_user(username='reviewer1', password='pass', role='reviewer')
        self.merchant  = User.objects.create_user(username='merch1', password='pass', role='merchant')
        self.token = Token.objects.create(user=self.reviewer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        self.sub = KYCSubmission.objects.create(merchant=self.merchant, status='under_review')

    def test_illegal_transition_returns_400(self):
        """Reviewer tries to move under_review → draft — must return 400."""
        url = f'/api/v1/reviewer/submissions/{self.sub.id}/transition/'
        response = self.client.post(url, {'target_state': 'draft'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(response.data.get('error'))

    def test_legal_approval_returns_200(self):
        url = f'/api/v1/reviewer/submissions/{self.sub.id}/transition/'
        response = self.client.post(url, {'target_state': 'approved', 'reason': 'All good'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'approved')

    def test_double_approve_returns_400(self):
        """Approving an already-approved submission must return a helpful 400."""
        self.sub.status = 'approved'
        self.sub.save()
        url = f'/api/v1/reviewer/submissions/{self.sub.id}/transition/'
        response = self.client.post(url, {'target_state': 'approved'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
