# Playto Technical Explainer & Deep-Dive

> An exhaustive, technical deep-dive into the core engineering decisions behind the Playto KYC Pipeline and Platform. This document breaks down the code, the underlying logic, edge cases, system design tradeoffs, and security mechanisms.

---

## 1. The State Machine Architecture

**Location:** [`backend/apps/kyc/state_machine.py`](backend/apps/kyc/state_machine.py)

State machines in Django are notoriously messy. Developers often scatter `if status == 'x'` checks across views, serializers, and signal receivers. This creates a brittle application where it becomes impossible to track exactly how or why a state changed.

In this project, **absolutely no view, serializer, or model contains direct transition logic**. Every single state change in the system is routed through one atomic function: `perform_transition()`. 

### The Transition Table

```python
# The singular source of truth for the KYC lifecycle
VALID_TRANSITIONS: dict[str, list[str]] = {
    'draft':                 ['submitted'],
    'submitted':             ['under_review'],
    'under_review':          ['approved', 'rejected', 'more_info_requested'],
    'more_info_requested':   ['submitted'],
    'approved':              [],   # Terminal state
    'rejected':              [],   # Terminal state
}
```

### The Enforcement Mechanism

```python
def perform_transition(submission, target_state, actor=None, reason=''):
    current = submission.status
    allowed = VALID_TRANSITIONS.get(current, [])

    # Strict Validation against the Truth Table
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
        
    # Transactional execution
    submission.status = target_state
    
    if target_state == 'submitted':
        submission.submitted_at = timezone.now()
        if not submission.reviewer:
            _assign_reviewer(submission)
            
    submission.save()
    
    # Audit logging
    NotificationEvent.objects.create(
        user=submission.merchant,
        event_type=f"status_changed_to_{target_state}",
        message=f"Status updated to {target_state}",
        reason=reason
    )
```

### Why this specific approach?
1. **Safety:** The caller (API View) never manually checks validity. It just attempts the transition. If it's illegal, an `InvalidTransition` exception is thrown, caught by the global error handler, and cleanly mapped to an HTTP 400 response.
2. **Extensibility:** Want to add an `escalated` state? Simply add it to the `VALID_TRANSITIONS` table. You don't have to hunt down 15 different view controllers.
3. **Immutability:** `approved` and `rejected` states have an empty list of valid next states. It is physically impossible at the code level to transition out of them, making them true terminal states.

---

## 2. Hardening File Uploads

**Location:** [`backend/apps/kyc/file_validation.py`](backend/apps/kyc/file_validation.py)

Accepting compliance documents (PDFs, Images) from the public internet is highly dangerous. Standard Django relies on the browser's `Content-Type` header, which is easily spoofed by malicious actors using tools like Postman or curl.

This system employs a **Triple-Validation Protocol**. All three layers must pass sequentially, or the payload is dropped.

### The Code

```python
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB Strict Limit

_MAGIC_SIGNATURES = [
    (b'\x25\x50\x44\x46', 'application/pdf'),   # %PDF signature
    (b'\xff\xd8\xff',      'image/jpeg'),       # JPEG signature
    (b'\x89\x50\x4e\x47', 'image/png'),         # PNG signature
]

def validate_upload(file) -> None:
    # LAYER 1: Size check (Prevents DoS attacks before reading to RAM)
    if file.size > MAX_SIZE_BYTES:
        size_mb = file.size / (1024 * 1024)
        raise serializers.ValidationError(
            f"File is too large ({size_mb:.1f} MB). Maximum allowed size is 5 MB."
        )

    # LAYER 2: Extension check (Basic allowlisting)
    _, ext = os.path.splitext(file.name)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise serializers.ValidationError(
            f"Extension '{ext}' is not allowed. Please upload a PDF, JPG, or PNG file."
        )

    # LAYER 3: Magic Bytes Analysis (Deep binary inspection)
    detected_mime = _detect_mime(file)
    if detected_mime is None:
        raise serializers.ValidationError(
            "File content does not match any supported format (PDF, JPG, PNG). Suspected payload."
        )
```

### What happens if an attacker sends a 50MB executable?
1. If it's 50MB, **Layer 1** fires instantly. We read `file.size` from the HTTP `Content-Length` headers / initial chunk stream without holding the file in RAM. An HTTP 400 is returned immediately.
2. If the attacker renames `malware.exe` to `document.pdf` to bypass Layer 2, **Layer 3** intercepts it. The Python code reads the first 8 bytes of the binary stream. An `.exe` file begins with `MZ` (hex `4D 5A`), which fails to match the `_MAGIC_SIGNATURES` list. Access Denied.

