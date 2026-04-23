# KGWiki Remaining Backlog (Milestones 5–8)

## Current State

Completed:

* [x] Milestone 1–4 completed
* [x] Auth foundation running
* [x] Roles simplified to:

  * user
  * admin

Permissions rules:

* User can edit only:

  * own activities
  * copied/adapted activities owned by user
  * own plans

* Admin can edit everything.

Critical constraints:

* Do not introduce new roles.
* Do not break existing authentication.
* Do not refactor unrelated code.
* Preserve existing schema unless required for milestone delivery.

---

# PRE-CHECK (Run before Milestone 5)

Audit codebase for:

* broken routes
* missing imports
* TypeScript errors
* Prisma schema inconsistencies
* auth/authorization mistakes
* invalid ownership checks
* missing environment variables
* Docker issues

Fix all discovered issues.

Output after audit:

1. summarize issues found
2. list fixes applied
3. confirm project builds successfully

Verification:

```bash
npm run lint
npm run build
docker compose up -d
```

---

# Milestone 5 — Media Uploads

Goal:
Implement practical media/file uploads.

Deliver:

* Activity media uploads:

  * images
  * audio
  * video
  * documents

* Feedback media uploads

* Storage integration:

  * MinIO backend integration
  * metadata stored in database

* File management:

  * display uploads
  * delete by owner or admin

* Validation:

  * file types
  * file size
  * readable errors

* UX:

  * upload UI
  * preview images
  * download links for other files

Verification:

* upload works
* files persist
* ownership respected

Commands:

```bash
npm run lint
npm run build
```

Done when:

* Upload flow works
* Files linked to activities and feedback

Commit after completion.

---

# Milestone 6 — Plans

Goal:
Implement planning module.

Deliver:

Plan CRUD:

* create
* edit own
* delete own
* list own
* view own

Plan types:

* day plan
* week plan

Plan items:

* add activities
* manual ordering
* optional time
* notes

Pages:

* /plans
* /plans/new
* /plans/[id]
* /plans/[id]/edit

Permissions:

* own plans only for users
* admin manages all

Verification:

* ownership works
* day and week plans render
* activity linking works

Commands:

```bash
npm run lint
npm run build
```

Commit after completion.

---

# Milestone 7 — Profiles and Admin

Goal:
Complete user/admin workflow.

Deliver:

User profile:

* profile page
* user activities
* copied activities
* user plans

Profile editing:

* name
* avatar
* bio

Admin dashboard:
Sections:

* users
* activities
* plans
* comments

Admin capabilities:

* view/edit all activities
* view/edit all plans
* delete inappropriate comments

Also:

* improve seed demo data
* update README:

  * setup
  * env vars
  * seed process
  * roles
  * uploads

Verification:

* user profiles work
* admin routes protected
* admin management works

Commit after completion.

---

# Milestone 8 — Polish and Stabilization

Goal:
Prepare MVP for pilot testing.

Deliver:

Review:

* routing
* permissions
* validation
* empty states
* loading states
* error states

Improve UX:

* labels
* forms
* helper text

Improve browsing:

* filters
* readability
* mobile responsiveness

Demo readiness:

* realistic seed data
* verify Docker compose
* verify migrations
* verify upload flow

Reduce technical debt:

* remove duplication
* improve reuse
* clean types

Do NOT:

* add major new features
* expand scope

Verification:

```bash
npm run lint
npm run build
docker compose up -d
```

Done when:

* MVP stable
* local deployment ready
* pilot testing ready

Commit after completion.

---

# Mandatory Output After EACH Milestone

Before moving to next milestone, provide:

1. summary of what was implemented
2. list of created/modified files
3. shortcuts or temporary decisions made
4. things to improve later
5. confirm project builds successfully

Then proceed to next milestone.

---

# Execution Order

Run strictly sequentially:

Pre-check
→ Milestone 5
→ Milestone 6
→ Milestone 7
→ Milestone 8

After each milestone:

* run checks
* fix errors
* commit changes
* continue
