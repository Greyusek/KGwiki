# KGwiki - Milestone 1 Foundation

This repository contains the Milestone 1 baseline for a full-stack **Next.js + Prisma + PostgreSQL** project, ready for feature work in Milestone 2.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui base setup
- Prisma ORM + PostgreSQL
- NextAuth scaffold (credentials provider placeholder)
- Docker + Docker Compose
- Nginx reverse proxy
- MinIO for local file storage

## Project structure

```text
src/
  app/
    api/auth/[...nextauth]/route.ts
    activities/page.tsx
    admin/page.tsx
    login/page.tsx
    plans/page.tsx
    profile/page.tsx
    register/page.tsx
    layout.tsx
    page.tsx
  components/
    layout/top-nav.tsx
    ui/button.tsx
  lib/
    auth.ts
    prisma.ts
    utils.ts
  types/
    next-auth.d.ts
prisma/
  schema.prisma
  seed.ts
Dockerfile
docker-compose.yml
.env.example
```

## 1) Local development setup

### Prerequisites

- Node.js 22+
- npm 10+
- Docker + Docker Compose (recommended for services)

### Install dependencies

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Update values as needed (especially `NEXTAUTH_SECRET`).

### Start local app

```bash
npm run dev
```

App will run at: `http://localhost:3000`

## 2) Run with Docker Compose

Bring up Nginx, app, PostgreSQL, and MinIO:

```bash
docker compose up --build
```

Services:
- Nginx (entrypoint): `http://localhost`
- Next.js app (internal): `app:3000`
- PostgreSQL: `localhost:5432`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

## 3) Prisma workflow

Generate Prisma client:

```bash
npm run prisma:generate
```

Create and apply migration:

```bash
npm run prisma:migrate -- --name init
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

## 4) Seed demo data (later milestone)

A seed scaffold exists in `prisma/seed.ts`.

Run seed command:

```bash
npm run db:seed
```

> Currently this prints a placeholder message. Demo records should be added in a future milestone.

## 5) Authentication foundation

Authentication is intentionally scaffolded but not finalized:

- NextAuth route and auth handlers are wired.
- Credentials provider is present as a placeholder.
- Session/JWT role wiring is in place.
- Prisma schema includes `Role` enum (`user`, `admin`) and auth tables.

Milestone 2 should implement full registration/login validation, password hashing and checks, and route-level UX behavior.
