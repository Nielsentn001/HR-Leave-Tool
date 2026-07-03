# Leave Management

A small team leave management application: submit leave requests, approve or
reject them, and see approved leave for the next 30 days. Built with
FastAPI/SQLModel on the backend and React/TypeScript/Vite/Tailwind on the
frontend.

## Prerequisites

- **Python 3.11+** (3.14 supported)
- **Node.js 18+** and npm
- **Docker** (optional — only needed if you want PostgreSQL instead of the
  built-in SQLite database)

## Project layout

Open a terminal in the `leave-management` folder (the directory that contains
`backend/`, `frontend/`, and `docker-compose.yml`).

```
leave-management/
  backend/          Python API
  frontend/         React UI
  docker-compose.yml   Optional PostgreSQL
```


## Quick start (SQLite — no Docker)

This is the fastest way to run the app locally. The API stores data in
`backend/leave_management.db` by default.

### 1. Backend

**Windows (PowerShell):**

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

**macOS / Linux:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

The API runs at **http://localhost:8000**. Check **http://localhost:8000/health**
or **http://localhost:8000/docs** for interactive API docs.

`python -m app.seed` creates 32 employees across 4 teams, 3 public holidays,
and 15 sample leave requests. Safe to re-run — it clears existing data first.

### 2. Frontend

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

The frontend talks to `http://localhost:8000` by default. To point at another
API URL, copy `.env.example` to `.env` and set `VITE_API_URL`.

---

## Optional: PostgreSQL with Docker

Use this if you want to match a production-style Postgres setup.

### 1. Start the database

From the `leave-management` folder:

```bash
docker compose up -d
```

Confirm it is running: `docker compose ps`.

### 2. Point the backend at Postgres

In `backend/`, copy the example env file and uncomment the Postgres line:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```
DATABASE_URL=postgresql://leave_user:leave_password@localhost:5432/leave_management
```

### 3. Run backend and frontend

Follow the backend and frontend steps from the Quick start section above
(create venv, install deps, seed, run `uvicorn`, then `npm run dev` in
`frontend/`).

---

## Running tests

From `backend/` with the virtual environment activated:

```bash
pytest
```

Tests use an in-memory SQLite database (see `DECISIONS.md`), so neither
Docker nor a running API is required.

---

## Stopping everything

- Backend / frontend: `Ctrl+C` in their terminals
- PostgreSQL (if used): `docker compose down` (add `-v` to delete stored data)

---

## Troubleshooting

| Problem | What to try |
|--------|-------------|
| `pip install` fails on `psycopg2-binary` | Use Python 3.11–3.14 and `pip install -r requirements.txt` again. SQLite mode does not need Postgres running. |
| `Field 'id' requires a type annotation` | Upgrade dependencies: `pip install -r requirements.txt` (needs SQLModel 0.0.32+ for Python 3.14). |
| Frontend shows "Failed to load" | Start the backend first (`uvicorn app.main:app --reload` from `backend/`). |
| Empty employee list | Run `python -m app.seed` from `backend/`. |
| `Activate.ps1` blocked on Windows | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then activate again. |
| Port 8000 or 5173 in use | Stop the other process or change the port (`uvicorn app.main:app --reload --port 8001`). |

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |
| GET | `/leave` | Approved leave for the next 30 days |
| GET | `/requests` | Pending leave requests |
| POST | `/leave` | Submit a new leave request |
| PATCH | `/leave/{id}` | Approve or reject (`{"action": "approve"}` or `{"action": "reject"}`) |
| GET | `/employees` | List employees (submission form dropdown) |

---

## Project structure

```
backend/
  app/
    api/          FastAPI routes (thin — no business logic)
    services/     LeaveService — business rule logic
    models/       SQLModel table models
    schemas/      Request/response schemas
    database.py   Engine and session setup
    seed.py       Sample data generator
    main.py       App entrypoint
  tests/
frontend/
  src/
    components/   Presentational UI components
    pages/        LeaveDashboard — data fetching
    services/     API client
```
