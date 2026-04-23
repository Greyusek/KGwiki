# KGwiki Foundation (Stabilized Local Docker Setup)

This repository contains the Milestone 1 / early Milestone 2 KGwiki foundation using Next.js, Prisma, PostgreSQL, NextAuth/Auth.js, MinIO, Docker Compose, and Nginx.

The repository is now set up so a fresh clone can be started locally with:

1. `cp .env.example .env`
2. `docker compose up --build`
3. Open `http://localhost:3000`

---

## Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)
- Git

> You do **not** need host-side Node.js/Prisma to run the app in Docker.

---

## Local startup (fresh clone)

```bash
git clone <your-repo-url>
cd KGwiki
cp .env.example .env
docker compose up --build
```

Open:
- App: `http://localhost:3000`
- Nginx proxy: `http://localhost`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

---

## What Docker does automatically

During image build:
- installs dependencies
- runs `prisma generate`
- runs `next build`

At container startup:
- runs `prisma migrate deploy`
- runs idempotent seed (`npm run db:seed`)
- starts Next.js (`npm run start`)

This removes the need for manual host-side Prisma generation/migration for normal local Docker startup.

---

## Environment configuration

Create `.env` from `.env.example` and update values as needed.

Key variables:
- `DATABASE_URL` (Docker-internal Postgres URL)
- `NEXTAUTH_SECRET` / `AUTH_SECRET`
- `NEXTAUTH_URL` / `AUTH_URL` (set to `http://localhost:3000`)
- `AUTH_TRUST_HOST=true` / `NEXTAUTH_TRUST_HOST=true` for local Docker host trust
- MinIO variables (`MINIO_*`)

---

## Rebuild / restart / stop

Rebuild images and restart:

```bash
docker compose up --build
```

Restart without rebuild:

```bash
docker compose up
```

Stop containers:

```bash
docker compose down
```

Stop and remove volumes (resets DB/MinIO data):

```bash
docker compose down -v
```

---

## Troubleshooting

### Prisma issues

If schema/migrations changed and app fails at startup:

```bash
docker compose down -v
docker compose up --build
```

This resets local database volume and reapplies migrations + seed.

### Auth.js `UntrustedHost` errors

Ensure these are set in `.env`:

- `AUTH_TRUST_HOST=true`
- `NEXTAUTH_TRUST_HOST=true`
- `NEXTAUTH_URL=http://localhost:3000`
- `AUTH_URL=http://localhost:3000`

Then rebuild:

```bash
docker compose up --build
```

### Build failures around Prisma client

The Dockerfile explicitly runs `prisma generate` before build. If lockfiles/dependencies changed unexpectedly, rebuild from scratch:

```bash
docker compose build --no-cache app
docker compose up
```

---

## Optional host-side checks (non-Docker workflow)

If you want to run checks locally on host:

```bash
npm install
npm run build
npm run lint
```

