# WORK PROMPT — KGwiki V2 Wiki-First

Repository: `Greyusek/KGwiki`

## Mission

Continue KGwiki as **KGwiki V2 / Wiki-First**.

The current application is a technically useful first MVP, but it tried to implement users, activities, social collaboration and day/week planning too early.

The new development order is:

```text
Personal pedagogical Wiki
→ Shared KGwiki
→ Curriculum / Planner
```

The immediate goal is to make KGwiki an excellent personal structured activity knowledge base for one registered user while preserving the architecture needed for multiple users and future planning.

## Source of truth

Before changing code, read:

1. `AGENTS.md`
2. `KGWIKI-V2-FOUNDATION.md`
3. `README.md`
4. `prisma/schema.prisma`
5. current Activity pages/services/validators
6. current media/MinIO code
7. current plan code only to understand dependencies

Treat `KGWIKI-V2-FOUNDATION.md` as the product/domain source of truth for this work.

Do not invent a new architecture that conflicts with it.

## Important constraints

Keep the existing stack:

- Next.js App Router + TypeScript
- Next.js API route handlers
- PostgreSQL
- Prisma
- NextAuth/Auth.js
- MinIO
- Docker Compose
- Nginx

Do not introduce:

- microservices
- Redis
- Kubernetes
- another ORM
- another auth system
- filesystem media storage in place of MinIO

## Planner policy

The existing planner is **frozen, not deleted**.

Do not remove:

- Plan
- PlanItem
- PlanShare
- WeekPlanDay
- plan APIs/services/pages

During Wiki V2 Phase 1:

- do not add planner features;
- do not redesign planner;
- do not perform destructive planner migrations.

The planner may be hidden from the main UI, but its code and schema must remain compilable.

## Media policy

Do not commit the real pedagogical media library to GitHub.

Real PDFs, MP3s, images, video, presentations and scans belong in MinIO.

Tests should use deterministic synthetic/small fixtures or generated fixtures.

Local Docker named volumes are expected to preserve real test data across normal rebuilds.

Never use `docker compose down -v` as a routine test/reset command.

## Working style

Make small reviewable changes.

For each milestone:

1. inspect current code;
2. state the intended changes;
3. implement only the milestone scope;
4. run the relevant tests;
5. run build/lint where applicable;
6. summarize changed files;
7. report any untested paths or environment limitations;
8. stop before the next milestone unless explicitly instructed to continue.

Do not claim Docker/MinIO integration was tested if Docker is unavailable.

Do not bypass authorization or repository permissions.

## First task: WIKI-FOUNDATION-001

Implement **Product refocus only**.

This task should NOT perform the Activity V2 database redesign yet.

Required changes:

- make `My Wiki` / user's own activities the primary authenticated workflow;
- remove/hide `Plans` from primary navigation;
- remove/hide `Add to day plan` actions from Activity catalog/cards/detail UI;
- keep planner routes, APIs, services and Prisma models intact;
- replace obsolete Milestone-1 homepage messaging with Wiki-First product messaging;
- update relevant RU/EN navigation/UI strings;
- keep public catalog available as a secondary capability if this can be done without scope creep;
- preserve profile/admin/auth/media functionality;
- update README where necessary to state the new Wiki-First direction;
- do not modify the Activity schema in this milestone.

Verification:

- run existing tests;
- run lint;
- run production build;
- verify no planner schema/code was deleted;
- report any pre-existing warnings separately.

Deliver the result as a focused branch/PR if repository permissions allow. Do not merge automatically unless the user explicitly asks for automatic merging in this Work session.

After completing WIKI-FOUNDATION-001, stop and provide:

- summary;
- changed files;
- test/build results;
- risks;
- exact manual acceptance checklist.

Do not start WIKI-FOUNDATION-002 until instructed.
