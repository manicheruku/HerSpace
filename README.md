# HerSpace

A personal digital life companion — a mobile-first PWA that helps organize daily
life while making every day calmer, more meaningful and emotionally supportive.

> Calm · Celebrate progress · Personalization · Privacy by design

## Tech stack

| Layer     | Technology                                            |
| --------- | ----------------------------------------------------- |
| Frontend  | React + TypeScript + Vite + Tailwind CSS v4 (PWA)     |
| Backend   | FastAPI + SQLAlchemy + Alembic                        |
| Database  | SQLite (local dev) · PostgreSQL (production)          |
| Auth      | JWT (from Phase 2)                                     |
| Deploy    | Vercel (frontend) · Render (backend) · Supabase (DB)  |

## Project structure

```
HerSpace/
├── backend/          FastAPI service
│   ├── app/
│   │   ├── core/          config, database, logging
│   │   ├── models/        SQLAlchemy models
│   │   ├── schemas/       Pydantic schemas
│   │   ├── repositories/  data-access layer
│   │   ├── services/      business logic
│   │   ├── routers/       API endpoints
│   │   ├── middleware/    request middleware
│   │   └── utils/         helpers
│   ├── alembic/      database migrations
│   └── tests/        pytest suite
└── frontend/         React PWA
    └── src/
        ├── modules/       feature modules (today, planner, ...)
        ├── shared/        api client, components, hooks
        └── routes/        top-level routes
```

## Getting started

### Backend

```powershell
# from the repo root (uses the existing .venv)
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
Set-Location backend
copy .env.example .env   # adjust if needed
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

API: http://localhost:8000 · Docs: http://localhost:8000/docs

Run tests:

```powershell
Set-Location backend
..\.venv\Scripts\python.exe -m pytest
```

### Frontend

```powershell
Set-Location frontend
npm.cmd install
copy .env.example .env
npm.cmd run dev
```

App: http://localhost:5173 (requests to `/api` are proxied to the backend).

## Build roadmap

1. **Project setup** ✅
2. Authentication
3. Today
4. Planner
5. Wellness
6. Personal
7. Growth
8. Finance
9. Profile
10. Testing & deployment

Each module is built full-stack (model → schema → repository → service → router →
tests, plus matching UI) before moving to the next.
