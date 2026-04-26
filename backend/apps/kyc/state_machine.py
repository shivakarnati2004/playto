"""
State machine for KYC submission lifecycle.

This is the SINGLE source of truth for all valid state transitions.
No transition logic lives anywhere else in the codebase.

States:
    draft             → Merchant is filling the form (not submitted yet)
    submitted         → Merchant submitted; waiting for a reviewer
    under_review      → A reviewer has claimed and is actively reviewing
    approved          → Reviewer approved the submission
    rejected          → Reviewer rejected the submission (terminal)
    more_info_requested → Reviewer needs more documents/info from merchant

Legal transitions:
    draft                → submitted
    submitted            → under_review
    under_review         → approved | rejected | more_info_requested
    more_info_requested  → submitted   (merchant re-submits after providing info)
"""

from django.utils import timezone

# ── Transition table ──────────────────────────────────────────────────────────

VALID_TRANSITIONS: dict[str, list[str]] = {
    'draft':                 ['submitted'],
    'submitted':             ['under_review'],
    'under_review':          ['approved', 'rejected', 'more_info_requested'],
    'more_info_requested':   ['submitted'],
    'approved':              [],   # terminal
    'rejected':              [],   # terminal
}

# States where a reviewer is expected to act
REVIEWER_STATES = {'submitted', 'under_review'}

# States that are considered terminal (no further transitions)
TERMINAL_STATES = {'approved', 'rejected'}


class InvalidTransition(Exception):
    """Raised when a requested state transition is not permitted."""
    pass


# ── Public API ─────────────────────────────────────────────────────────────────

def can_transition(current_state: str, target_state: str) -> bool:
    """Return True if the transition is legally permitted."""
    return target_state in VALID_TRANSITIONS.get(current_state, [])


def allowed_next_states(current_state: str) -> list[str]:
    """Return the list of states that are reachable from current_state."""
    return VALID_TRANSITIONS.get(current_state, [])


def perform_transition(submission, target_state: str, actor=None, reason: str = '') -> None:
    """
    Apply a state transition to a KYCSubmission instance and save it.

    Args:
        submission:   KYCSubmission model instance.
        target_state: The state to move to.
        actor:        The User performing the transition (reviewer or merchant).
        reason:       Optional reviewer note / rejection reason.

    Raises:
        InvalidTransition: If the transition is not in VALID_TRANSITIONS.
    """
    current = submission.status
    allowed = VALID_TRANSITIONS.get(current, [])

    if target_state not in allowed:
        terminal_msg = " This is a terminal state." if current in TERMINAL_STATES else ""
        allowed_msg = (
            f"Allowed next states: {', '.join(allowed)}."
            if allowed
            else f"No further transitions are permitted from '{current}'.{terminal_msg}"
        )
        raise InvalidTransition(
            f"Cannot transition from '{current}' to '{target_state}'. {allowed_msg}"
        )

    now = timezone.now()

    # Record when a submission first enters the review queue
    if target_state == 'submitted' and submission.submitted_at is None:
        submission.submitted_at = now

    # Reviewer claim: record who picked it up
    if target_state == 'under_review' and actor is not None:
        submission.reviewer = actor

    if reason:
        submission.reviewer_notes = reason

    submission.status = target_state
    submission.updated_at = now
    submission.save(update_fields=['status', 'submitted_at', 'reviewer', 'reviewer_notes', 'updated_at'])
