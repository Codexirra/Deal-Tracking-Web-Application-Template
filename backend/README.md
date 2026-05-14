# DealFlow CRM Backend

FastAPI backend for the DealFlow CRM sales deal tracker.

## Requirements

- Python 3.11+
- Postgres database
- `DATABASE_URL` environment variable

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Set `DATABASE_URL` in your runtime environment. You can copy `.env.example` as a reference, but do not commit real credentials.

## Run

```bash
uvicorn app.main:app --reload
```

Codexirra preview runs the exported FastAPI `app` object directly. The application does not bind to a fixed host or port in code.

## Persistence

On startup, the backend:

1. Connects to Postgres using `DATABASE_URL`.
2. Creates `companies`, `contacts`, `deals`, `notes`, and `tasks` tables if needed.
3. Seeds realistic sample data when the companies table is empty.

All application routes are namespaced under `/api` for frontend preview proxy compatibility.
