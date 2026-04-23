# TASKS.md

# Autonomous Execution Plan for Codex

## Operating Mode

Execute autonomously and sequentially.

Work strictly milestone-by-milestone.

Never work on multiple milestones simultaneously.

Do not skip verification.

Commit after every completed milestone.

If blocked:

* choose the smallest maintainable implementation
* document compromise
* continue

---

# Global Constraints (Do Not Break)

Preserve:

* existing auth flow
* existing user/admin role model
* existing migrations unless required
* existing Docker setup
* current working routes

Do NOT:

* add new roles
* introduce major new features
* refactor unrelated modules
* replace existing stack choices
* redesign architecture without necessity

This is MVP completion, not platform redesign.

---

# Mandatory Cycle For Every Milestone

For each milestone:

1. implement only current milestone scope

2. run:

```bash id="zhdj0p"
npm run lint
npm run build
```

If relevant:

```bash id="wgd1f8"
docker compose up -d
```

3. fix errors

4. summarize:

* implemented work
* changed files
* shortcuts taken
* improvements for later
* build status

5. commit changes

6. proceed to next milestone

Never continue with failing build.

---

# Phase 0 — Stability Audit

Audit and fix:

* broken routes
* missing imports
* TypeScript errors
* Prisma inconsistencies
* authorization bugs
* ownership checks
* env issues
* Docker issues

Goal:
Reach stable baseline before feature work.

Exit condition:
Project builds successfully.

Commit.

---

# Phase 1 — Milestone 5 Media Uploads

Implement:

* activity uploads
* feedback uploads
* MinIO integration
* metadata persistence
* file deletion permissions
* upload validation
* simple upload UI
* image preview if practical

Priorities:

1 stability
2 correctness
3 maintainability
4 UX polish

Avoid overengineering media pipeline.

Exit condition:

* upload flow works
* files persist
* ownership rules work

Commit.

---

# Phase 2 — Milestone 6 Planning

Implement:

Plan CRUD

Plan types:

* day
* week

Plan items:

* add owned activities
* ordering controls
* optional notes
* optional planned time

Pages:

* /plans
* /plans/new
* /plans/[id]
* /plans/[id]/edit

Permissions:

* users own only
* admin all

Drag-drop optional.
Use manual ordering if simpler.

Exit condition:
Plan workflow fully usable.

Commit.

---

# Phase 3 — Milestone 7 Profiles + Admin

Implement:

User profile:

* profile page
* activities
* adapted activities
* plans

Profile editing:

* name
* avatar
* bio

Admin:

* users
* activities
* plans
* comments

Simple practical admin UI.
Tables are acceptable.

Also improve:

* demo seed data
* README

Exit condition:
Full user/admin workflow complete.

Commit.

---

# Phase 4 — Milestone 8 Stabilization

Focus only on:

* consistency
* weak points
* technical debt
* pilot readiness

Improve:

* routing
* permissions
* validation
* loading/empty/error states
* filters
* mobile responsiveness

Fix:

* duplication
* weak types
* reuse problems

Do NOT add features.

Exit condition:
Pilot-ready MVP.

Commit.

---

# Agent Guardrails

If uncertain:

Prefer:

* simpler implementation
* maintainable implementation
* smaller change set

Avoid:

* speculative improvements
* scope expansion
* touching unrelated files

If a requirement risks breaking existing system:

* preserve working system
* choose minimal acceptable implementation
* document limitation

---

# Execution Order

Run only:

Phase 0
→ Phase 1
→ Phase 2
→ Phase 3
→ Phase 4

No reordering.

Stop only when all phases completed.
