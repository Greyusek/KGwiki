# TASKS.md — Iteration 2026-04-28

## Archived (Completed in previous iteration)
- ✅ 2026-04-27 scope archived (day/week redesign baseline, profile/admin polish, reset-hardening, seed/test pass).

## Active Tasks (Current iteration: weekly plan inline mode fix only)

1. Week plan model cleanup (no dates)
- [ ] Remove week start date from week plan create/edit/view flow.
- [ ] Week plan keeps only `title` and `working days (2–6)`.

2. Inline day block cleanup (no dates/labels)
- [ ] Remove inline editable day label input.
- [ ] Remove inline day date field.
- [ ] Keep fixed Day 1..Day N block titles only.

3. Inline day activity structure
- [ ] Allow multiple activities per inline day.
- [ ] Add `Add activity` action in each inline day block.
- [ ] Support optional remove row action.
- [ ] Each row supports activity + optional time (HH:mm) + optional notes.

4. Persistence bug fix
- [ ] Ensure inline week day data saves correctly.
- [ ] Ensure saved inline data reloads after refresh.
- [ ] Ensure week plan edit page rehydrates inline data.

5. Optional time sort behavior
- [ ] Sort timed activities first by time.
- [ ] Keep untimed activities after timed items.

6. Validation/help text
- [ ] Add min-character validation messaging for activity fields: title/summary/goal/description.
- [ ] Add helper text in activity form and day plan form where relevant.

7. Tests
- [ ] Add/update tests for inline week mode creation with multiple day activities and persistence shape.
- [ ] Keep sorting verification coverage.
