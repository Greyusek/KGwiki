# TASKS.md — Iteration 2026-04-27

## Archived (Completed in previous iteration)
- ✅ Phase 0 — Stability audit and baseline fixes.
- ✅ Phase 1 — Media upload endpoints/UI (MVP).
- ✅ Phase 2 — Initial plans CRUD (legacy model, now archived).
- ✅ Phase 3 — Profile and admin pages (initial MVP).
- ✅ Phase 4 — Stabilization pass (routing/filters/empty states).

## Active Tasks (Current iteration)

### 1) Critical plans model redesign (highest priority)
- [ ] Redesign **day plan** to use time-only schedule items with ordering.
- [ ] Redesign **week plan** to contain day plans (attached or inline), not raw activities.
- [ ] Ensure permissions: user owns edits, admin can edit all.

### 2) Plans UX improvements
- [ ] Separate day/week plans clearly on `/plans`.
- [ ] Add plan type filter, search by title, pagination.
- [ ] Show author, date/week start, and item/day counts on cards.

### 3) Add-to-plan flow from activities
- [ ] Keep manual dropdown add in plan form.
- [ ] Add “Add to day plan” from activity detail.
- [ ] Add “Add to day plan” from activity catalog cards.

### 4) Profile pagination/compaction
- [ ] Add 5/10/15 list size behavior for profile activity lists.

### 5) Bio visibility improvements
- [ ] Show bio clearly in profile.
- [ ] Show bio tooltip/popover behavior on activity author display.

### 6) Password reset security MVP hardening
- [ ] Return generic forgot-password response (no account existence leak).
- [ ] Log reset link only in dev/server logs.
- [ ] Document behavior in README.

### 7) Data + tests
- [ ] Update seed data for nested day→week structure.
- [ ] Add/update tests for day/week plan creation, sorting, add-to-day-plan, permissions.

### 8) Quality audit before handoff
- [ ] Run lint/build/tests.
- [ ] Check migrations and routes.
- [ ] Verify compatibility strategy for old week plan data.
