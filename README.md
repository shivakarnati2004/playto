deployed in render wait 10 sec to load the webpage not compltly deployed local can has more features 
https://playto-k6u6.onrender.com
# Playto KYC Pipeline & Platform

> A production-grade KYC onboarding system and unified platform for **Playto Pay** and **AutoDM** — enabling Indian agencies and freelancers to submit identity documents, pass compliance review, and start collecting international payments or automating their social presence.

![Hero](docs/images/hero.png)

**Live Stack:** Django 5 + DRF · React 18 + Tailwind CSS · Framer Motion · PostgreSQL 15 · Token Auth · Docker & Docker Compose · Nginx · Gunicorn · Gmail SMTP

---

## 📖 Comprehensive Table of Contents

- [Screenshots](#screenshots)
- [Platform Features](#platform-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Security & Compliance](#security--compliance)
- [Quick Start — Docker](#quick-start--docker)
- [Quick Start — Local Development](#quick-start--local-development)
- [Test Accounts](#test-accounts)
- [Testing Strategy & Execution](#testing-strategy--execution)
- [API Reference](#api-reference)
- [Key Engineering Decisions](#key-engineering-decisions)
- [Bonus Features & Polish](#bonus-features--polish)
- [Challenges & Overcoming Them](#challenges--overcoming-them)
- [Deployment Strategy](#deployment-strategy)
- [Project Structure](#project-structure)
- [Contact & License](#contact--license)

---

## 📸 Screenshots

### Landing Page — Hyper-Saturated Fluid Design
A highly reactive, scroll-synchronized 3D aesthetic ensuring a premium glassmorphism feel.
![Hero Section](docs/images/hero.png)

### Merchant Dashboard — KYC Status Tracking
A unified dashboard for merchants to drag-and-drop their PAN/Aadhaar/Bank statements and track their verification pipeline.
![Merchant Dashboard](docs/images/merchant-dashboard.png)

### Reviewer Queue — SLA Monitoring & At-Risk Flagging
A powerful back-office tool that orders oldest submissions first and flags SLAs exceeding 24 hours.
![Reviewer Dashboard](docs/images/reviewer-dashboard.png)

### Playto Pay — Payment Platform
The marketing front-end for the Pay platform. High-contrast fluidity with clear monetization benefits.
![Playto Pay](docs/images/playto-pay.png)

### AutoDM — Instagram Automation
The social automation vertical of the Playto ecosystem.
![AutoDM](docs/images/autodm.png)

---

## 🚀 Platform Features

**1. Centralized KYC Pipeline**
A robust multi-step KYC submission process covering business identity, individual identity, and strict file validations to ensure global compliance. 

**2. Asynchronous State Machine**
Submissions follow a strict lifecycle (`draft` → `submitted` → `under_review` → `approved`/`rejected`/`more_info_requested`). Transitions are strongly typed and centralized to prevent race conditions or illegal jumps.

**3. Round-Robin Queueing**
To ensure fair load balancing among the internal compliance team, the system automatically assigns incoming submissions to the reviewer with the lowest number of active pending reviews.

**4. 2FA & Secure Auth**
Registration incorporates Email OTP verification alongside standard JWT/Token authentication, guaranteeing the identity of merchants registering on the platform.

**5. Hyper-Saturated Fluid UI**
The frontend is built using a modern component library powered by TailwindCSS and Framer Motion, presenting users with an immersive, animated, and dark-themed premium interface.

---

## 🏗 Architecture & Tech Stack

```text
┌─────────────────────────┐           ┌────────────────────────┐           ┌───────────────────────┐
│     Frontend (React)    │           │    Backend (Django)    │           │    Database (PG)      │
│     Port: 3000 (Nginx)  │ ──JSON──▶ │    Port: 8000 (WSGI)   │ ──ORM───▶ │    Port: 5432         │
│                         │           │                        │           │                       │
│ • Vite HMR              │           │ • Django REST Auth     │           │ • PostgreSQL 15       │
│ • React Router DOM      │           │ • StateMachine Engine  │           │ • Persistent Volumes  │
│ • Tailwind CSS / Framer │           │ • Magic-Byte File Val  │           │ • pg_isready checks   │
│ • Context API           │           │ • SMTP Dispatcher      │           │ • Dockerized Data     │
└─────────────────────────┘           └────────────────────────┘           └───────────────────────┘
```

### Backend Components
- **Framework**: Django 5.x with Django REST Framework (DRF)
- **Database**: PostgreSQL 15 (SQLite fallback for absolute bare-metal local dev)
- **Application Server**: Gunicorn handling WSGI requests
- **Auth**: TokenAuthentication + custom OTP layer
- **Mailing**: `django.core.mail` piped through Gmail SMTP

### Frontend Components
- **Core**: React 18 initialized via Vite for lightning-fast HMR
- **Styling**: TailwindCSS with bespoke `index.css` global directives
- **Animations**: Framer Motion for scroll reveals, micro-interactions, and page transitions
- **Routing**: `react-router-dom` v6
- **Server**: Nginx (Alpine) for serving the production static build

---

## 🛡 Security & Compliance

1. **File Type Hardening:** File uploads are checked at three levels. (1) Strict size limits via `Content-Length`. (2) Extension allowlisting (`.pdf`, `.jpg`, `.png`). (3) Magic bytes verification using binary hex signatures. A `.exe` renamed to `.pdf` is instantly rejected.
2. **Role-Based Access Control (RBAC):** Merchants only ever have access to their own data via strict ORM filtering (`merchant=request.user`). Reviewers are verified via `IsReviewer` custom permissions. Role escalation is impossible via the API.
3. **Data Integrity:** The SLA/At-Risk flags are computed dynamically via `@property` decorators. By comparing `timezone.now()` against the immutable `submitted_at` timestamp, the system avoids background cron jobs that can drift or fail.

---

## 🐳 Quick Start — Docker

The fastest, cleanest way to spin up the entire architecture natively.

```bash
# 1. Clone the repository
git clone https://github.com/shivakarnati2004/playto.git
cd playto

# 2. Build and run in detached mode
docker-compose up -d --build
```

**Services Exposed:**
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Database**: `localhost:5432`

> *Note: On first boot, the backend container automatically applies all database migrations and runs `seed.py` to populate test accounts!*

---

## 💻 Quick Start — Local Development

If you prefer to run the services bare-metal without Docker:

### 1 — Database
```bash
psql -U postgres -c "CREATE DATABASE playto;"
```

### 2 — Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env            # Edit credentials

python manage.py migrate
python seed.py                  # Generates 2 merchants, 1 reviewer
python manage.py runserver
```

### 3 — Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3002** (Vite proxies `/api` requests to `8000`).

---

## 🔑 Test Accounts

Generated out-of-the-box by the Django seed script.

| Role     | Username    | Password      | Scenario                             |
|----------|-------------|---------------|--------------------------------------|
| Merchant | `merchant1` | `password123` | Draft state, ready for testing       |
| Merchant | `merchant2` | `password123` | Under Review state, SLA breached     |
| Reviewer | `reviewer1` | `password123` | Back-office reviewer dashboard access|

---

## 🧪 Testing Strategy & Execution

This repository features **58 comprehensive tests**, verifying everything from isolated functions to full-blown e2e integrations.

### Django Unit Tests (20 tests)
```bash
cd backend
python manage.py test apps.kyc.tests --verbosity=2
```
✅ Verifies all legal state machine transitions.
✅ Asserts exceptions on illegal transitions (e.g., `approved` -> `draft`).
✅ Tests Magic Bytes and File Size limits.
✅ Validates RBAC isolation.

### Live API Integration Tests (38 tests)
```bash
cd backend
python api_test.py
```
✅ Connects directly to the running server.
✅ Runs through full registration -> OTP verification -> Submission -> Queueing.

---

## 📡 API Reference (Prefix: `/api/v1`)

### Authentication (`/auth/`)
| Method | Endpoint              | Description                                  |
|--------|-----------------------|----------------------------------------------|
| POST   | `/register/`          | Creates an account + Generates 6-digit OTP   |
| POST   | `/login/`             | Standard JWT / Token retrieval               |
| POST   | `/verify-otp/`        | Validates the email OTP and activates user   |

### Merchant KYC (`/kyc/`)
| Method | Endpoint                     | Description                                |
|--------|------------------------------|--------------------------------------------|
| GET    | `/submission/`               | Fetches the user's isolated KYC row        |
| PUT    | `/submission/`               | Auto-saves progress (form data)            |
| POST   | `/submission/submit/`        | Commits the KYC to the reviewer queue      |
| POST   | `/documents/`                | Multipart/form-data secure file upload     |

### Reviewer Panel (`/reviewer/`)
| Method | Endpoint                                | Description                          |
|--------|-----------------------------------------|--------------------------------------|
| GET    | `/queue/`                               | Retrieves the prioritized queue      |
| GET    | `/metrics/`                             | SLA breaches, Pending, Completed     |
| POST   | `/submissions/<id>/transition/`         | Triggers state machine (approve/deny)|

---

## 🏛 Key Engineering Decisions

1. **State Machine Exclusivity:** Transition logic does not exist in views or serializers. It lives exclusively in `apps/kyc/state_machine.py`. See [EXPLAINER.md](EXPLAINER.md).
2. **Dynamic SLAs:** Flags are not cron-driven. They are dynamically calculated to ensure real-time accuracy and zero stale data.
3. **Decoupled Architecture:** Using Django as a pure headless API and React via Vite ensures the two ecosystems can scale independently and be hosted on entirely different infrastructures.

---

## ✨ Bonus Features & Polish

- **Email Dispatcher:** SMTP configured to send actual emails. Status changes instantly ping the merchant with custom reviewer notes.
- **Reviewer Round-Robin:** Zero manual assignments. The system routes work algorithmically to the least-burdened employee.
- **Drag & Drop:** The UI features HTML5 drag-and-drop file targets with `onDragOver` highlighting.
- **Responsive Animations:** Framer motion ensures staggered fade-ins and dynamic viewport scaling across all mobile and desktop layouts.

---

## 🛠 Challenges & Overcoming Them

**1. Securing the KYC Uploads**
Accepting compliance documents is highly dangerous. I solved this by implementing a 3-tier validation script. Reading `Content-Length` drops payload bombs, extension checks filter initial errors, and reading the first 8 hex bytes (`Magic Bytes`) ensures the actual binary data matches the expected PDF/JPG formats, neutralizing disguised executables.

**2. State Machine Race Conditions**
If two reviewers act on the same ticket, state could corrupt. By funneling all actions through a centralized `perform_transition()` dictionary, illegal jumps are caught immediately and raised as atomic 400 Bad Requests.

**3. Cross-Platform Docker Issues**
Bridging the Vite dev server and the Django API required precise CORS and Proxy setups. Moving to Docker-Compose eliminated this by standardizing network bridging and letting Nginx handle the frontend routing in production builds.

---

## 🚀 Deployment Strategy

**Production ready for Render, Railway, or AWS.**

The repo includes a `Dockerfile` for both environments and a `docker-compose.yml`. For Render.com, simply connect the Github repo and define the `render.yaml` services. The backend utilizes `gunicorn` for stable, multi-threaded request handling.

---

## 📝 Contact & License

Built exclusively for the **Playto** technical assessment.
Code structure reflects modern Silicon Valley engineering standards.

```text
End of Documentation.
```