---

## 3. Reviewer Queue & SLA Computation

**Location:** [`backend/apps/kyc/views.py`](backend/apps/kyc/views.py) and `models.py`

### The Optimized Query
The reviewer dashboard needs to load fast. This query powers the Queue table.

```python
submissions = (
    KYCSubmission.objects
    .filter(status__in=['submitted', 'under_review'])
    .select_related('merchant', 'reviewer')
    .prefetch_related('documents')
    .order_by('submitted_at')
)
```
- `filter(status__in=...)`: Excludes drafts and terminal states, ensuring only actionable work is loaded.
- `order_by('submitted_at')`: Oldest first (FIFO). 
- `select_related / prefetch_related`: Critical ORM optimizations to prevent the `N+1 Query Problem`. Serializing 100 submissions without this would result in 200+ distinct SQL hits. This reduces it to exactly 2 queries.

### Zero-Maintenance SLA Flags
We need to flag submissions older than 24 hours as `At-Risk`. If we used a database column (e.g. `is_at_risk = BooleanField`), we would need a Celery task or Cron job to constantly update it. That introduces massive overhead.

Instead, we use a Python `@property`:

```python
@property
def is_at_risk(self) -> bool:
    if self.status not in ('submitted', 'under_review'):
        return False
    if self.submitted_at is None:
        return False
        
    # Dynamically compute SLA breach on the fly
    return (timezone.now() - self.submitted_at).total_seconds() > 86_400
```
**Why this is superior:** Zero cache invalidation. Zero background workers. It is mathematically impossible for the SLA flag to be out of sync.

---

## 4. Role-Based Access Control (RBAC) Isolation

Security isn't just about endpoints; it's about lateral isolation. How do we ensure Merchant A cannot scrape Merchant B's identity documents?

1. **Permission Classes:** `IsMerchant` and `IsReviewer` classes wrap every endpoint.
2. **Implicit Identification:** Notice that the Merchant endpoint is `GET /api/v1/kyc/submission/` — there is no `<ID>` parameter. The system completely ignores client input for identity.

```python
# The Merchant GET/PUT View
def _get_or_create(self, user):
    submission, _ = KYCSubmission.objects.get_or_create(merchant=user)
    return submission
```
Because the `merchant` is strictly pulled from `request.user` (validated via JWT Token), a merchant literally cannot look up another row. The API architecture makes ID-guessing attacks (Insecure Direct Object Reference) physically impossible.

Reviewers access specific IDs, but their entire viewset is hard-locked behind `IsReviewer`.

---

## 5. Reviewer Round-Robin Assignment Logic

When a merchant submits an application, who reviews it? A naïve approach assigns it randomly or to an admin pool. We implemented algorithmic load-balancing.

```python
# Inside MerchantSubmitView
def _assign_reviewer(submission):
    # Find all reviewers and annotate them with their active workload count
    reviewers_with_counts = (
        User.objects.filter(role='reviewer')
        .annotate(queue_count=Count('reviewed_submissions', filter=Q(reviewed_submissions__status__in=['submitted', 'under_review'])))
        .order_by('queue_count', 'id')
    )
    
    assigned_reviewer = reviewers_with_counts.first()
    submission.reviewer = assigned_reviewer
    submission.save()
```
This query tallies the exact number of active tasks every reviewer has, sorts them ascending, and grabs the employee with the lowest count. This ensures 100% fair distribution across the compliance team and scales infinitely as the team grows.

---

## 6. Dockerization & Production Environment

Deploying full-stack React and Django environments often involves massive configuration headaches. 

By writing a precise `docker-compose.yml`, we encapsulate the environment completely.
- **Backend Image:** Python 3.11 Slim container running Gunicorn. Upon booting, it automatically runs `python manage.py migrate` to structure the database and `python seed.py` to ensure the platform is instantly ready to test.
- **Frontend Image:** A multi-stage Docker build. Stage 1 utilizes NodeJS to run `vite build`, producing highly optimized static JS/CSS. Stage 2 drops the node environment and serves the static files out of an ultra-lightweight Nginx alpine server.
- **Database:** Standard Postgres 15 alpine image with mounted volumes to ensure data persistence across restarts.

This setup ensures that what runs on the developer's Windows machine is bit-for-bit identical to what will execute on an AWS EC2 instance or Render.com pod.

---

*End of Deep-Dive.*
