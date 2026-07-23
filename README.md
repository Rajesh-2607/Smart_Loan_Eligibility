# Smart Loan Eligibility & AI Recommendation Engine

End-to-end data processing, machine learning, and explainable AI pipeline for automated loan eligibility assessment and recommendation.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Running with Docker](#running-with-docker)
- [Pipeline Stages](#pipeline-stages)
- [API Reference](#api-reference)
- [Security & Compliance](#security--compliance)
- [Monitoring & Observability](#monitoring--observability)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────────┐     ┌────────────────────┐
│   1. INGESTION   │     │ 2. ORCHESTRATION │     │   3. ML & AI ENGINE   │     │    4. DELIVERY      │
├─────────────────┤     ├──────────────────┤     ├───────────────────────┤     ├────────────────────┤
│ Customer         │────▶│ n8n Workflow     │────▶│ Feature Extraction    │────▶│ Recommendation      │
│ React Frontend   │     │ Trigger          │     │ Service               │     │ Report Generator     │
│ FastAPI Backend  │     │   │              │     │   │                   │     │   │                 │
│ AWS S3 / Local   │     │   ▼              │     │   ▼                   │     │   ▼                 │
│ Storage          │     │ OCR Service      │     │ ML Eligibility        │     │ Dashboard            │
│                  │     │ (Tesseract/      │     │ Prediction            │     │   │                 │
│                  │     │  Textract)       │     │ (XGBoost/RF)          │     │   ▼                 │
│                  │     │   │              │     │   │                   │     │ Email PDF            │
│                  │     │   ▼              │     │   ▼                   │     │   │                 │
│                  │     │ Credit Score API │     │ Loan Recommendation   │     │   ▼                 │
│                  │     │ (Optional)       │     │ Engine (Ranking +     │     │ Store Logs           │
│                  │     │   │              │     │ Eligibility Rules)    │     │                      │
│                  │     │   ▼              │     │   │                   │     │                      │
│                  │     │ Customer DB      │◀────│   ▼                   │────▶│                      │
│                  │     │ (PostgreSQL)     │     │ Gemini API            │     │                      │
│                  │     │                  │     │ (Explainability)      │     │                      │
└─────────────────┘     └──────────────────┘     └───────────────────────┘     └────────────────────┘
```

### Design principles

- **Async-first orchestration**: n8n triggers OCR and Credit Score lookups as parallel branches (queued via SQS/RabbitMQ), not a blocking sequential chain.
- **Interpretable-by-design ML**: XGBoost/Random Forest handle the eligibility decision; Gemini is used only for natural-language explainability, not for the decision itself.
- **Graceful degradation**: Credit Score API is optional — the eligibility model falls back to a documented rule-based scoring path when it's unavailable, rather than failing the request.
- **Auditability**: every decision (model version, input features, output, explanation) is logged for regulatory and debugging purposes, separate from the customer-facing explanation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend API | FastAPI (Python) |
| Orchestration | n8n |
| OCR | Tesseract / AWS Textract |
| Credit Scoring | Third-party Credit Score API (optional) |
| ML Models | XGBoost, Random Forest (scikit-learn) |
| Explainability | Gemini API |
| Database | PostgreSQL |
| File Storage | AWS S3 / local filesystem |
| Queue (recommended) | AWS SQS or RabbitMQ |
| Containerization | Docker / Docker Compose |

---

## Project Structure

```
loan-recommendation-system/
├── backend/
│   ├── app/
│   │   ├── api/                # FastAPI route handlers
│   │   ├── core/               # config, security, logging
│   │   ├── models/              # Pydantic + ORM models
│   │   ├── services/
│   │   │   ├── ocr_service.py
│   │   │   ├── credit_score_service.py
│   │   │   ├── feature_extraction.py
│   │   │   ├── ml_eligibility.py
│   │   │   ├── recommendation_engine.py
│   │   │   └── explainability_service.py
│   │   └── main.py
│   ├── ml/
│   │   ├── training/            # training scripts, notebooks
│   │   ├── registry/            # versioned model artifacts
│   │   └── monitoring/          # drift + fairness checks
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── n8n/
│   └── workflows/                # exported n8n workflow JSON
├── infra/
│   ├── docker-compose.yml
│   └── nginx/
├── docs/
│   └── architecture-diagram.png
└── README.md
```

---

## Prerequisites

- Docker & Docker Compose (recommended for local dev)
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- An n8n instance (self-hosted or n8n cloud)
- API keys: AWS (S3/Textract), Credit Score provider, Gemini API

---

## Environment Variables

**Never commit real `.env` files.** Commit only `.env.example` with placeholder values, and keep actual secrets in `.env` (gitignored) or a secrets manager (AWS Secrets Manager / Vault) in production.

### `backend/.env.example`

```bash
# --- App ---
APP_ENV=development                 # development | staging | production
APP_PORT=8000
SECRET_KEY=changeme                 # generate with: openssl rand -hex 32
LOG_LEVEL=INFO

# --- Database ---
DATABASE_URL=postgresql://user:password@localhost:5432/loan_db
DB_POOL_SIZE=10

# --- File Storage ---
STORAGE_BACKEND=s3                  # s3 | local
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=loan-docs-bucket
LOCAL_STORAGE_PATH=./storage

# --- OCR ---
OCR_PROVIDER=textract                # textract | tesseract
AWS_TEXTRACT_REGION=ap-south-1
TESSERACT_CMD_PATH=/usr/bin/tesseract

# --- Credit Score API (optional) ---
CREDIT_SCORE_API_ENABLED=true
CREDIT_SCORE_API_URL=https://api.creditbureau.example.com
CREDIT_SCORE_API_KEY=

# --- ML ---
MODEL_REGISTRY_PATH=./ml/registry
ACTIVE_MODEL_VERSION=v1.3.0
FALLBACK_MODE=rule_based             # rule_based | reject | manual_review

# --- Gemini API (Explainability) ---
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

# --- Orchestration (n8n) ---
N8N_WEBHOOK_URL=https://n8n.internal.example.com/webhook/loan-pipeline
N8N_API_KEY=

# --- Queue ---
QUEUE_BACKEND=sqs                    # sqs | rabbitmq
SQS_QUEUE_URL=
RABBITMQ_URL=amqp://guest:guest@localhost:5672/

# --- Email delivery ---
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=no-reply@yourcompany.com

# --- CORS / Frontend ---
ALLOWED_ORIGINS=http://localhost:3000

# --- Monitoring ---
SENTRY_DSN=
ENABLE_MODEL_DRIFT_MONITORING=true
```

### `frontend/.env.example`

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_ENV=development
```

Load environment variables using `python-dotenv` (backend) and Vite's built-in `.env` support (frontend). In production, inject env vars via your orchestrator (ECS task definitions, Kubernetes Secrets, or your platform's config panel) rather than shipping a `.env` file inside the container image.

---

## Local Setup

```bash
# 1. Clone and enter the repo
git clone https://github.com/your-org/loan-recommendation-system.git
cd loan-recommendation-system

# 2. Backend setup
cd backend
cp .env.example .env        # fill in real values
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head          # run DB migrations
uvicorn app.main:app --reload --port 8000

# 3. Frontend setup (in a new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev

# 4. n8n
# Import n8n/workflows/*.json into your n8n instance
# Point the webhook URL to your FastAPI backend
```

---

## Running with Docker

```bash
docker compose -f infra/docker-compose.yml up --build
```

This spins up: FastAPI backend, PostgreSQL, n8n, and the React frontend behind Nginx. Ensure `.env` files exist in `backend/` and `frontend/` before running — `docker-compose.yml` references them via `env_file`.

---

## Pipeline Stages

### 1. Ingestion
Customer submits loan documents via the React frontend → FastAPI backend validates and stores raw files in S3 (or local storage in dev) → request metadata is queued for processing.

### 2. Orchestration
n8n picks up the queued request and fans out:
- **OCR Service** extracts structured fields from documents (income proof, ID, bank statements).
- **Credit Score API** (optional) fetches the applicant's credit score.
- Both results are validated against a schema before being written to **Customer DB (PostgreSQL)**. Malformed OCR output is flagged for manual review rather than passed downstream silently.

### 3. ML & AI Engine
- **Feature Extraction Service** builds the model feature vector from Customer DB + OCR + credit data (feature logic is versioned to avoid train/serve skew).
- **ML Eligibility Prediction** (XGBoost/Random Forest) produces an eligibility score. If credit data is missing, `FALLBACK_MODE` determines behavior (rule-based scoring, manual review queue, or reject).
- **Loan Recommendation Engine** ranks eligible loan products against business rules.
- **Gemini API** generates a customer-facing, natural-language explanation of the decision — it does not influence the decision itself.

### 4. Delivery
- **Recommendation Report Generator** compiles the final report.
- Delivered via **Dashboard** (internal/customer-facing) and **Email PDF**.
- **Store Logs**: every decision is logged with model version, input features, and outcome for audit and retraining.

---

## API Reference

Base URL: `{APP_ENV}` dependent, e.g. `http://localhost:8000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/loan-applications` | Submit a new loan application + documents |
| `GET` | `/loan-applications/{id}` | Get application status |
| `GET` | `/loan-applications/{id}/recommendation` | Get recommendation report |
| `POST` | `/webhooks/n8n/ocr-complete` | Internal webhook from n8n after OCR |
| `POST` | `/webhooks/n8n/credit-score-complete` | Internal webhook after credit score fetch |
| `GET` | `/health` | Health check |
| `GET` | `/metrics` | Prometheus-style metrics |

Full OpenAPI docs are available at `/docs` once the backend is running (FastAPI auto-generated Swagger UI) — disable or protect this in production.

---

## Security & Compliance

- **Encryption at rest**: enable S3 server-side encryption (SSE-S3 or SSE-KMS); use PostgreSQL column-level encryption or `pgcrypto` for sensitive fields (SSN/PAN-equivalent IDs, income data).
- **Encryption in transit**: TLS everywhere — backend behind HTTPS (Nginx/ALB), n8n webhooks over HTTPS, DB connections with `sslmode=require`.
- **PII redaction**: strip or mask PII before sending documents to third-party OCR/credit APIs where possible; log redacted versions only.
- **Secrets management**: use AWS Secrets Manager, HashiCorp Vault, or your cloud provider's equivalent in production — never bake secrets into Docker images or commit `.env` files.
- **Audit logging**: immutable log of every eligibility decision (model version, inputs, output, timestamp, actor) — required for fair-lending regulatory review, independent of the customer-facing Gemini explanation.
- **Fairness/bias checks**: run periodic approval-rate parity checks across protected groups before/after model updates; gate model promotion on these checks passing.
- **Access control**: role-based access on the Dashboard (loan officer vs. admin vs. customer views).

---

## Monitoring & Observability

- **Application metrics**: request latency, error rates, queue depth (Prometheus + Grafana).
- **Model monitoring**: track prediction distribution drift, feature drift, and approval rate over time (`ml/monitoring/`); alert if drift exceeds threshold.
- **Error tracking**: Sentry (or equivalent) wired via `SENTRY_DSN`.
- **Business feedback loop**: track whether recommended loans were accepted and (later) repayment outcomes, feeding back into retraining data.

---

## Testing

```bash
# Backend unit + integration tests
cd backend
pytest --cov=app tests/

# Frontend tests
cd frontend
npm run test
```

Include contract tests for the n8n webhook payloads and a fixture-based test suite for the ML fallback path (credit score unavailable).

---

## Deployment

- **Containerized deployment**: build backend/frontend images, push to ECR/GCR, deploy via ECS/EKS/Cloud Run.
- **Environment separation**: separate `.env`/secrets per environment (`development`, `staging`, `production`) — never share credentials across environments.
- **Database migrations**: run `alembic upgrade head` as a pre-deploy step, not on container startup, to avoid race conditions across multiple replicas.
- **Model deployment**: promote models through the registry (`MODEL_REGISTRY_PATH` / `ACTIVE_MODEL_VERSION`) with a manual or gated approval step — don't auto-deploy retrained models without a fairness/performance check.
- **n8n workflows**: version-control workflow JSON exports in `n8n/workflows/` and deploy via n8n's CLI/API rather than manual UI edits in production.

---

## Roadmap

- [ ] Async queue-based fan-out for OCR + Credit Score (parallel instead of sequential)
- [ ] Feature store for consistent train/serve feature logic
- [ ] Automated fairness/bias audit gate before model promotion
- [ ] Human-in-the-loop review queue for borderline/rejected applications
- [ ] Customer feedback + repayment outcome loop for retraining
- [ ] Model + prompt versioning dashboard
