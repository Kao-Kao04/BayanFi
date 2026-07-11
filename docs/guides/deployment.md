# BayanFi Deployment Guide

## Local Development

### Prerequisites
- Node.js 20+, Python 3.11+, Docker & Docker Compose, Rust (for contracts)

### Steps

```bash
# 1. Install dependencies FIRST (required before any script that imports packages)
npm install

# 2. Configure environment
cp .env.example .env            # PowerShell: Copy-Item .env.example .env

# 3. Generate a Stellar master account and paste keys into .env
npm run stellar:setup

# 4. Start infrastructure (Docker Compose V2 syntax; requires Docker Desktop running)
docker compose up -d postgres redis

# 5. Set up the database
npm run db:generate
npm run db:migrate
npm run db:seed

# 6. Start all services
npm run dev
```

> **Windows / PowerShell notes**
> - Run commands one per line. Windows PowerShell 5.1 does not support `&&` chaining; use `;` or separate lines.
> - Use `docker compose` (with a space), not `docker-compose`. If `docker` is not found, install/start Docker Desktop.
> - `npm install` must run before `npm run stellar:setup`, otherwise `stellar-sdk` won't be resolved.

### Redis is optional

The MVP does **not** require Redis. Rate limiting uses in-memory storage, and no
queues run at boot. Leave `REDIS_*` blank in `.env`. Redis is a Phase 2 scaling
concern; enable its container only when needed:

```bash
docker compose --profile with-redis up -d
```

### Recommended: Supabase (free hosted Postgres, zero local install)

Supabase is the default database for BayanFi — no Docker or local Postgres needed.

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → Database → Connection string → URI**.
3. Choose the **direct connection** (host `db.<ref>.supabase.co`, port **5432**,
   "Session mode"). Prisma migrations require session mode — do **not** use the
   transaction pooler on port 6543 (it lacks prepared-statement support).
4. Replace `[YOUR-PASSWORD]` with your database password and paste into `.env`:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.<ref>.supabase.co:5432/postgres?sslmode=require"
   ```
5. Run migrations, seed, and start:
   ```bash
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

This runs the full backend + frontend + AI service with **nothing** installed
locally except Node.

> **Production note:** for high-concurrency serverless deploys, use the Supabase
> transaction pooler (6543) as `DATABASE_URL` with `?pgbouncer=true`, and add a
> `directUrl` (5432) to the Prisma datasource for migrations.

Services:
- Web: http://localhost:3000
- API + Swagger: http://localhost:4000/api/docs
- AI service: http://localhost:8000/docs

Demo credentials (from seed): `admin@bayanfi.io` / `BayanFi@2026`

## Full Docker Deployment

```bash
docker-compose up -d --build
```

This starts PostgreSQL, Redis, backend, AI service, web, and Nginx (port 80).

## Production Deployment

### Environment
1. Provision managed PostgreSQL 15+ and Redis 7+.
2. Set all secrets via your platform's secret manager (never in code).
3. Use `STELLAR_NETWORK=mainnet` and a properly funded, HSM-backed master account.
4. Set strong `JWT_SECRET`, `JWT_REFRESH_SECRET`, and a 32-char `ENCRYPTION_KEY`.

### Build & Push Images

```bash
docker build -f apps/backend/Dockerfile -t registry/bayanfi-backend .
docker build -f apps/web/Dockerfile -t registry/bayanfi-web .
docker build -f apps/ai-service/Dockerfile -t registry/bayanfi-ai .
docker push registry/bayanfi-backend registry/bayanfi-web registry/bayanfi-ai
```

### Database Migration

```bash
npm run db:migrate:deploy --workspace=apps/backend
```

### Kubernetes
Manifests live in `infrastructure/kubernetes/`. Apply with:

```bash
kubectl apply -f infrastructure/kubernetes/
```

Horizontal Pod Autoscalers scale the stateless backend, AI, and web tiers on
CPU and request rate.

## Smart Contract Deployment

```bash
cd contracts/program_escrow
stellar contract build
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/program_escrow.wasm \
  --source <SECRET> --network testnet
```

## Health Checks

- Backend liveness: `GET /health`
- Backend readiness: `GET /health/ready`
- AI service: `GET /health`
- Nginx: `GET /health`

## Rollback

Deployments use blue/green. To roll back, shift traffic to the previous
revision:

```bash
kubectl rollout undo deployment/bayanfi-backend
```

Stellar ledger state is inherently preserved and recoverable from the public
network.

## Monitoring

- Metrics: Prometheus scrapes `/metrics`; visualize in Grafana.
- Errors: Sentry via `SENTRY_DSN`.
- Logs: structured JSON (Pino) shipped to Loki/CloudWatch.
- Uptime: external monitor against `/health`.
