# 💡 IdeaLab — Real-Time Collaborative Ideation & AI Workspace

<div align="center">

[![CI](https://github.com/JashRashne/Idealab/actions/workflows/ci.yml/badge.svg)](https://github.com/JashRashne/Idealab/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center">
  <b>A full-stack, real-time collaborative ideation platform featuring a modular FastAPI backend with layered Route &rarr; Service &rarr; Repository architecture, server-authoritative WebSocket synchronization, asynchronous MongoDB persistence, and Groq LPU-accelerated AI synthesis.</b>
</p>

</div>

---

## 📑 Table of Contents
- [Overview](#-overview)
- [System Architecture](#-system-architecture)
  - [Layered Route → Service → Repository Pattern](#-layered-route--service--repository-pattern)
- [Core Features](#-core-features)
- [System Lifecycles & Data Flows](#-system-lifecycles--data-flows)
  - [1. Server-Authoritative Real-Time Idea Creation & Broadcast](#1-server-authoritative-real-time-idea-creation--broadcast)
  - [2. AI Expansion, Summarization & Clustering Flow](#2-ai-expansion-summarization--clustering-flow)
- [Backend Engineering & Architecture Deep Dive](#-backend-engineering--architecture-deep-dive)
  - [1. Server-Authoritative Real-Time Sync](#1-server-authoritative-real-time-sync)
  - [2. Abstracted Async MongoDB Repository Layer](#2-abstracted-async-mongodb-repository-layer)
  - [3. Dependency Injection & Clean Contracts](#3-dependency-injection--clean-contracts)
- [Engineering Trade-offs](#-engineering-trade-offs)
- [Scope & Limitations](#-scope--limitations)
- [Automated Testing & CI](#-automated-testing--ci)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [Environment Variables](#environment-variables)
- [API Reference (27 Endpoints Across 6 Modules)](#-api-reference-27-endpoints-across-6-modules)
- [License](#-license)

---

## 🌟 Overview

IdeaLab is a real-time collaborative ideation workspace built with FastAPI, React, TypeScript, MongoDB, and WebSockets. It enables cross-functional teams to brainstorm together with structured idea branching, collaborative voting, shared and private scratchpads, server-authoritative real-time synchronization, and AI-assisted workflows powered by Groq.

Brainstorming tools frequently suffer from capture isolation—collecting disconnected sticky notes without preserving how ideas branched, or failing to provide teams with structured mechanisms to converge on decisions. **IdeaLab** resolves this by combining tree-based idea hierarchies, server-authoritative real-time synchronization, and sub-second LLM inference into a cohesive ideation workspace.

- ⚡ **JWT-Authenticated Real-Time Collaboration**: Session-scoped WebSocket broadcasting, live participant presence tracking, and remote cursor tracking.
- 🌳 **Hierarchical Idea Branching**: Interactive DAG visualizer using React Flow and Dagre layout algorithms to map parent-child idea progressions.
- 🤖 **Groq-Accelerated AI Synthesis**: Fast Llama 3 inference for branch ideation, thematic clustering, idea merging, and automated session summaries.
- 📝 **Dual Collaborative Scratchpad**: Autosaved private notes and shared public pads with real-time multi-user synchronization.
- 🗳️ **Consensus & Export**: Upvoting mechanics, status progression (draft &rarr; shortlisted &rarr; merged &rarr; archived), threaded feedback, and one-click Markdown document export.

---

## 🏗 System Architecture

<div align="center">
  <img src="https://res.cloudinary.com/dgbgxtsrl/image/upload/v1786878656/idealab_arch_lm6gz9.png" alt="IdeaLab System Architecture Diagram" width="100%" />
</div>

### 🧩 Layered Route → Service → Repository Pattern

The backend is engineered as a clean **Modular Monolith** adhering to strict separation of concerns via FastAPI's dependency injection container:

1. **Route Layer (`app/api/v1/routes/*`)**: Handles HTTP transport, status codes, query parsing, JWT security dependencies (`get_current_user`), and service instantiation via `Depends()`.
2. **Service Layer (`app/services/*`)**: Houses pure business logic, transaction workflows, permission validation, and AI prompt engineering (`AIService`, `IdeaService`, `SessionService`, etc.).
3. **Repository Layer (`app/db/repositories/*`)**: Abstract generic CRUD operations (`BaseRepository[T]`) over MongoDB Motor driver, isolating database implementation details from business services.
4. **Real-Time WebSocket Engine (`app/websockets/*`)**: Manages room subscriptions, event serialization, and session-scoped fan-out with sender exclusion to eliminate redundant client re-renders.

```
Client (React + TypeScript)
  ├── REST Requests (Mutations / Queries) ──> FastAPI Route Layer
  │                                                │
  │                                         Service Layer (Validation & Business Rules)
  │                                                │
  │                                         Repository Layer (Motor Async Driver)
  │                                                │
  │                                             MongoDB
  │                                                │
  │   (Authoritative write confirmed)              │
  │                                                ▼
  └── WebSocket Channel <─────────────── Broadcast Notification (Session Room)
```

---

## 🚀 Core Features

| Feature | Description |
|---|---|
| **🌳 Hierarchical Idea Branching** | Build root ideas and child branches. Rendered as interactive DAG trees using React Flow & Dagre layouts. |
| **⚡ Server-Authoritative Real-Time Sync** | WebSocket fan-out for idea creation, edits, deletions, voting updates, and live collaborative scratchpad edits. |
| **🤖 Groq LPU AI Brainstorming** | On-demand AI idea expansion, automated thematic clustering, concept merging, and session executive summaries. |
| **📝 Dual Live Scratchpad** | Personal private scratchpads or shared public pads with live autosave and remote cursor position broadcasting. |
| **🗳️ Voting & Consensus Engine** | Upvoting/downvoting, threaded discussion comments with emoji reactions, idea shortlisting, and status progression. |
| **👥 Presence & Member Management** | Real-time participant tracking, creator/collaborator role handling, shareable session invite links, and read-only archiving. |
| **📄 Markdown Summary Export** | Synthesize approved and shortlisted ideas into structured Markdown documents ready for team distribution. |

---

## 🔄 System Lifecycles & Data Flows

### 1. Server-Authoritative Real-Time Idea Creation & Broadcast

IdeaLab enforces a **server-authoritative mutation lifecycle**. Client mutations are verified, processed, and durably written to MongoDB before triggering WebSocket notifications to peer clients in the session room.

<div align="center">
  <img src="https://res.cloudinary.com/dgbgxtsrl/image/upload/v1786878650/idealab_flow2_vdkdh4.png" alt="Realtime Idea Creation & Broadcast Flow" width="95%" />
</div>

1. **Client Action**: User A creates or branches an idea in the canvas UI.
2. **Authoritative Write**: Client A sends `POST /api/v1/ideas` with a Bearer JWT token.
3. **Validation & Persistence**: Route invokes `IdeaService.create_idea()`, which persists the document into MongoDB via `IdeaRepository`.
4. **Authoritative Response**: Server returns `201 Created` with the persisted document to Client A (preventing client-invented state).
5. **Session Fan-Out**: The route triggers `ConnectionManager.broadcast(session_id, ..., exclude_user_id=UserA)`, notifying User B and other connected room collaborators.

---

### 2. AI Expansion, Summarization & Clustering Flow

Leveraging Groq's high-speed LPU inference engine, IdeaLab delivers semantic clustering and ideation prompts without blocking collaborative workflows.

<div align="center">
  <img src="https://res.cloudinary.com/dgbgxtsrl/image/upload/v1786878651/idealab_flow1_d12enz.png" alt="AI Expansion & Clustering Flow" width="95%" />
</div>

1. **Trigger**: User A requests AI clustering or branch expansion for an existing idea node.
2. **Context Assembly**: `POST /api/v1/ai/cluster` fetches the active idea tree and session metadata from MongoDB.
3. **Prompt & Inference**: `AIService` constructs a structured prompt and dispatches it asynchronously to Groq Cloud API.
4. **Structured JSON Output**: Groq returns structured clusters, labels, and summaries.
5. **State Update & Fan-Out**: Cluster metadata is persisted to MongoDB, returned to Client A, and broadcast to all room collaborators via `CLUSTER_UPDATED` WebSocket events.

---

## 🛡 Backend Engineering & Architecture Deep Dive

### 1. Server-Authoritative Real-Time Sync
Pure WebSocket RPC architectures often suffer from split-brain state, complicated rollback paths, and lost updates. IdeaLab enforces REST for all state mutations:
- **Authoritative First**: Writes undergo full Pydantic validation, business rule checks, and MongoDB persistence.
- **Session-Scoped Broadcast**: `ConnectionManager` maintains in-memory session pools `active_connections: Dict[str, List[WebSocket]]` and broadcasts events only to clients connected to that active room.
- **Echo Suppression**: The initiating user receives the direct HTTP response; WebSockets exclude the author's connection (`exclude_user_id`), eliminating duplicate client-side mutations.

### 2. Abstracted Async MongoDB Repository Layer
All database access is cleanly abstracted through an asynchronous repository pattern utilizing Motor (`AsyncIOMotorClient`):
- `BaseRepository[T]` encapsulates common database operations (`create`, `get_by_id`, `find`, `find_by_query`, `update`, `delete`).
- Specialized repositories (`UserRepository`, `SessionRepository`, `IdeaRepository`, `CommentRepository`, `PadRepository`) encapsulate domain-specific aggregate pipelines and queries.
- Enables non-blocking asynchronous I/O across concurrent requests using Python's asyncio and Motor.

### 3. Dependency Injection & Clean Contracts
- **FastAPI `Depends()`**: Injects database handles, repository instances, domain services, and authenticated user contexts cleanly.
- **Decoupled Testability**: Routes and services can be tested with mock repositories and test databases without spinning up external cloud infrastructure.

---

## ⚖️ Engineering Trade-offs

| Decision | Selected Approach | Alternative Considered | Rationale |
|---|---|---|---|
| **Architecture Pattern** | Modular Monolith (FastAPI) | Microservices | Eliminates distributed systems latency and network overhead; provides clear module boundaries while simplifying deployment. |
| **Mutation Protocol** | Authoritative REST + WS Fan-Out | Pure WebSocket RPC | Guarantees standard HTTP status codes, robust idempotency, and prevents client state divergence. |
| **Idea Graphing** | React Flow + Dagre Layout | Flat Kanban / Freehand Canvas | Provides automated DAG hierarchy computation, supporting structured parent-child idea branches. |
| **AI Inference** | Groq Cloud API (LPU Llama 3) | Self-Hosted Ollama / OpenAI API | Delivers low response latencies necessary for interactive real-time brainstorming sessions. |
| **Database Engine** | MongoDB Atlas (Async Motor) | Relational SQL (PostgreSQL) | Flexible document model naturally represents hierarchical idea trees, polymorphic AI payloads, and collaborative pad states. |

---

## 📐 Scope & Limitations

To maintain technical credibility and clear architectural boundaries, the current implementation intentionally incorporates the following constraints:

- **Single-Node WebSocket State**: The WebSocket `ConnectionManager` maintains room connections in-memory per server process. For multi-node horizontal scaling, a distributed pub/sub coordinator (such as Redis Pub/Sub) would be required.
- **External AI Dependency**: AI ideation, clustering, and summarization features depend on network connectivity to the external Groq Cloud API and require a valid `GROQ_API_KEY`.
- **Scratchpad Concurrency**: The shared scratchpad persists and broadcasts changes using a last-write-wins model rather than a full CRDT (Conflict-free Replicated Data Type) or Operational Transformation (OT) engine.
- **Database Architecture**: Designed for MongoDB replica set deployments or single container test setups; multi-document cross-collection operations rely on application-level consistency rather than distributed two-phase commit transactions.

---

## 🧪 Automated Testing & CI

IdeaLab includes an automated test suite validating authentication flows, idea management and voting, and real-time WebSocket messaging.

```text
backend/tests/
├── conftest.py          # Pytest fixtures, test client lifecycle & test DB setup/teardown
├── test_auth.py         # Registration, password hashing, login & JWT token lifecycle
├── test_ideas.py        # Idea CRUD, hierarchical branching, status changes & voting
└── test_websockets.py   # WebSocket connection, room joining, presence & event broadcast
```

### Continuous Integration Workflow

GitHub Actions runs automated checks on every push and pull request targeting `main`:

#### Backend Job
- Checks out repository and sets up Python 3.11 with `pip` caching.
- Starts an isolated MongoDB 6 service container on port 27017.
- Installs backend dependencies from `backend/requirements.txt`.
- Runs `pytest -v` against the service container without needing external credentials or network APIs.

```bash
# Run backend tests locally:
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -v
```

#### Frontend Job
- Checks out repository and sets up Node.js 20 with `npm` caching.
- Installs dependencies using `npm ci`.
- Executes `npm run build` (`tsc -b && vite build`) to validate strict TypeScript compilation and production bundling, protecting against Vercel deployment failures.

```bash
# Run frontend build verification locally:
cd frontend
npm ci
npm run build
```

---

## 📂 Project Directory Structure

```text
Idealab/
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions CI workflow (Backend & Frontend)
├── LICENSE                               # MIT License
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── router.py             # Root v1 API router aggregator
│   │   │       └── routes/               # 6 Dedicated REST modules (27 endpoints)
│   │   │           ├── auth.py           # Registration, login & user identity
│   │   │           ├── sessions.py       # Session CRUD, joining, leaving & ending
│   │   │           ├── ideas.py          # Idea CRUD, branching tree, status & voting
│   │   │           ├── comments.py       # Threaded discussions & reactions
│   │   │           ├── pad.py            # Collaborative scratchpad state & visibility
│   │   │           └── ai.py             # AI expansion, clustering, summarization & merge
│   │   ├── core/                         # Security (JWT, bcrypt), config & dependencies
│   │   ├── db/
│   │   │   ├── client.py                 # Async Motor MongoDB client
│   │   │   └── repositories/             # Reusable async repository abstractions
│   │   │       ├── base.py               # BaseRepository generic CRUD implementation
│   │   │       ├── user_repository.py
│   │   │       ├── session_repository.py
│   │   │       ├── idea_repository.py
│   │   │       ├── comment_repository.py
│   │   │       └── pad_repository.py
│   │   ├── models/                       # Pydantic schemas & response models
│   │   ├── services/                     # Domain business logic (Idea, Session, AI, Auth)
│   │   ├── websockets/                   # ConnectionManager, event types & WS handlers
│   │   └── main.py                       # FastAPI application entrypoint & middleware
│   ├── requirements.txt                  # Backend Python dependencies
│   └── tests/                            # Pytest test suite (auth, ideas, websockets)
│
├── frontend/
│   ├── src/
│   │   ├── components/                   # Modular React UI components
│   │   │   ├── ideas/                    # Sticky notes, branch cards & modal editors
│   │   │   ├── session/                  # Room header, member avatars & presence list
│   │   │   ├── shared/                   # Reusable buttons, dialogs, badges & inputs
│   │   │   └── workspace/                # React Flow canvas, scratchpad & toolbars
│   │   ├── hooks/                        # Custom hooks (useWebSocket, useAuth)
│   │   ├── pages/                        # LandingPage, LoginPage, SessionListPage, WorkspacePage
│   │   ├── services/                     # Axios HTTP clients & WebSocket event listeners
│   │   ├── store/                        # Zustand stores (authStore, sessionStore, ideaStore)
│   │   ├── types/                        # TypeScript domain schemas
│   │   └── App.tsx                       # Main application shell & router
│   ├── package.json                      # Frontend dependencies & scripts
│   ├── tailwind.config.js                # Tailwind CSS design system tokens
│   └── vite.config.ts                    # Vite build configuration
│
└── README.md
```

---

## 🛠 Getting Started & Local Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 20+** & **npm**
- **MongoDB** (local instance or MongoDB Atlas cluster URI)
- **Groq API Key** (optional, for AI features; available from [Groq Console](https://console.groq.com/))

---

### 1. Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env and supply your MONGODB_URL, JWT_SECRET_KEY, and GROQ_API_KEY

# 5. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```
- Backend runs at: `http://localhost:8000`
- Interactive Swagger API Docs: `http://localhost:8000/docs`
- Health Check: `GET http://localhost:8000/health`

---

### 2. Frontend Setup

```bash
# 1. Open a new terminal and navigate to frontend directory
cd frontend

# 2. Install dependencies
npm ci

# 3. Configure frontend environment variables
cp .env.example .env
# Default points to http://localhost:8000/api/v1 and ws://localhost:8000/ws

# 4. Start the Vite development server
npm run dev
```
- Frontend runs at: `http://localhost:3000`

---

### Environment Variables

#### Backend (`backend/.env`)
```ini
# MongoDB connection URI (Atlas or local)
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/idealab?retryWrites=true&w=majority
DATABASE_NAME=idealab

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-minimum-32-characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Groq Cloud AI
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

# Application Settings
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

---

## 📡 API Reference (27 Endpoints Across 6 Modules)

### 1. Authentication Module (`/api/v1/auth`)
| Endpoint | Method | Description | Auth Required |
|---|---|---|:---:|
| `/api/v1/auth/register` | `POST` | Register a new user account with hashed password | No |
| `/api/v1/auth/login` | `POST` | Authenticate credentials & issue JWT access token | No |
| `/api/v1/auth/me` | `GET` | Retrieve the authenticated user's profile | Yes |

### 2. Session Management Module (`/api/v1/sessions`)
| Endpoint | Method | Description | Auth Required |
|---|---|---|:---:|
| `/api/v1/sessions` | `GET` | List all sessions owned or joined by the user | Yes |
| `/api/v1/sessions` | `POST` | Create a new brainstorming session | Yes |
| `/api/v1/sessions/{id}` | `GET` | Retrieve detailed metadata for a specific session | Yes |
| `/api/v1/sessions/{id}` | `PATCH` | Update session title, description, or settings | Yes |
| `/api/v1/sessions/{id}` | `DELETE` | Delete a session (owner only) | Yes |
| `/api/v1/sessions/{id}/join` | `POST` | Join an existing session by ID/invite code | Yes |
| `/api/v1/sessions/{id}/leave` | `POST` | Leave an active session | Yes |
| `/api/v1/sessions/{id}/members` | `GET` | Fetch all current session members and roles | Yes |
| `/api/v1/sessions/{id}/end` | `POST` | Conclude session and transition room to read-only | Yes |

### 3. Idea & Branching Module (`/api/v1/ideas`)
| Endpoint | Method | Description | Auth Required |
|---|---|---|:---:|
| `/api/v1/ideas` | `POST` | Create a root idea or branch under a parent idea | Yes |
| `/api/v1/ideas/tree/{session_id}` | `GET` | Fetch ideas formatted as a nested hierarchy tree | Yes |
| `/api/v1/ideas/session/{session_id}` | `GET` | Fetch all flat ideas for a specific session | Yes |
| `/api/v1/ideas/{idea_id}` | `PATCH` | Edit idea title, description, tags, or position | Yes |
| `/api/v1/ideas/{idea_id}/status` | `PATCH` | Update idea status (`draft`, `shortlisted`, `merged`, `archived`) | Yes |
| `/api/v1/ideas/{idea_id}` | `DELETE` | Delete an idea and detach sub-branches | Yes |
| `/api/v1/ideas/{idea_id}/vote` | `POST` | Toggle an upvote/downvote on an idea | Yes |

### 4. Discussion & Comments Module (`/api/v1/comments`)
| Endpoint | Method | Description | Auth Required |
|---|---|---|:---:|
| `/api/v1/comments` | `POST` | Add a comment to an idea node | Yes |
| `/api/v1/comments/idea/{idea_id}` | `GET` | List all threaded comments for an idea | Yes |
| `/api/v1/comments/{comment_id}` | `PATCH` | Edit an existing comment | Yes |
| `/api/v1/comments/{comment_id}` | `DELETE` | Delete a comment | Yes |
| `/api/v1/comments/{comment_id}/react` | `POST` | Add or toggle an emoji reaction on a comment | Yes |

### 5. Collaborative Scratchpad Module (`/api/v1/pad`)
| Endpoint | Method | Description | Auth Required |
|---|---|---|:---:|
| `/api/v1/pad/{session_id}` | `GET` | Retrieve the current user's pad for the session | Yes |
| `/api/v1/pad/{session_id}` | `PUT` | Save/autosave scratchpad content | Yes |
| `/api/v1/pad/{session_id}/public` | `GET` | Fetch the shared public pad for the session | Yes |
| `/api/v1/pad/{session_id}/visibility` | `PATCH` | Toggle pad visibility between private and public | Yes |

### 6. AI Groq LPU Module (`/api/v1/ai`)
| Endpoint | Method | Description | Auth Required |
|---|---|---|:---:|
| `/api/v1/ai/expand` | `POST` | AI-assisted sub-idea generation for an idea node | Yes |
| `/api/v1/ai/summarize` | `POST` | Generate executive session summary from all ideas | Yes |
| `/api/v1/ai/merge` | `POST` | Synthesize and merge two overlapping ideas | Yes |
| `/api/v1/ai/cluster` | `POST` | Thematic clustering and auto-tagging of session ideas | Yes |
| `/api/v1/ai/prompt` | `POST` | Free-form prompt querying with session context | Yes |

### Real-Time WebSocket Channel
| Route | Protocol | Description | Auth |
|---|---|---|:---:|
| `/ws/{session_id}` | `WebSocket` | Real-time bidirectional room events (cursors, idea sync, presence) | Token query |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
