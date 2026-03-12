# Augenblick2026

Collaborative idea workspace with:
- FastAPI backend (REST + WebSocket)
- React + Vite frontend
- MongoDB Atlas for persistence
- Groq integration for AI features

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind
- Backend: FastAPI, Uvicorn, Motor (MongoDB)
- Realtime: WebSocket (`/ws/{session_id}`)

## Project Structure

- `frontend/` — React app
- `backend/` — FastAPI app
- `.env.example` — root backend env template
- `frontend/.env.example` — frontend env template

## Prerequisites

- Python 3.10+
- Node.js 20+
- npm
- A MongoDB Atlas connection string
- A Groq API key

## Environment Setup

### 1) Backend env

Create a root `.env` file using `.env.example`:

```bash
cp .env.example .env
```

Required values in `.env`:
- `MONGODB_URL`
- `JWT_SECRET_KEY`
- `GROQ_API_KEY`

Optional defaults are already provided in `.env.example`.

### 2) Frontend env

Create frontend env file:

```bash
cp frontend/.env.example frontend/.env
```

Default local values:
- `VITE_API_URL=http://localhost:8000/api/v1`
- `VITE_WS_URL=ws://localhost:8000/ws`

## Run Locally (No Docker)

Open two terminals.

### Terminal 1 — Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

Health check:
- `GET http://localhost:8000/health`

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
- `http://localhost:3000`

## Useful Commands

### Backend tests

```bash
cd backend
source .venv/bin/activate
pytest -q
```

### Frontend production build check

```bash
cd frontend
npm run build
```

## API Base Paths

- REST API base: `http://localhost:8000/api/v1`
- WebSocket base: `ws://localhost:8000/ws`

## Troubleshooting

- `401 Unauthorized` on protected routes:
	- Ensure login is successful and tokens are present in local storage.
- CORS errors:
	- Verify `CORS_ORIGINS` in root `.env` includes `http://localhost:3000`.
- Mongo connection issues:
	- Check `MONGODB_URL` and whitelist your IP in MongoDB Atlas.

## Docker

Docker support has been removed from this repository.
