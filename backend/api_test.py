"""
Comprehensive Playto KYC API Test Suite
Tests: Registration, Login, KYC Flow, Reviewer Queue, OTP, State Machine, Email
"""
import requests
import time
import sys

BASE_URL = "http://localhost:8000/api/v1"
PASS = 0
FAIL = 0

def test(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  [PASS] {name}")
    else:
        FAIL += 1
        print(f"  [FAIL] {name} -- {detail}")

def h(token):
    return {"Authorization": f"Token {token}"}

print("=" * 60)
print("  PLAYTO KYC - FULL API TEST SUITE")
print("=" * 60)

# ─── 1. AUTH ──────────────────────────────────────────────
print("\n--- 1. Authentication ---")

# Register merchant
ts = str(int(time.time()))
res = requests.post(f"{BASE_URL}/auth/register/", json={
    "username": f"testm_{ts}",
    "password": "StrongPass123!",
    "email": f"testm_{ts}@playto.so",
    "role": "merchant"
})
test("Register Merchant", res.status_code == 201, f"Got {res.status_code}")
m_token = res.json().get("token", "")
m_user = res.json().get("user", {})
test("Token returned", bool(m_token))
test("Role is merchant", m_user.get("role") == "merchant")

# Register another merchant
res2 = requests.post(f"{BASE_URL}/auth/register/", json={
    "username": f"testm2_{ts}",
    "password": "StrongPass123!",
    "email": f"testm2_{ts}@playto.so",
    "role": "merchant"
})
test("Register Second Merchant", res2.status_code == 201)
m2_token = res2.json().get("token", "")

# Cannot register as reviewer
res3 = requests.post(f"{BASE_URL}/auth/register/", json={
    "username": f"fakereview_{ts}",
    "password": "StrongPass123!",
    "role": "reviewer"
})
test("Cannot self-register as reviewer", res3.status_code == 400 or res3.json().get("user", {}).get("role") == "merchant", f"Got {res3.status_code}")

# Login
res = requests.post(f"{BASE_URL}/auth/login/", json={
    "username": f"testm_{ts}",
    "password": "StrongPass123!"
})
test("Login Merchant", res.status_code == 200)
test("Login returns token", bool(res.json().get("token")))

# Me endpoint
res = requests.get(f"{BASE_URL}/auth/me/", headers=h(m_token))
test("GET /auth/me/ works", res.status_code == 200)
test("Me returns correct username", res.json().get("username") == f"testm_{ts}")

# ─── 2. OTP FLOW ─────────────────────────────────────────
print("\n--- 2. OTP Email Verification ---")

res = requests.post(f"{BASE_URL}/auth/request-otp/", headers=h(m_token))
test("Request OTP", res.status_code == 200, f"Got {res.status_code}: {res.text}")

# Verify with wrong OTP
res = requests.post(f"{BASE_URL}/auth/verify-otp/", headers=h(m_token), json={"otp": "000000"})
test("Wrong OTP rejected", res.status_code == 400)

# Verify without OTP
res = requests.post(f"{BASE_URL}/auth/verify-otp/", headers=h(m_token), json={})
test("Missing OTP rejected", res.status_code == 400)

# ─── 3. KYC SUBMISSION ───────────────────────────────────
print("\n--- 3. KYC Submission Flow ---")

# Get submission (auto-creates draft)
res = requests.get(f"{BASE_URL}/kyc/submission/", headers=h(m_token))
test("Get Submission (auto-create)", res.status_code == 200)
test("Initial status is draft", res.json().get("status") == "draft")

# Save progress
res = requests.put(f"{BASE_URL}/kyc/submission/", headers=h(m_token), json={
    "full_name": "Test Merchant",
    "email": f"testm_{ts}@playto.so",
    "phone": "+91 99999 00000",
    "business_name": "Test Corp",
    "business_type": "individual",
    "monthly_volume": "5000"
})
test("Save Progress", res.status_code == 200, f"Got {res.status_code}: {res.text[:200]}")
test("Business name saved", res.json().get("business_name") == "Test Corp")

# Submit for review
res = requests.post(f"{BASE_URL}/kyc/submission/submit/", headers=h(m_token))
test("Submit for review", res.status_code == 200)
test("Status is now submitted", res.json().get("status") == "submitted")
sub_id = res.json().get("id")

# Cannot edit after submit
res = requests.put(f"{BASE_URL}/kyc/submission/", headers=h(m_token), json={
    "business_name": "Hacked Corp"
})
test("Cannot edit after submit", res.status_code == 400)

# Double submit should fail
res = requests.post(f"{BASE_URL}/kyc/submission/submit/", headers=h(m_token))
test("Double submit rejected", res.status_code == 400)

# ─── 4. MERCHANT ISOLATION ───────────────────────────────
print("\n--- 4. Merchant Isolation ---")

res = requests.get(f"{BASE_URL}/kyc/submission/", headers=h(m2_token))
test("Merchant B gets own submission (not A's)", res.json().get("id") != sub_id)
test("Merchant B's status is draft", res.json().get("status") == "draft")

# Merchant cannot access reviewer queue
res = requests.get(f"{BASE_URL}/reviewer/queue/", headers=h(m_token))
test("Merchant blocked from reviewer queue", res.status_code == 403)

# ─── 5. REVIEWER FLOW ────────────────────────────────────
print("\n--- 5. Reviewer Queue & Transitions ---")

# Login as seeded reviewer
res = requests.post(f"{BASE_URL}/auth/login/", json={
    "username": "reviewer1",
    "password": "password123"
})
test("Login Reviewer", res.status_code == 200, f"Got {res.status_code}: {res.text[:200]}")
r_token = res.json().get("token", "")

# Get queue
res = requests.get(f"{BASE_URL}/reviewer/queue/", headers=h(r_token))
test("Get Reviewer Queue", res.status_code == 200)
queue = res.json()
test("Queue is non-empty", len(queue) > 0)

# Find our submission in queue
our_sub = next((s for s in queue if s["id"] == sub_id), None)
test("Our submission in queue", our_sub is not None)

# Get metrics
res = requests.get(f"{BASE_URL}/reviewer/metrics/", headers=h(r_token))
test("Get Metrics", res.status_code == 200)
test("Metrics has queue_count", "queue_count" in res.json())
test("Metrics has at_risk_count", "at_risk_count" in res.json())

# Transition: submitted -> under_review
res = requests.post(f"{BASE_URL}/reviewer/submissions/{sub_id}/transition/", headers=h(r_token), json={
    "target_state": "under_review"
})
test("Transition to under_review", res.status_code == 200, f"Got {res.status_code}: {res.text[:300]}")

# Illegal: under_review -> draft
res = requests.post(f"{BASE_URL}/reviewer/submissions/{sub_id}/transition/", headers=h(r_token), json={
    "target_state": "draft"
})
test("Illegal transition rejected (under_review->draft)", res.status_code == 400)

# Transition: under_review -> approved
res = requests.post(f"{BASE_URL}/reviewer/submissions/{sub_id}/transition/", headers=h(r_token), json={
    "target_state": "approved",
    "reason": "All documents verified. Account is legit."
})
test("Approve submission", res.status_code == 200)
test("Status is now approved", res.json().get("status") == "approved")

# Double approve should fail (terminal state)
res = requests.post(f"{BASE_URL}/reviewer/submissions/{sub_id}/transition/", headers=h(r_token), json={
    "target_state": "approved"
})
test("Double approve rejected (terminal)", res.status_code == 400)

# Approved -> rejected should fail
res = requests.post(f"{BASE_URL}/reviewer/submissions/{sub_id}/transition/", headers=h(r_token), json={
    "target_state": "rejected"
})
test("Approved->Rejected rejected (terminal)", res.status_code == 400)

# ─── 6. NOTIFICATIONS ────────────────────────────────────
print("\n--- 6. Notifications ---")

res = requests.get(f"{BASE_URL}/kyc/notifications/", headers=h(m_token))
test("Get Notifications", res.status_code == 200)
test("Has notification events", len(res.json()) > 0)

# ─── SUMMARY ─────────────────────────────────────────────
print("\n" + "=" * 60)
print(f"  RESULTS: {PASS} passed, {FAIL} failed, {PASS+FAIL} total")
print("=" * 60)

if FAIL > 0:
    sys.exit(1)
