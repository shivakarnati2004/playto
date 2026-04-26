import requests

BASE_URL = "http://localhost:8000/api/v1"

def print_result(name, res):
    print(f"[{res.status_code}] {name}")
    try:
        print(res.json())
    except:
        print(res.text)
    print("-" * 40)

print("Running API Tests...")

# 1. Register a new merchant
res = requests.post(f"{BASE_URL}/auth/register/", json={
    "username": "testmerchant999",
    "password": "password123",
    "email": "test@example.com",
    "role": "merchant"
})
print_result("Register Merchant", res)
token = res.json().get("token")
headers = {"Authorization": f"Token {token}"}

# 2. Get Me (Auth test)
res = requests.get(f"{BASE_URL}/auth/me/", headers=headers)
print_result("Get Me", res)

# 3. Get Submission (Should be auto-created as draft)
res = requests.get(f"{BASE_URL}/kyc/submission/", headers=headers)
print_result("Get Own KYC Submission", res)

# 4. Save Progress
res = requests.put(f"{BASE_URL}/kyc/submission/", headers=headers, json={
    "business_name": "Test LLC",
    "business_type": "Freelance",
    "expected_volume": "1000"
})
print_result("Save Progress", res)

# 5. Submit for Review
res = requests.post(f"{BASE_URL}/kyc/submission/submit/", headers=headers)
print_result("Submit for Review", res)

# 6. Login as Reviewer
res = requests.post(f"{BASE_URL}/auth/login/", json={
    "username": "reviewer1",
    "password": "password123"
})
print_result("Login Reviewer", res)
reviewer_token = res.json().get("token")
reviewer_headers = {"Authorization": f"Token {reviewer_token}"}

# 7. Get Reviewer Queue
res = requests.get(f"{BASE_URL}/reviewer/queue/", headers=reviewer_headers)
print_result("Reviewer Queue", res)

# 8. Request OTP
res = requests.post(f"{BASE_URL}/auth/request-otp/", headers=headers)
print_result("Request OTP", res)
