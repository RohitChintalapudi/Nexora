<div align="center">

# ⬡ NEXORA

### AI-Powered Codebase Intelligence Platform

> **Understand the system. Build the future.**

[![Made with React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&color=61dafb)](https://react.dev)
[![FastAPI-Backend](https://img.shields.io/badge/Backend-Express.js-000000?logo=express&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript&logoColor=white)](#)
[![PostgreSQL + pgvector](https://img.shields.io/badge/PostgreSQL-pgvector-336791?logo=postgresql&logoColor=white)](#)
[![LangGraph](https://img.shields.io/badge/LangGraph-State%20Machine-1c3c3c?logo=langchain&logoColor=white)](#)
[![Groq](https://img.shields.io/badge/LLM-Groq-f55036)](#)
[![GitHub](https://img.shields.io/badge/branch-bugfixes-181717?logo=github&logoColor=white)](#)

NEXORA indexes entire software repositories, parses AST syntax structures, extracts vector embeddings into **pgvector**, executes **repository-scoped RAG**, and produces **deterministic, fact-grounded codebase intelligence and architecture analysis** through a LangGraph state machine and Groq's lightning-fast inference.

</div>

---

## Table of Contents

- [Why NEXORA?](#why-nexora)
- [The Core Promise](#the-core-promise)
- [WOW Factors](#wow-factors)
- [Key Features](#key-features)
- [How It Works — The Analysis Pipeline](#how-it-works--the-analysis-pipeline)
- [LangGraph AI Workflow](#langgraph-ai-workflow)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Database Schema](#database-schema)
- [Installation Guide](#installation-guide)
- [Environment Configuration](#environment-configuration)
- [API Reference](#api-reference)
- [Security & Hardening](#security--hardening)
- [Running Tests](#running-tests)
- [Performance](#performance)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Why NEXORA?

Reading a new codebase is hard. Understanding how hundreds of files, functions, routes, and modules interact takes days — and most "AI code tools" hallucinate answers that look confident but are wrong.

NEXORA solves this by **never guessing**:

1. It **ingests the real repository** — fetches, extracts, and scans actual source files.
2. It **parses AST structures** — extracting every symbol, route, import, and relationship as *deterministic facts* (not LLM guesses).
3. It **embeds code into a vector database** — powering semantic search across your entire codebase.
4. It **grounds every AI answer** — the LLM only reasons over verified facts, retrieved chunks, and exact `file:line` citations.

The result: an AI platform that **understands your system** and can explain it, visualize it, and answer questions about it with **100% symbol accuracy**.

---

## The Core Promise

| Pillar | What it means |
|---|---|
| **Understand** | Ask questions about your project and get answers grounded in your actual code — parsed AST symbols, real routes, real relationships. |
| **Visualize** | Interactive, auto-generated architecture maps, dependency graphs, and component communication matrices. |
| **Predict** | Discover which parts of the system a change could affect, before you write a single line. |

---

## WOW Factors

These are the experiences that make NEXORA stand out.

### 1. Grounded AI — Zero Hallucinations
Every AI answer is built on **deterministic AST facts + vector-retrieved source chunks + verified symbols**. The model is forced to cite exact `file:line` references and can never invent unproven files or endpoints. Wrong answers are designed out of the system.

### 2. Parallel Deep Analysis (~75% faster)
Instead of analyzing technologies, architecture, modules, and flow sequentially (4 serial LLM calls), the LangGraph workflow executes all four **concurrently** via `Promise.all` — cutting AI analysis wall-clock latency by roughly **75%**.

### 3. Local Embeddings — Costless Semantic Search
Embeddings are generated **locally** with `@xenova/transformers` (`all-MiniLM-L6-v2`, 384-dim), no embedding API costs, no data leaves the server. Vectors are stored in **pgvector** with an **HNSW cosine index** for sub-linear similarity search.

### 4. AST-Guaranteed Symbol Accuracy
The chat engine runs a secondary **`ILIKE` symbol lookup** directly against the parsed AST symbol table for any token >= 3 chars in your question. Even if vector retrieval misses, the answer still gets exact symbol definitions.

### 5. Interactive Architecture Visualizations
Analysis results render as a **live React Flow + dagre architecture diagram** and a **component communication matrix** — clickable, draggable, with node penalties for orphaned modules without routes.

### 6. 13-Part Analysis Dashboard
One dashboard, 13 navigable sections: AI Chat, Project Overview, Technology Stack, Architecture, Main Components, Application Flow, Entry Points, Important Files, Dependencies, Database, API Structure, Quick Start, and Facts & Inferences — with scrollspy navigation.

### 7. Enterprise-Grade Multi-Tenant Isolation
Every endpoint, job, vector search, and source preview is scoped by the verified JWT user ID. Client-supplied IDs are never trusted blindly.

### 8. AI Schema Validation Layer
All structured LLM output passes through an `AISchemaValidator` that enforces typed contracts — and **falls back to deterministic M6 codebase facts** if the provider returns malformed or partial JSON.

---

## Key Features

**Authentication**
- Email/password registration & login (bcrypt + JWT, 30-day tokens)
- Google OAuth 2.0 and GitHub OAuth login flows
- Profile management, password change, password-strength indicator

**GitHub Integration**
- OAuth connect/disconnect with token storage (`github_accounts`)
- Fetch & list your GitHub repositories
- Repository selection, save, delete, and deep-link

**Repository Ingestion (M5)**
- Secure fetch of repo zip from GitHub → extract to isolated temp workspace
- `.gitignore`-aware file scanner with language detection
- Hard caps: **50 MB** max repo, **1,500** max files, **1 MB** max file, **20 MB** cumulative source

**Codebase Intelligence (M6)**
- AST-based symbol extraction (TypeScript/JavaScript via Babel, Python via Lezer, plus generic parser)
- Import resolution & relationship building (directed module graph)
- Framework-aware route detection, entry-point detection, project metadata

**Semantic Indexing (M7)**
- Intelligent code chunking with content hashing (idempotent re-indexing)
- Local transformer embeddings → `pgvector` with HNSW index

**AI Analysis (M9 / M10)**
- LangGraph state machine orchestrating load → retrieve → analyze → summarize → persist
- Structured analysis: overview, technology stack, architecture, modules, application flow, entry points, important files, dependencies, database, API structure, quick-start, uncertainties

**AI Repository Chat**
- RAG (top-K 8, min similarity 0.18, token-budgeted context) + AST symbol matching + grounded system prompt
- Markdown tables, code blocks, `file:line` citations, similarity scoring
- Bounded conversation history (last 6 turns), low hallucination temperature (0.15)

**Caching & Resilience**
- Upstash Redis fast-cache for latest jobs / repo summaries (in-memory fallback)
- Sequential in-process job queue, exponential-backoff retries on Groq, guaranteed workspace cleanup

---

## How It Works — The Analysis Pipeline

A repository goes through a staged pipeline when you trigger analysis.

```mermaid
flowchart TB
    U([Authenticated Developer]) -->|OAuth 2.0 + JWT| AUTH[Auth & Multi-Tenant Guard]
    AUTH --> GH[GitHub Authorization]
    GH --> SEL[Repository Selection]
    SEL --> JOB[Analysis Job Enqueued]
    JOB --> WK[Background Analysis Worker<br/>Sequential In-Process Queue]

    subgraph M5[M5 — Ingestion]
        direction TB
        F1[Secure Fetch GitHub Archive] --> F2[Extract to Isolated Temp Workspace]
        F2 --> F3[Zip-Slip & Symlink Defense]
        F3 --> F4[File Scanner + .gitignore]
        F4 --> F5[Redact Sensitive Files .env .pem .key]
        F5 --> F6[Batch Persist to repository_files]
    end

    subgraph M6[M6 — Codebase Intelligence]
        direction TB
        I1[AST Symbol Extraction<br/>Babel / Lezer / Generic] --> I2[Import & Relationship Builder]
        I2 --> I3[Route Detection + Entry Points]
        I3 --> I4[Project Metadata + Arch. Classification]
        I4 --> I5[(symbols, code_relationships, routes, project_metadata)]
    end

    subgraph M7[M7 — Semantic Indexing]
        direction TB
        V1[Smart Code Chunker + Content Hash] --> V2[Local Embeddings<br/>all-MiniLM-L6-v2 · 384-dim]
        V2 --> V3[(pgvector code_chunks<br/>HNSW Cosine Index)]
    end

    subgraph M9[M9 — LangGraph AI Analysis]
        direction TB
        G1[Load Metadata & Deterministic Facts] --> G2[Repository-Scoped RAG Retrieval]
        G2 --> G3[PARALLEL Deep Analysis<br/>Technologies · Architecture · Modules · Flow]
        G3 --> G4[Generate Summary]
        G4 --> G5[AI Schema Validator → Persist Analysis]
        G5 --> G6[(repository_analyses)]
    end

    WK --> M5
    M5 --> M6
    M6 --> M7
    M7 --> M9
    M9 --> API[REST API]
    API --> UI[Analysis Dashboard & AI Chat]
```

### Milestones at a glance

| Stage | Name | What it produces |
|---|---|---|
| M5 | Repository Ingestion | `repository_files` records + ingestion metadata |
| M6 | Codebase Intelligence | `symbols`, `code_relationships`, `routes`, `project_metadata` |
| M7 | Semantic Vector Indexing | `code_chunks` with 384-dim pgvector embeddings + HNSW index |
| M8 | RAG Retrieval | Repository-scoped semantic context assembly (used by M9 & chat) |
| M9 | LangGraph AI Analysis | `repository_analyses` (overview, tech stack, architecture, modules, flow, DB, APIs…) |
| M10 | Analysis API | Structured results, latest job, source file previews |
| M11 | Hardening & E2E | Multi-tenant isolation & security test suite (15/15 passing) |

> **Note:** The analysis job queue is currently **in-process** (sequential). Jobs are lost on server restart. Upstash Redis is used for caching, not queueing.

---

## LangGraph AI Workflow

The graph that powers deep analysis, compiled from a typed state annotation:

```mermaid
stateDiagram-v2
    [*] --> loadMetadata: repository facts + AST metadata
    loadMetadata --> retrieveContext: 4 parallel RAG queries
    retrieveContext --> parallelDeepAnalysis
    state parallelDeepAnalysis {
        analyzeTechnologies --> analyzeArchitecture
        analyzeArchitecture --> analyzeModules
        analyzeModules --> analyzeFlow
    }
    parallelDeepAnalysis --> generateSummary
    generateSummary --> persistAnalysis
    persistAnalysis --> [*]
```

---

## Technology Stack

### Frontend

| Category | Technology |
|---|---|
| UI Framework | React 19.2 · TypeScript 6.0 · Vite 8.2 |
| Styling | Tailwind CSS v4 · `@tailwindcss/vite` |
| Animation | framer-motion · GSAP · Lenis (smooth scroll) |
| Graphs & Visuals | `@xyflow/react` (React Flow) · dagre · Embla Carousel |
| Icons | lucide-react · `@tabler/icons-react` |
| Markdown | react-markdown · remark-gfm |

### Backend

| Category | Technology |
|---|---|
| Runtime | Node.js (ESM) · Express 4.21 |
| AI Orchestration | `@langchain/langgraph` · `@langchain/core` |
| LLM Provider | groq-sdk — default `openai/gpt-oss-120b` |
| AST Parsing | `@babel/parser` + traverse · `@lezer/python` |
| Embeddings | `@xenova/transformers` · `all-MiniLM-L6-v2` (384-dim, local) |
| Database | `@neondatabase/serverless` · PostgreSQL + pgvector |
| Cache | `@upstash/redis` (in-memory fallback) |
| Auth | bcryptjs · jsonwebtoken · google-auth-library |

---

## Repository Structure

```
Nexora
├── backend/                      # Express REST API (ESM)
│   └── src/
│       ├── server.js             # App bootstrap, CORS, healthcheck
│       ├── config/               # db.js (schema), redis.js, ingestionConfig.js
│       ├── routes/               # auth · github · repositories · analysis
│       ├── controllers/          # auth · github · repository · analysis · chat
│       ├── middlewares/          # authMiddleware · rateLimitMiddleware
│       ├── services/             # analysisWorker · repositoryFetcher · fileScanner · githubTokenService
│       ├── models/               # user · repository · analysisJob · file · symbol · route · relationship · metadata · chunk · analysis
│       ├── code-analysis/        # parsers (babel/lezer/generic) · route detector · imports · relationships · metadata
│       └── ai/
│           ├── langgraph/        # state + graph + nodes (load, retrieve, parallel analysis, summary, persist)
│           ├── rag/              # retriever · reranker · context-builder · query-embedder
│           ├── embeddings/       # transformers provider · embedding service
│           ├── prompts/          # technology · architecture · modules · flow · summary
│           └── validation/       # aiSchemaValidator
├── frontend/                     # Vite + React + TS SPA
│   └── src/
│       ├── App.tsx               # Router + landing/dashboard composition
│       ├── context/              # AuthContext
│       ├── pages/                # Landing, SignIn, SignUp, Dashboard, AuthPage
│       ├── components/
│       │   ├── ui/               # shared primitives (button, carousel, scroll reveal…)
│       │   ├── dashboard/        # layout, header, views
│       │   └── intelligence/     # EngineeredIntelligence, TechnologyConvergence
│       ├── hooks/                # useAuth-adjacent: useRepositories, useAnalysisJob, useRepositoryChat…
│       └── types/                # shared TS types
└── README.md
```

---

## Database Schema

NEXORA auto-creates all tables on boot via `initDB()`, including the pgvector extension and HNSW index.

```mermaid
erDiagram
    users ||--o| github_accounts : "owns"
    users ||--o{ repositories : "owns"
    users ||--o{ analysis_jobs : "runs"
    users ||--o{ repository_files : "scoped"
    users ||--o{ symbols : "scoped"
    users ||--o{ routes : "scoped"
    users ||--o{ code_chunks : "scoped"
    users ||--o{ repository_analyses : "scoped"

    repositories ||--o{ analysis_jobs : "has"
    repositories ||--o{ repository_files : "contains"
    repositories ||--o{ project_metadata : "described by"
    repositories ||--o| repository_analyses : "latest"
    repository_files ||--o{ symbols : "defines"
    repository_files ||--o{ routes : "exposes"
    repository_files ||--o{ code_relationships : "source"
    repository_files ||--o{ code_relationships : "target"
    repository_files ||--o{ code_chunks : "chunked into"
    symbols |o--o{ code_chunks : "linked to"
```

**Key tables:** `users` · `github_accounts` · `repositories` · `analysis_jobs` · `repository_files` · `symbols` · `code_relationships` · `routes` · `project_metadata` · `code_chunks` (pgvector `vector(384)`) · `repository_analyses`.

Structur JSON results are stored as `JSONB` on `repository_analyses` (technology_stack, architecture, modules, application_flow, entry_points, important_files, dependencies, database, api_structure, developer_quick_start, uncertainties).

---

## Installation Guide

### 1. Prerequisites

- **Node.js v18+ / v20+**
- **PostgreSQL with `pgvector`** (Neon works great — vector extension is enabled automatically)
- **Groq API Key** — [console.groq.com](https://console.groq.com) (fast structured inference)
- **GitHub OAuth App** — registered in GitHub Developer Settings
- *(Optional)* **Google OAuth** credentials + **Upstash Redis** URL/token

### 2. Clone & install dependencies

```bash
git clone https://github.com/RohitChintalapudi/Nexora.git
cd Nexora

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# → fill in DATABASE_URL, JWT_SECRET, GROQ_API_KEY, GITHUB_*, etc.

# Frontend
cp frontend/.env.example frontend/.env
```

### 4. Run the backend

```bash
cd backend
npm run dev
```

On boot, the server:
- mounts the REST API on `http://localhost:5000`
- runs `initDB()` — auto-creating all tables, the `vector` extension, and HNSW indexes
- registers `/api/health` for status checks

### 5. Run the frontend

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** — create an account, connect GitHub, select a repository, and start an analysis.

### 6. Verify

```bash
curl http://localhost:5000/api/health
# {"status":"ok","service":"Nexora Auth & Backend API"}
```

---

## Environment Configuration

### `backend/.env`

```ini
# Server
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_strong_jwt_secret_key
BCRYPT_ROUNDS=10                      # native bcrypt cost (lower = faster, e.g. 8)

# PostgreSQL (Neon with pgvector)
DATABASE_URL=postgresql://username:password@ep-sample-pooler.aws.neon.tech/neondb?sslmode=require

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/github/callback

# Groq
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b        # override default
GROQ_TEMPERATURE=0.1
GROQ_MAX_TOKENS=1536

# Upstash Redis (optional, falls back to in-memory)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here

# Embeddings
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
EMBEDDING_DIMENSIONS=384

# Pipeline safety limits
MAX_REPOSITORY_SIZE_MB=50
MAX_REPOSITORY_FILES=1500
MAX_FILE_SIZE_MB=1.0
MAX_TOTAL_SOURCE_SIZE_MB=20
```

### `frontend/.env`

```ini
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

---

## API Reference

All routes prefixed by `/api`. Repository, analysis, and profile routes require `Authorization: Bearer <JWT>`.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register with email/password | – |
| POST | `/api/auth/login` | Login → JWT | – |
| POST | `/api/auth/google` | Google OAuth token exchange | – |
| POST | `/api/auth/github` | GitHub OAuth code exchange | – |
| GET | `/api/auth/me` | Current user profile | ✔ |
| PUT/POST | `/api/auth/change-password` | Change password | ✔ |
| PUT | `/api/auth/profile` | Update profile | ✔ |
| GET | `/api/github/connect` | Start GitHub OAuth | ✔ |
| GET | `/api/github/callback` | OAuth callback | – |
| GET | `/api/github/status` | GitHub connection status | ✔ |
| GET | `/api/github/repositories` | Paginated GitHub repos | ✔ |
| DELETE | `/api/github/disconnect` | Disconnect GitHub | ✔ |
| POST | `/api/repositories` | Save/select repository | ✔ |
| GET | `/api/repositories` | List your repositories | ✔ |
| GET | `/api/repositories/:id` | Single repository | ✔ |
| DELETE | `/api/repositories/:id` | Delete repository | ✔ |
| POST | `/api/repositories/:id/analyze` | Trigger analysis (rate-limited) | ✔ |
| GET | `/api/repositories/:id/analysis/latest` | Latest job for repo | ✔ |
| GET | `/api/repositories/:id/analysis` | Structured analysis results | ✔ |
| POST | `/api/repositories/:id/chat` | Ask AI (RAG + AST grounded) | ✔ |
| GET | `/api/repositories/:id/file-content` | Source file preview | ✔ |
| GET | `/api/analysis/jobs/:jobId` | Job status/progress | ✔ |
| GET | `/api/health` | Service health | – |

### Rate limiting

| Scope | Limit |
|---|---|
| Auth routes | 40 req / 15 min |
| GitHub endpoints | 50 req / min |
| Analysis triggers & chat | 15 req / 5 min |

---

## Security & Hardening

1. **Strict Multi-Tenant Isolation** — every endpoint, job, vector retrieval, and source preview is verified against the JWT-backed user ID. Client-supplied IDs are never trusted.
2. **Zero Secret Leakage** — GitHub tokens, OAuth credentials, and API keys stay backend-only. Never exposed in JSON, frontend storage, error messages, or logs.
3. **Ingestion & Workspace Security**
   - Path traversal / **Zip-Slip** defense blocks writes outside the isolated temp workspace
   - Symlinks escaping the canonical root are detected and dropped
   - Hard caps: 50 MB repo · 1,500 files · 1 MB per file · 20 MB cumulative source
   - Sensitive files (`.env*`, `*.pem`, `*.key`, `credentials.json`, `service-account.json`) are auto-redacted (`[REDACTED_SENSITIVE_CONFIGURATION]`) and excluded from embeddings & prompts
4. **Guaranteed Workspace Cleanup** — temp workspaces are removed via `finally` blocks on every success/error path.
5. **Worker Resilience** — unhandled errors transition jobs to `FAILED` with sanitized, user-safe messages (no stack traces, paths, or tokens).
6. **AI Schema Validation** — all structured LLM output passes through `AISchemaValidator`; deterministic M6 facts are the fallback if the provider output is malformed.
7. **Rate Limiting / Abuse Protection** — layered limits on auth, GitHub, analysis, and chat.

---

## Running Tests

NEXORA ships automated security, multi-tenant isolation, and end-to-end test suites in `backend/scratch/`:

```bash
# M11 Security, Isolation, Schema & E2E (15 tests)
node backend/scratch/test_m11_hardening_e2e.js

# M10 Analysis API (5 tests)
node backend/scratch/test_m10_analysis_api.js

# Full frontend typecheck + production build
npm --prefix frontend run build

# Lint frontend
npm --prefix frontend run lint
```

---

## Performance

- **Parallel deep analysis** reduces AI analysis wall-clock time by ~**75%** (4 concurrent LLM nodes instead of 4 serial).
- **Local embeddings** remove embedding API latency; HNSW cosine index gives sub-linear vector retrieval.
- **Redis fast cache** short-circuits repeated job-status & repo-summary reads.
- **Groq inference** with JSON-mode + exponential-backoff retries keeps structured generation fast and reliable.

### Verified test results

- ✅ **M11 Hardening & E2E:** `15/15 Passed (100%)`
- ✅ **M10 Analysis API:** `5/5 Passed (100%)`
- ✅ **Frontend Typecheck & Build:** `✓ built in 1.05s (0 TypeScript errors)`

---

## Roadmap

- [ ] Redis-backed durable job queue (survive server restarts)
- [ ] Multi-language AST parser expansion (Go, Java, C#)
- [ ] Impact analysis & regression prediction on file change
- [ ] Team workspaces & shared analysis views
- [ ] Managed vector store export / import
- [ ] Embedding provider-swap (OpenAI/Cohere via factory — interface already present)

---

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-thing`).
3. Commit your changes (`git commit -m 'Add amazing thing'`).
4. Push (`git push origin feature/amazing-thing`).
5. Open a Pull Request.

---

<div align="center">

**NEXORA — Understand the system. Build the future.**

</div>