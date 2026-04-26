# Playto KYC Pipeline

A full-stack KYC onboarding system for Playto Pay — allowing Indian agencies and freelancers to submit identity and business documents for review before collecting international payments.

**Stack:** Django + DRF · React + Tailwind · SQLite (default) / PostgreSQL · Token auth

---

## Project Structure

## Project Structure

```
playto-kyc/
├── backend/               # Django project (DRF, PostgreSQL, OTP)
│   ├── apps/
│   │   ├── accounts/      # Custom User model, OTP generation, Email auth
│   │   └── kyc/           # State machine, Round-robin assignment, Notifications
│   ├── config/            # Django settings, urls, wsgi
│   ├── media/             # Uploaded files (gitignored)
│   ├── manage.py
│   ├── seed.py            # Creates 2 merchants + 1 reviewer
│   └── requirements.txt
├── frontend/              # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/           # Axios client
│   │   ├── context/       # Auth context
│   │   ├── components/    # Layout, StatusBadge
│   │   └── pages/         # auth/, merchant/, reviewer/
│   └── package.json
├── EXPLAINER.md
└── README.md
```

---

## Quick Start (Dockerized)

The absolute easiest way to run the entire stack (PostgreSQL + Django Backend + React Frontend) is using Docker.

```bash
# Start all services
docker-compose up --build
```
- Frontend: **http://localhost:3000**
- Backend: **http://localhost:8000**
- Database: **localhost:5432**

---

## Quick Start (Local)

### Prerequisites

- Python 3.11+
- Node.js 18+

### 1 — Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file (SQLite used by default — no Postgres needed)
cp .env.example .env

# Run migrations
python manage.py migrate

# Seed test data
python seed.py

# Start dev server
python manage.py runserver
```

Backend runs at **http://localhost:8000**

### 2 — Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

> The Vite dev server proxies `/api` and `/media` to `localhost:8000` automatically.

---

## Test Accounts (created by seed.py)

| Role     | Username    | Password      | State         |
|----------|-------------|---------------|---------------|
| Merchant | merchant1   | password123   | Draft KYC     |
| Merchant | merchant2   | password123   | Under review (at-risk) |
| Reviewer | reviewer1   | password123   | Reviewer dashboard |

---

## Using PostgreSQL (optional)

Set the following environment variables in `backend/.env`:

```
DB_USER=postgres
DB_PASSWORD=Postgresql@12$
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playto
```

Then run `python manage.py migrate` again.

---

## Running Tests

```bash
cd backend
source venv/bin/activate
python manage.py test apps.kyc.tests --verbosity=2
```

Tests cover:
- All legal state transitions
- All illegal state transitions raising `InvalidTransition`
- Merchant isolation (A cannot see B's submission)
- Double-approve returning 400
- Reviewer endpoints returning 403 to merchant tokens

---

## API Overview

All endpoints under `/api/v1/`.

**Auth**
```
POST /api/v1/auth/register/
POST /api/v1/auth/login/
POST /api/v1/auth/logout/
GET  /api/v1/auth/me/
```

**Merchant**
```
GET  /api/v1/kyc/submission/          # Get own submission (creates draft if none)
PUT  /api/v1/kyc/submission/          # Save progress
POST /api/v1/kyc/submission/submit/   # Submit for review
GET  /api/v1/kyc/documents/           # List own documents
POST /api/v1/kyc/documents/           # Upload a document
GET  /api/v1/kyc/notifications/       # View notification log
```

**Reviewer**
```
GET  /api/v1/reviewer/queue/                              # Submissions in queue
GET  /api/v1/reviewer/metrics/                            # Dashboard metrics
GET  /api/v1/reviewer/submissions/                        # All submissions
GET  /api/v1/reviewer/submissions/<id>/                   # Submission detail
POST /api/v1/reviewer/submissions/<id>/transition/        # Change state
```

**Transition payload:**
```json
{ "target_state": "approved", "reason": "All documents verified." }
```

**Error shape (consistent across all endpoints):**
```json
{ "error": true, "message": "Human-readable message", "detail": { ... } }
```

---

## Key Design Decisions

### State Machine
Lives entirely in `apps/kyc/state_machine.py`. No transition logic anywhere else. See EXPLAINER.md §1.

### File Validation
Three layers: size check → extension check → magic byte check. Client content-type header is never trusted. See EXPLAINER.md §2.

### SLA Flag
`is_at_risk` is a `@property` computed from `submitted_at` at read time. Never stored. Always accurate. See EXPLAINER.md §3.

### Auth Isolation
Merchants have no endpoint that accepts an ID — they always get their own submission. Reviewer endpoints are gated by `IsReviewer`. Role is set at signup and not user-editable. See EXPLAINER.md §4.

---

## 🔥 Bonus Features Implemented

1.  **Docker Orchestration**: Fully containerized backend, frontend, and PostgreSQL via `docker-compose.yml`.
2.  **Email & OTP Verification**: A secure 6-digit OTP is generated and emailed to merchants on registration. They must verify their email before using the dashboard.
3.  **Drag-and-Drop Uploads**: The frontend React app features a responsive, interactive drag-and-drop zone for uploading KYC documents (PDF, JPG, PNG).
4.  **Reviewer Round-Robin Assignment**: When a KYC submission transitions to `submitted`, the backend calculates the active queue of all reviewers and auto-assigns the submission to the reviewer with the lowest workload.
5.  **Status Update Emails**: Merchants automatically receive an email when their KYC is `approved`, `rejected`, or requires `more_info_requested` — complete with the reviewer's reasoning.

---

## Deployment (Render / Railway)

1. Push backend to a Python web service:
   - Build command: `pip install -r requirements.txt && python manage.py migrate && python seed.py`
   - Start command: `gunicorn config.wsgi:application`
   - Set `DATABASE_URL`, `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`

2. Push frontend to a static site:
   - Build command: `npm install && npm run build`
   - Output directory: `dist`
   - Set `VITE_API_BASE` if the backend URL is different from the frontend domain

---

## License

Built for the Playto Pay engineering assessment.
