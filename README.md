# 💡 IdeaLab

### Real-Time Collaborative Ideation & AI Workspace

<div align="center">

[![CI](https://github.com/JashRashne/Idealab/actions/workflows/ci.yml/badge.svg)](https://github.com/JashRashne/Idealab/actions/workflows/ci.yml)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center">
  <b><a href="https://idealab2026.vercel.app/">Live Demo</a></b> &nbsp;•&nbsp; 
  <b><a href="https://github.com/JashRashne/Idealab/actions/workflows/ci.yml">CI Workflow</a></b>
</p>

</div>

IdeaLab is a real-time collaborative ideation workspace built with FastAPI, React, TypeScript, MongoDB, and WebSockets. The backend uses a layered Route &rarr; Service &rarr; Repository architecture, persists shared state before broadcasting updates, and supports collaborative idea trees, voting, scratchpads, and AI-assisted workflows via Groq.

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Architecture](#-architecture)
- [Engineering Highlights](#-engineering-highlights)
- [Engineering Trade-offs](#-engineering-trade-offs)
- [Scope & Limitations](#-scope--limitations)
- [Testing & CI](#-testing--ci)
- [Project Structure](#-project-structure)
- [API Surface](#-api-surface)
- [Local Setup](#-local-setup)
- [License](#-license)

---

## 🌟 Overview

Brainstorming tools frequently suffer from capture isolation—collecting disconnected sticky notes without preserving how ideas branched, or failing to provide teams with structured mechanisms to converge on decisions. IdeaLab addresses this by combining directed acyclic graph (DAG) idea hierarchies, server-authoritative real-time synchronization, and LLM-assisted synthesis into a cohesive workspace.

The application separates state-mutation transport from event distribution: REST endpoints enforce authentication and durable MongoDB persistence, while session-scoped WebSockets fan out lightweight notification events to connected collaborators.

### Core Features
- **Hierarchical Idea Branching**: Interactive DAG visualizer using React Flow and Dagre layout algorithms to map parent-child idea progressions.
- **Server-Authoritative Real-Time Sync**: Session-scoped WebSocket broadcasting with sender exclusion for idea mutations, voting, and status transitions.
- **Collaborative Scratchpad**: Private personal scratchpads and shared session pads with autosave and live multi-user updates.
- **Consensus & Progression Engine**: Upvoting mechanics, threaded comments with emoji reactions, and idea status workflows (`draft` &rarr; `shortlisted` &rarr; `merged` &rarr; `archived`).
- **AI-Assisted Workflows via Groq**: Asynchronous Llama 3 inference for branch idea expansion, thematic clustering, concept merging, and session executive summaries.
- **Live Session Presence**: Real-time participant tracking, creator/collaborator roles, and read-only session archiving.

---

## 🏗 Architecture

<div align="center">
  <img src="https://res.cloudinary.com/dgbgxtsrl/image/upload/v1786878656/idealab_arch_lm6gz9.png" alt="IdeaLab System Architecture Diagram" width="100%" />
</div>

IdeaLab decouples mutation handling from real-time event dissemination:

```text
React + TypeScript Client
        │
        │ HTTP (REST)
        ▼
FastAPI Route Layer (app/api/v1/routes/*)
        │
        ▼
Service Layer (app/services/*) ───[AIService]───> Groq Cloud API
        │
        ▼
Repository Layer (app/db/repositories/*)
        │
        ▼
MongoDB (Motor Async Driver)
        │
        │ (Authoritative write persisted)
        ▼
FastAPI WebSocket Manager (app/websockets/*) ───> Room Broadcasts (Peer Clients)
```

REST is authoritative for all shared-state mutations. WebSockets distribute notification events only after server-side validation and persistence succeed. This design centralizes business logic and reduces client-side state ambiguity by treating the backend as the single authoritative mutation path.

---

## 🛡 Engineering Highlights

### 1. Layered Backend Architecture
The backend follows a clean Route &rarr; Service &rarr; Repository separation using FastAPI's dependency injection (`Depends()`):
- **Routes (`app/api/v1/routes/*`)**: Validate HTTP transport, parse schemas, and enforce JWT security dependencies (`get_current_user`).
- **Services (`app/services/*`)**: Execute domain business logic, permission rules, and AI prompt orchestration.
- **Repositories (`app/db/repositories/*`)**: Abstract MongoDB queries through a generic `BaseRepository[T]`, decoupling database implementation details from business workflows.

### 2. Server-Authoritative Real-Time Flow
State mutations never originate directly over WebSockets. The system follows an explicit persistence-first sequence:

<div align="center">
  <img src="https://res.cloudinary.com/dgbgxtsrl/image/upload/v1786878650/idealab_flow2_vdkdh4.png" alt="Realtime Idea Creation & Broadcast Flow" width="95%" />
</div>

1. Client submits a mutation (e.g., `POST /api/v1/ideas`) with Bearer JWT authentication.
2. Route parses and validates the payload using Pydantic schemas.
3. `IdeaService` validates session membership and applies business rules.
4. `IdeaRepository` executes the write against MongoDB using Motor.
5. Server returns `201 Created` with the persisted document to the calling client.
6. Route triggers `ConnectionManager.broadcast(session_id, ..., exclude_user_id=author)` to notify room peers without echo-broadcasting back to the initiator.

### 3. Async MongoDB Persistence
Database operations use Motor (`AsyncIOMotorClient`) across all collections (`users`, `sessions`, `ideas`, `comments`, `pads`). The `BaseRepository[T]` generic abstraction provides standard CRUD operations and query helpers, enabling non-blocking asynchronous I/O across concurrent requests via Python's `asyncio`.

### 4. WebSocket Session Rooms
The WebSocket `ConnectionManager` maintains in-memory connection pools keyed by `session_id`. It handles room subscriptions, disconnect cleanups, and targeted broadcasts. Connection state is currently process-local to the running backend instance.

### 5. AI Integration via Groq
`AIService` queries session and idea context from the repository layer, constructs structured system prompts, and asynchronously invokes the Groq Cloud API. Responses are parsed into structured JSON payloads for branch expansion, thematic clustering, idea merging, and markdown session summaries.

<div align="center">
  <img src="https://res.cloudinary.com/dgbgxtsrl/image/upload/v1786878651/idealab_flow1_d12enz.png" alt="AI Expansion & Clustering Flow" width="95%" />
</div>

---

## ⚖️ Engineering Trade-offs

| Decision | Selected Approach | Alternative Considered | Rationale |
|---|---|---|---|
| **Architecture Pattern** | Modular Monolith (FastAPI) | Microservices | Avoids the operational, deployment, and communication overhead of distributed services at current project scale while preserving modular boundaries. |
| **Mutation Protocol** | Authoritative REST + WS Fan-Out | Pure WebSocket RPC | Provides standard HTTP status codes, centralized server-side validation, and a clear persistence path while using WebSockets solely for peer notifications. |
| **Idea Graphing** | React Flow + Dagre Layout | Freehand Canvas / Flat Kanban | Provides automated DAG hierarchy computation, supporting structured parent-child idea progression rather than unconstrained coordinates. |
| **AI Inference** | Groq Cloud API (Llama 3) | Self-Hosted Model (Ollama) | Provides low inference latency for interactive workflows without requiring local GPU infrastructure. |
| **Database Engine** | MongoDB (Async Motor) | Relational SQL (PostgreSQL) | Document model naturally represents nested idea trees, comment threads, polymorphic AI outputs, and collaborative pad state. |

---

## 📐 Scope & Limitations

The current implementation intentionally maintains the following architectural boundaries:

- **Process-Local WebSocket State**: The `ConnectionManager` maintains connection registries in-memory per server process. Multi-node horizontal scaling would require an external pub/sub coordinator such as Redis Pub/Sub.
- **External AI Dependency**: AI expansion, clustering, and summarization require network access to the external Groq API and a configured `GROQ_API_KEY`.
- **Scratchpad Concurrency**: Shared scratchpads synchronize edits via server-persisted broadcasts using a last-write-wins model rather than a CRDT or Operational Transformation (OT) algorithm.
- **Database Consistency Boundaries**: Multi-document operations across collections rely on application-level coordination rather than distributed multi-document transactions.

---

## 🧪 Testing & CI

IdeaLab includes automated tests validating authentication lifecycles, idea branching and voting logic, and WebSocket room broadcast behaviors.

```text
backend/tests/
├── conftest.py          # Pytest fixtures, test client setup & MongoDB test DB cleanup
├── test_auth.py         # Registration, password hashing, login & JWT lifecycle
├── test_ideas.py        # Idea CRUD, hierarchical branching, status updates & voting
└── test_websockets.py   # WebSocket connection auth, room joining & broadcast events
```

### GitHub Actions CI
Automated CI runs on every push and pull request targeting `main`:

- **Backend Job**: Sets up Python 3.11 with `pip` caching, starts an isolated MongoDB 6 service container, installs dependencies from `backend/requirements.txt`, and executes `pytest -v`.
- **Frontend Job**: Sets up Node.js 20 with `npm` caching, runs `npm ci`, and executes `npm run build` (`tsc -b && vite build`). This catches TypeScript compilation, import-resolution, and Vite production-bundling errors before Vercel deployment.

```bash
# Run backend tests:
cd backend && pytest -v

# Run frontend production build check:
cd frontend && npm ci && npm run build
```

---

## 📂 Project Structure

```text
Idealab/
├── .github/workflows/ci.yml       # GitHub Actions CI workflow (Backend & Frontend)
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/         # REST endpoints (auth, sessions, ideas, comments, pad, ai)
│   │   ├── core/                  # Security (JWT, bcrypt), configuration & settings
│   │   ├── db/repositories/       # Async MongoDB repositories (Motor)
│   │   ├── models/                # Pydantic schemas & request/response models
│   │   ├── services/              # Domain logic & AI orchestration
│   │   └── websockets/            # ConnectionManager & room event handlers
│   ├── requirements.txt           # Python dependencies
│   └── tests/                     # Pytest suite
├── frontend/
│   ├── src/
│   │   ├── components/            # React UI components (ideas, workspace, session)
│   │   ├── hooks/                 # Custom hooks (useWebSocket, useAuth)
│   │   ├── pages/                 # Route pages (Landing, Login, Workspace, etc.)
│   │   ├── services/              # Axios HTTP clients & WebSocket event listeners
│   │   └── store/                 # Zustand state stores
│   ├── package.json               # Frontend dependencies & build scripts
│   └── vite.config.ts             # Vite build configuration
├── LICENSE                        # MIT License
└── README.md
```

---

## 📡 API Surface

The backend exposes 27 REST endpoints organized into 6 modular routers, plus a real-time WebSocket channel:

| Module | Route Prefix | Purpose |
|---|---|---|
| **Authentication** | `/api/v1/auth` | User registration, login, and JWT identity retrieval |
| **Sessions** | `/api/v1/sessions` | Session lifecycle, membership management, and join/leave flows |
| **Ideas & Branches** | `/api/v1/ideas` | Hierarchical idea CRUD, DAG tree queries, status progression, and voting |
| **Comments** | `/api/v1/comments` | Threaded discussions and emoji reactions on idea nodes |
| **Scratchpad** | `/api/v1/pad` | Private and shared scratchpad persistence and visibility toggling |
| **AI Workflows** | `/api/v1/ai` | Groq-powered idea expansion, clustering, merging, and summaries |
| **Real-Time Events** | `/ws/{session_id}` | Bidirectional WebSocket stream for presence, cursors, and live updates |

*Interactive Swagger API documentation is available at `/docs` when the backend is running.*

---

## 🛠 Local Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 20+** & **npm**
- **MongoDB** (local container or MongoDB Atlas URI)
- **Groq API Key** (optional, for AI features from [Groq Console](https://console.groq.com/))

### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
- API server: `http://localhost:8000`
- Interactive Swagger docs: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```
- Client application: `http://localhost:3000`

### Environment Variables

#### Backend (`backend/.env`)
```ini
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=idealab
JWT_SECRET_KEY=your-random-secret-key-at-least-32-characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
