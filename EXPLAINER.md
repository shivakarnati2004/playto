# EXPLAINER.md

---

## 1. The State Machine

**Where it lives:** `backend/apps/kyc/state_machine.py` — one file, nothing else.

No view, serializer, or model contains transition logic. Every state change in the system calls `perform_transition()`. This is deliberate: if you need to add a new state or change a rule, there is exactly one file to edit.

**The transition table:**

```python
VALID_TRANSITIONS: dict[str, list[str]] = {
    'draft':                 ['submitted'],
    'submitted':             ['under_review'],
    'under_review':          ['approved', 'rejected', 'more_info_requested'],
    'more_info_requested':   ['submitted'],
    'approved':              [],   # terminal
    'rejected':              [],   # terminal
}
```

**How illegal transitions are prevented:**

```python
def perform_transition(submission, target_state, actor=None, reason=''):
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
    # ... rest of the function
```

The view catches `InvalidTransition` and returns a `400` with the message. The caller never needs to check if a transition is valid — `perform_transition` enforces it or raises.

---

## 2. The Upload

**File:** `backend/apps/kyc/file_validation.py`

Three checks run in order. All three must pass or we raise `serializers.ValidationError`.

```python
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

_MAGIC_SIGNATURES = [
    (b'\x25\x50\x44\x46', 'application/pdf'),   # %PDF
    (b'\xff\xd8\xff',      'image/jpeg'),
    (b'\x89\x50\x4e\x47', 'image/png'),
]

def validate_upload(file) -> None:
    # 1. Size check
    if file.size > MAX_SIZE_BYTES:
        size_mb = file.size / (1024 * 1024)
        raise serializers.ValidationError(
            f"File is too large ({size_mb:.1f} MB). Maximum allowed size is 5 MB."
        )

    # 2. Extension check
    _, ext = os.path.splitext(file.name)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise serializers.ValidationError(
            f"Extension '{ext}' is not allowed. Please upload a PDF, JPG, or PNG file."
        )

    # 3. Magic bytes — reads first 8 bytes of actual content
    detected_mime = _detect_mime(file)
    if detected_mime is None:
        raise serializers.ValidationError(
            "File content does not match any supported format (PDF, JPG, PNG)."
        )
```

**What happens if someone sends a 50 MB file?**

Check 1 fires immediately. We read `file.size` (from the `Content-Length` header / in-memory buffer) before reading any content. The response is a `400`:
```json
{ "error": true, "message": "File is too large (50.0 MB). Maximum allowed size is 5 MB." }
```

The magic byte check prevents a renamed `.exe` or `.html` file from slipping through even if it has a `.pdf` extension. The client-side extension check in the browser is a UX hint only — we never trust it.

---

## 3. The Queue

**The query that powers the reviewer queue list** (`backend/apps/kyc/views.py`, `ReviewerQueueView`):

```python
submissions = (
    KYCSubmission.objects
    .filter(status__in=['submitted', 'under_review'])
    .select_related('merchant', 'reviewer')
    .prefetch_related('documents')
    .order_by('submitted_at')
)
```

**Why this way:**

- `filter(status__in=['submitted', 'under_review'])` — only submissions that need attention. Approved/rejected/draft don't belong in a work queue.
- `order_by('submitted_at')` — oldest first. This is the natural FIFO priority: the submission that has been waiting longest gets handled first.
- `select_related('merchant', 'reviewer')` — prevents N+1 queries on the merchant FK. Without this, serializing 100 submissions would fire 100 extra queries.
- `prefetch_related('documents')` — same reason for the documents reverse FK.

**SLA flag:**

The `is_at_risk` property lives on the model and is computed at access time, never stored:

```python
@property
def is_at_risk(self) -> bool:
    if self.status not in ('submitted', 'under_review'):
        return False
    if self.submitted_at is None:
        return False
    return (timezone.now() - self.submitted_at).total_seconds() > 86_400
```

It is never a database column. If I had stored it as a boolean field and set it via a cron job, it would go stale the moment the cron missed a run or the server restarted. A property computed from `submitted_at` is always correct, no cache to invalidate.

The metrics endpoint also computes at-risk count directly from `submitted_at__lt` filtering rather than trusting any stored state.

---

## 4. The Auth

**How merchant A is blocked from seeing merchant B's submission:**

The merchant-facing endpoints use the `IsMerchant` permission class:

```python
class IsMerchant(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_merchant)
```

Then `MerchantSubmissionView` always filters by `merchant=request.user`:

```python
def _get_or_create(self, user):
    submission, _ = KYCSubmission.objects.get_or_create(merchant=user)
    return submission
```

There is no URL parameter for the merchant submission — a merchant only ever sees their own. There is no `GET /kyc/submissions/<id>/` endpoint for merchants. The only way to retrieve a submission as a merchant is `GET /kyc/submission/` (no ID), which always returns the row owned by the authenticated user.

A reviewer uses `IsReviewer` and can access `GET /reviewer/submissions/<id>/` — but that endpoint is gated by `IsReviewer` so a merchant token will never pass it.

The `role` field is set at registration and not user-editable (the `RegisterSerializer.validate_role` prevents self-registering as a reviewer). Reviewers are created via the seed script or Django admin only.

---

## 5. The AI Audit

**The bug:** When I asked the AI to generate the `ReviewerTransitionSerializer`, it initially produced this:

```python
# AI-generated (buggy version)
class ReviewerTransitionSerializer(serializers.Serializer):
    target_state = serializers.ChoiceField(choices=[
        'under_review', 'approved', 'rejected', 'more_info_requested',
        'submitted', 'draft'   # ← BUG: reviewers should never be able to set these
    ])
    reason = serializers.CharField(required=False, allow_blank=True)
```

**What I caught:** The AI included `submitted` and `draft` as valid choices for the `target_state` field. This would allow a reviewer to send `{ "target_state": "draft" }` and bypass the state machine entirely — resetting an approved submission to draft — because the serializer would pass validation before `perform_transition` even ran.

The state machine *would* have caught it (since `approved → draft` is not in `VALID_TRANSITIONS`), but the serializer accepting these values is misleading and creates a false impression that they're valid reviewer actions. It's also a documentation/API contract issue: the serializer is the contract with the client, and it should only advertise actions that are contextually appropriate for reviewers.

**What I replaced it with:**

```python
# Fixed version
class ReviewerTransitionSerializer(serializers.Serializer):
    target_state = serializers.ChoiceField(choices=[
        'under_review', 'approved', 'rejected', 'more_info_requested',
        # 'submitted' and 'draft' deliberately excluded:
        # those transitions belong to the merchant flow, not the reviewer
    ])
    reason = serializers.CharField(required=False, allow_blank=True, default='')
```

This makes the API self-documenting. A reviewer client that reads the schema knows exactly what actions they're allowed to send. The state machine is still the final guard, but the serializer correctly narrows the input space first.

---

*All code in this repository was written and reviewed line by line. The state machine, file validation, and auth isolation were the three areas where I was most careful about AI suggestions, as these are the places where wrong code passes tests but fails in production.*
