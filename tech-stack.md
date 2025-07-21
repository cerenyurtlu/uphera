Backend

Language: Python 3.12

Framework: FastAPI (async)

Database: Supabase Postgres with pgvector extension

Vector Store: Native pgvector (fallback: Chroma)

Queue & Background Jobs: Celery + Redis (Railway add‑on)

AI Components

Embeddings: OpenAI text-embedding-3-large (multilingual, 3072‑dim)

Matching Ranker: Cosine similarity + rule‑based boosts

Fine‑Tuning / RL Re‑Ranker: trlX with preference feedback

Generation: gpt-4o-mini for personalised pitch emails

DevOps

CI/CD: GitHub Actions (flake8, pytest, Alembic migrations) → Railway deploy

Observability: Sentry (backend & frontend), PostHog analytics

Secrets Management: Railway env vars, Supabase Vault

Frontend

Framework: React 18 with Vite

Styling / Components: Tailwind CSS, shadcn/ui

Data Fetching: TanStack Query; WebSocket (Socket.IO) for real‑time status

Auth: Supabase magic‑link authentication

Infrastructure

Hosting: Railway (API & workers)

Storage: Supabase Storage for resumes & job specs

Email: SendGrid API (sandbox → production)

Optional Extensions

Slack / Teams Bot: Bolt‑Python microservice

Caching Layer: Cloudflare Workers KV for public job specs

