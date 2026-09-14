# NEXORA — AI-Powered Codebase Intelligence Platform

> **Understand the system. Build the future.**

NEXORA indexes entire software repositories, parses AST syntax structures, extracts vector embeddings into pgvector, executes repository-scoped RAG, and produces deterministic, fact-grounded codebase intelligence and architecture analysis through LangGraph and Groq.

---

## NEXORA V1 Architecture Flow

```mermaid
graph TD
    User([Authenticated Developer]) -->|OAuth 2.0| GH[GitHub Authorization]
    GH --> Repos[Repository Selection]
    Repos --> Job[Analysis Job Enqueued]
    Job --> Worker[Background Analysis Worker]
    
    subgraph Ingestion & Intelligence Pipeline
        Worker -->|Secure Fetch| Fetch[Workspace Fetch & Extract]
        Fetch -->|Filter & Redact| Scan[File Scanner & .gitignore]
        Scan -->|AST Parsing| Parsers[Symbols, Routes & Relations]
        Parsers -->|Chunking & Embedding| pgvector[(PostgreSQL + pgvector)]
    end
    
    subgraph AI Architecture Analysis
        pgvector -->|Scoped Vector Search| RAG[Repository-Scoped RAG]
        RAG -->|Deterministic Facts + Context| LangGraph[LangGraph State Machine]
        LangGraph -->|LLM Structured Inference| Groq[Groq Llama-3.3-70b]
        Groq -->|Typed Schema Sanitizer| Validator[AISchemaValidator]
        Validator -->|Persist Structured Analysis| DB[(PostgreSQL)]
    end
    
    DB --> API[REST API]
    API --> UI[Analysis Results Dashboard]
```

---

## Key Security & Hardening Features (V1)

1. **Strict Multi-Tenant Isolation**: Every API endpoint, repository record, analysis job, vector retrieval, and source preview is verified against the authenticated user ID derived exclusively from the verified JWT session. Client-supplied IDs are never trusted blindly.
2. **Zero Secret Leakage**: GitHub tokens, OAuth credentials, and API keys remain strictly backend-only. Tokens are never exposed in JSON responses, frontend storage, error messages, or logs.
3. **Ingestion & Workspace Security**:
   - Path traversal / Zip Slip defense blocks any attempts to write outside the isolated temporary workspace.
   - Symlinks escaping canonical root are detected and dropped.
   - Strict size limits: 50MB max repo size, 1,500 max files, 1MB max file size, 20MB max cumulative source size.
   - Sensitive files (`.env*`, `*.pem`, `*.key`, `credentials.json`, `service-account.json`) are automatically redacted (`[REDACTED_SENSITIVE_CONFIGURATION]`) and excluded from embeddings and AI prompts.
4. **Guaranteed Workspace Cleanup**: Extracted temporary workspaces are cleaned up via `finally` blocks across all success and error paths.
5. **Worker Resilience & Safe Errors**: Unhandled errors gracefully transition jobs to `FAILED` with sanitized user-facing messages (no internal stack traces, system paths, or tokens).
6. **AI Schema Validation Layer**: All LLM structured outputs pass through `AISchemaValidator` to enforce typed contracts and fallback to deterministic M6 codebase facts if external provider responses are malformed or partial.
7. **Rate Limiting / Abuse Protection**: Built-in rate limiting protects auth routes (40 req/15 min), GitHub endpoints (50 req/min), and analysis triggers (15 req/5 min).

---

## Environment Configuration

Create a `.env` file in `backend/` based on `backend/.env.example`:

```ini
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_strong_jwt_secret_key

# PostgreSQL Database (Neon with pgvector enabled)
DATABASE_URL=postgresql://username:password@ep-sample-pooler.aws.neon.tech/neondb?sslmode=require

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth App
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Groq LLM Inference
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

# Upstash Redis Cache (Optional fallback to memory)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here

# Pipeline Safety Limits
MAX_REPOSITORY_SIZE_MB=50
MAX_REPOSITORY_FILES=1500
MAX_FILE_SIZE_MB=1.0
MAX_TOTAL_SOURCE_SIZE_MB=20
EMBEDDING_DIMENSIONS=384
```

---

## Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v18+` or `v20+`
- **PostgreSQL**: Neon or self-hosted PostgreSQL with `pgvector` extension.
- **Groq API Key**: For fast structured inference.
- **GitHub OAuth App**: Registered in GitHub Developer Settings.

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Run Backend & Database Initialization
```bash
cd backend
npm run dev
```
*Note: On boot, the backend runs `initDB()` to automatically create tables (`users`, `github_accounts`, `repositories`, `analysis_jobs`, `repository_files`, `symbols`, `code_relationships`, `routes`, `project_metadata`, `code_chunks`, `repository_analyses`) and vector cosine indexes.*

### 4. Run Frontend Development Server
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Running Automated Tests

NEXORA includes an automated security, multi-tenant isolation, and end-to-end testing suite:

```bash
# Run M11 Security, Isolation, Schema & E2E Tests
node backend/scratch/test_m11_hardening_e2e.js

# Run M10 Analysis API Tests
node backend/scratch/test_m10_analysis_api.js

# Run Frontend Typecheck & Production Build
npm --prefix frontend run build
```

---

## Testing Results

- **M11 Hardening & E2E Test Suite**: `15/15 Passed (100%)`
- **M10 Analysis API Test Suite**: `5/5 Passed (100%)`
- **Frontend Typecheck & Build**: `✓ built in 1.05s (0 TypeScript errors)`
