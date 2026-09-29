# KGWIKI-V2-FOUNDATION

Status: **Draft v0.1 — approved direction for KGwiki V2**

Baseline repository: `Greyusek/KGwiki`  
Baseline branch: `main`  
Baseline commit at the time of this document: `d61bced1ee792a85e21a7b9b8670dd9748575a72`

---

## 1. Why KGwiki V2 exists

The first KGwiki MVP attempted to solve several layers at once:

- user accounts;
- activity authoring;
- public activity catalog;
- comments, ratings and feedback;
- files and media;
- day plans;
- week plans;
- sharing of plans.

The result is technically useful but product-wise too broad for the current stage.

KGwiki V2 changes the development order.

The first product to make excellent is **the wiki itself**: a personal, structured pedagogical knowledge base where a teacher can quickly record, enrich, find and reuse activities.

Only after the activity model and wiki workflow are proven with real content should the product expand again into a shared multi-user library and then into curriculum/planning tools.

---

## 2. Product direction

### Phase 1 — Personal Wiki

A registered user has a personal library of pedagogical activities.

The user can:

- create an activity quickly;
- save an incomplete draft;
- enrich it later;
- structure it with pedagogical content blocks;
- attach files, links and resources;
- classify it;
- search it;
- edit and reuse it;
- record practical feedback after using it.

This phase must be valuable even if there is only one user in the system.

### Phase 2 — Shared KGwiki

The same `Activity` entity becomes shareable between users.

The system can then support:

- publication into a common catalog;
- copying/adapting another author's activity;
- practical feedback from multiple teachers;
- moderation;
- discovery of tested activities;
- thematic collections.

There must **not** be separate `PersonalActivity` and `PublicActivity` models. The same activity changes visibility/publication state.

### Phase 3 — Curriculum / Planner

Planning consumes the same Activity database.

Later layers may include:

- thematic blocks;
- day/week schedules;
- recurring activities;
- multi-session activities;
- activity progress for a group;
- annual curriculum;
- individual/group progress where appropriate.

Planner is therefore a **consumer of KGwiki**, not the foundation of KGwiki.

---

## 3. Current project: what is kept

The existing technical stack remains the project standard:

- Next.js App Router + TypeScript;
- Next.js route handlers;
- PostgreSQL;
- Prisma;
- NextAuth/Auth.js;
- MinIO;
- Docker Compose;
- Nginx.

The following existing capabilities are retained:

- users and authentication;
- `user` / `admin` roles;
- activity ownership;
- activity CRUD as an implementation base;
- private/public concept;
- source/copy lineage;
- file upload infrastructure;
- MinIO storage;
- material gallery;
- profile;
- admin area;
- backup/restore;
- RU/EN localization infrastructure;
- current Docker deployment.

These are useful foundations and should not be rewritten without a concrete need.

---

## 4. What is frozen, not deleted

The existing planning subsystem is **frozen** during Wiki V2 development:

- `Plan`;
- `PlanItem`;
- `PlanShare`;
- `WeekPlanDay`;
- plan APIs;
- plan services;
- plan pages.

Do not delete these tables or rewrite the planner during the wiki-first phase.

For the initial V2 UI they should be removed from the primary user flow:

- hide `Plans` from the main navigation;
- hide `Add to day plan` from Activity pages/cards;
- do not extend planner features.

The implementation should remain available in the repository for later rework.

---

## 5. Domain definition: Activity

### Core principle

An `Activity` is a **reusable pedagogical scenario**, not a scheduled event on a specific date.

Examples:

- interactive game “Colors”;
- craft “Hedgehog”;
- listening to a poem;
- multi-day reading of a long literary work;
- group attention/counting game;
- workbook-based recurring lesson;
- conversation about a topic;
- outdoor observation;
- shuttle-run exercise;
- song-learning activity;
- profession role-play.

A scheduled occurrence, a specific group’s progress, or a calendar event must be separate future concepts.

---

## 6. Activity Standard v0.1

The target domain shape is:

```text
Activity
├── Core
├── Classifications[]
├── Blocks[]
├── Materials[]
├── Sessions[]
├── Variants[]
├── Relations[]
└── Feedback[]
```

Not every extension must be implemented in the first migration. The design must, however, leave room for all of them.

---

## 7. Activity Core

The Activity core should remain intentionally small.

Target fields:

- `id`
- `authorId`
- `title`
- `summary`
- `ageMin`
- `ageMax`
- `durationMinMinutes`
- `durationMaxMinutes`
- `format`
- `seriesType`
- `status`
- `visibility`
- `sourceActivityId`
- `createdAt`
- `updatedAt`

### Age

Do not make a string such as `"4–5"` the long-term source of truth.

Prefer numeric bounds:

```text
ageMin = 4
ageMax = 5
```

This makes overlapping age searches possible.

### Duration

Prefer a range:

```text
durationMinMinutes = 10
durationMaxMinutes = 15
```

Some activities may have an approximate or single duration by setting both values equal.

### Draft-first workflow

Only a very small subset should be required to create an initial draft.

The minimal creation flow should aim for:

- title;
- short summary/idea;
- optional age;
- optional duration.

A user must be able to save an activity before fully classifying it.

---

## 8. Activity Format

`format` describes the **way an activity is conducted**, not its educational subject.

Initial candidates observed in real examples:

- `interactive_game`
- `craft`
- `listening`
- `reading`
- `group_game`
- `workbook`
- `conversation`
- `observation`
- `physical_exercise`
- `music`
- `role_play`
- `other`

This list is an initial vocabulary, not an immutable taxonomy.

A format may later drive authoring templates, for example:

- Conversation → talking points + questions + media;
- Physical exercise → equipment + setup + safety + route;
- Craft → preparation + consumables + printable templates + example result;
- Music → reference recording + backing track + movement cues.

---

## 9. Series type

The examples show three important activity shapes:

### `single`

One independent activity.

Example: craft “Hedgehog”.

### `finite_series`

A known sequence of related sessions.

Example: a long literary work split into 2–3 reading sessions.

### `ongoing_series`

A progressive activity without a fixed number of sessions.

Example: systematically working through a counting workbook.

Future group-specific progress does **not** belong to the Activity itself.

---

## 10. Activity Blocks

This is the main structural change for Wiki V2.

Do not replace the current flat Activity schema by dozens of optional columns such as:

- introSpeech;
- safety;
- teacherPreparation;
- questions;
- conclusion;
- assessment;
- etc.

Instead add an ordered content entity.

Suggested concept:

```text
ActivityBlock
- id
- activityId
- type
- title?
- content
- orderIndex
- metadata? (future, only if justified)
```

Initial block types:

- `goal`
- `objectives`
- `teacher_preparation`
- `intro`
- `instructions`
- `phase`
- `questions`
- `safety`
- `expected_result`
- `assessment`
- `conclusion`
- `teacher_notes`
- `custom`

The UI should make these feel like parts of a wiki page rather than database fields.

### Why blocks

Different activities require different structures.

“Hedgehog” may contain:

- Goal;
- Teacher preparation;
- Introduction;
- Glue face;
- Glue paws;
- Draw quills;
- Conclusion.

“Flying Swan” may contain:

- Goal;
- Setup;
- Rules;
- Game sequence;
- Safety;
- Variants.

The same model supports both without forcing irrelevant empty fields.

---

## 11. Phases and Sessions

These concepts must not be confused.

### Phase

A phase is a step inside one performance of an activity.

Example:

```text
Outdoor autumn observation
1. Introductory talk
2. Observe environment
3. Collect leaves for 5 minutes
4. Questions
```

For V2 Phase 1, phases can initially be represented by ordered `ActivityBlock(type=phase)`.

### Session

A session is one separate occurrence in a multi-session activity.

Example:

```text
The Tale of Tsar Saltan
Session 1 — first fragment
Session 2 — continuation
Session 3 — completion
```

Sessions are an extension milestone after Wiki Core. Do not block the first V2 migration on a perfect Session implementation.

---

## 12. Materials

Materials must become richer than `materialsNeeded: String[]`.

We need to distinguish:

- physical equipment;
- consumables;
- printables;
- documents;
- images;
- audio;
- video;
- presentations;
- digital interactive resources;
- books/workbooks;
- external links.

Suggested logical attributes:

```text
ActivityMaterial
- id
- activityId
- kind
- role
- name/title
- description?
- quantity?
- unit?
- audience?
- storage/url fields
- file metadata
- orderIndex
```

### Example roles

- `primary_resource`
- `print_template`
- `example_result`
- `reference_audio`
- `backing_track`
- `background_music`
- `teacher_text`
- `parent_home_material`
- `equipment`
- `consumable`

The exact vocabulary can evolve.

### Audience

Useful target audiences:

- `teacher`
- `children`
- `parents`

Example: a song text and backing track may be marked as suitable for sending to parents.

---

## 13. Classification

A single `category` is not enough.

An activity may simultaneously belong to multiple independent dimensions.

Long-term dimensions include:

- educational areas;
- topics;
- skills;
- season;
- participant mode;
- environment/location;
- routine context;
- purpose/use case.

Example:

```text
Activity: Autumn nature observation

Educational areas:
- surrounding world
- speech development

Topics:
- seasons
- autumn
- weather
- plants

Participant mode:
- whole group

Environment:
- outdoor
```

Do not hard-code all taxonomies in V2 Foundation. Start with a small implementation that can later evolve toward hierarchical topics.

---

## 14. Topic hierarchy and thematic blocks

“Autumn” is not an Activity.

It is a topic/collection that may contain activities from different domains:

```text
Autumn
├── conversation
├── poem
├── outdoor observation
├── craft
├── music
└── movement game
```

The future topic hierarchy may look like:

```text
Surrounding world
└── Seasons
    └── Autumn
        ├── Weather
        ├── Migratory birds
        ├── Animals
        └── Plants
```

Thematic collections are part of the bridge between Wiki and future Curriculum.

---

## 15. Variants

An activity may have adaptations without becoming a new activity.

Examples:

“Hedgehog”:

- younger children use pre-cut elements;
- older children cut elements themselves.

“Colors”:

- whole group answers;
- one selected child answers;
- English only;
- English first.

Future `ActivityVariant` may override or supplement:

- age;
- rules;
- materials;
- duration;
- blocks;
- complexity.

Variants are an extension milestone, not a blocker for Wiki Core.

---

## 16. Relations

Activities should eventually link to each other.

Examples:

- conversation about autumn → autumn poem;
- conversation about autumn → outdoor observation;
- song → performance rehearsal;
- reading → follow-up discussion;
- topic → related craft.

Potential relation types:

- `related`
- `recommended_before`
- `recommended_after`
- `continuation`
- `reinforces`
- `alternative`

This is also an extension milestone.

---

## 17. Feedback and evidence from practice

Practical feedback is important and should remain.

The existing `FeedbackEntry` idea is valuable because KGwiki should ultimately distinguish a theoretically attractive activity from one that has been successfully used by teachers.

Future feedback may include:

- what worked;
- what did not work;
- what should change;
- actual duration;
- age/group context;
- photos/results where appropriate.

Do not delete current feedback capability during the V2 migration.

Comments and ratings may be de-emphasized in the personal-wiki UI until the shared-library phase.

---

## 18. Wiki-first UX

### Main post-login destination

The primary workspace should become **My Wiki**.

Suggested main navigation for Phase 1:

- My Wiki
- Catalog (optional secondary entry; public/shared later)
- Profile
- Admin (admin only)

Plans should not appear in the primary navigation during Phase 1.

### Activity creation

The initial Activity creation form should be much shorter than the current form.

Target:

```text
Title *
Short description / idea
Age (optional)
Duration (optional)

[Create draft]
```

After draft creation, the user opens the Activity wiki page and enriches it with blocks and materials.

### Activity page

The Activity page should prioritize pedagogical content:

- title / summary;
- key metadata;
- ordered blocks;
- materials;
- variants/sessions/relations when later implemented;
- practical feedback.

Planner actions, ratings and social actions should not dominate the top of the page in the first phase.

---

## 19. Migration strategy

The current project contains working data structures and code. V2 must use an additive, reversible migration strategy.

### Rules

1. Do not destructively remove current Activity columns in the first migration.
2. Do not drop plan tables.
3. Add V2 fields/tables alongside current ones.
4. Keep existing Activity pages/API functional while the V2 path is being built.
5. Migrate UI in small steps.
6. Only remove deprecated columns after real content has been migrated and verified.

### Suggested compatibility approach

Phase A can add:

- V2 core fields as nullable/defaulted where necessary;
- `ActivityBlock`;
- enhanced material metadata or a V2 material model.

Existing data can continue using:

- `ageGroup`;
- `durationMinutes`;
- `goal`;
- `description`;
- `steps`;
- `materialsNeeded`;
- `category`.

A later migration can convert these fields into blocks/materials and then deprecate the old fields.

Do not attempt a one-shot schema rewrite.

---

## 20. Implementation milestones

### WIKI-FOUNDATION-001 — Product refocus

Goal: make the existing application feel like a personal wiki without changing the core data model yet.

- change post-login emphasis to My Wiki / My Activities;
- hide Plans from main navigation;
- hide Add-to-plan actions from Activity cards/details;
- update home page language;
- keep planner routes/code intact;
- update README/project direction documentation;
- preserve auth/admin/media.

Acceptance:
- existing app builds;
- existing plan routes still compile;
- primary UI no longer pushes the user into planning.

### WIKI-FOUNDATION-002 — Additive Activity V2 schema

Add, with migration:

- V2 core fields;
- `ActivityBlock`;
- first version of richer material metadata/model.

Do not remove old fields.

Acceptance:
- migration is non-destructive;
- current activities remain readable;
- build/tests pass.

### WIKI-FOUNDATION-003 — Draft-first Activity authoring

Implement:

- short create form;
- draft creation;
- Activity wiki page;
- add/edit/remove/reorder blocks;
- retain existing ownership/authorization rules.

Acceptance:
- user can create a useful draft in under a minute;
- user can enrich it later;
- no mandatory classification wall before saving.

### WIKI-FOUNDATION-004 — Materials UX

Implement richer material roles/kinds while continuing to use MinIO.

Acceptance examples:

- printable template;
- example result image;
- audio;
- backing track;
- digital resource/external link;
- physical equipment/consumable notes.

### WIKI-FOUNDATION-005 — Wiki discovery

Improve My Wiki:

- text search;
- basic filters;
- formats;
- age/duration;
- simple topics/tags.

Keep taxonomy deliberately modest until more real data is entered.

### WIKI-EXTENSIONS

Only after the Wiki Core is stable:

- Sessions;
- Variants;
- Activity Relations;
- hierarchical Topics;
- shared/common catalog improvements.

### SHARED-WIKI

Then:

- publication workflow;
- shared library;
- copying/adaptation;
- moderation;
- practical feedback aggregation.

### PLANNER-V2

Only after Activity V2 is proven with substantial real content.

---

## 21. Media and storage policy

### Real pedagogical materials

Do **not** store the real media library in GitHub.

Git is for:

- application code;
- migrations;
- documentation;
- small deterministic test fixtures when justified.

Real materials belong in MinIO/object storage:

- PDFs;
- MP3;
- images;
- videos;
- presentations;
- scans;
- printables.

### Local development persistence

The existing Docker Compose uses named volumes:

- `postgres_data`
- `minio_data`

These survive:

```bash
docker compose down
docker compose up --build
```

They are deleted only by destructive volume-removal operations such as:

```bash
docker compose down -v
```

Therefore a local tester does **not** need to upload all materials again after every rebuild.

Always treat `down -v` as destructive.

Use the existing backup/restore workflow before risky schema/storage operations.

---

## 22. Testing strategy

Testing must not depend on manually re-uploading the real pedagogical media library.

Use three layers.

### Layer 1 — Fast automated checks

Run on every change where relevant:

- lint;
- TypeScript/build;
- unit tests;
- validator/service tests.

These do not need real media.

### Layer 2 — Repeatable integration/demo fixtures

Create a deterministic development/test seed for V2.

It should create representative activities such as:

- interactive activity;
- craft;
- reading/listening;
- conversation;
- physical activity.

For media testing use small synthetic fixtures or generate them during test/seed execution.

Examples:

- tiny generated PNG;
- tiny text/PDF fixture if needed;
- short synthetic audio fixture only if truly required.

Do not commit copyrighted educational material just for tests.

The seed should be idempotent so a fresh environment can be brought to a useful demo state automatically.

### Layer 3 — Manual acceptance with persistent local data

Use the user's normal Docker environment with persistent PostgreSQL and MinIO volumes.

Real materials are uploaded once and remain through normal rebuild/restart cycles.

Manual acceptance should focus on:

- creating activities;
- editing blocks;
- uploading/opening/downloading materials;
- image/audio/document behavior;
- permissions;
- real teacher workflow.

Before migrations that can affect stored content, create a backup.

---

## 23. Work / cloud-agent testing expectations

A Work task should be able to complete most code verification without requiring the user's real material library.

The Work process should:

- run available automated tests;
- run build/lint;
- use deterministic fixtures;
- validate migrations;
- never assume real MinIO content exists in the task environment.

If Docker is unavailable in the execution environment, Work must say so and provide the exact local verification command instead of claiming Docker integration was tested.

The persistent local Docker installation remains the authoritative manual acceptance environment for media-heavy workflows.

---

## 24. Non-goals for the first V2 stage

Do not implement yet:

- annual curriculum generation;
- automatic schedules;
- individual child tracking;
- attendance;
- grades;
- recommendation algorithms;
- full taxonomy;
- complex moderation;
- microservices;
- Redis;
- Kubernetes;
- destructive planner rewrite.

---

## 25. Definition of success for Wiki V2 Phase 1

The first phase is successful when a teacher can:

1. sign in;
2. create a draft activity quickly;
3. structure it into meaningful pedagogical blocks;
4. attach all necessary supporting materials;
5. return later and continue editing;
6. find the activity again easily;
7. use the page during real preparation/work;
8. record practical feedback;
9. maintain a growing personal pedagogical knowledge base without using Planner.

At that point the project has a stable foundation for Shared KGwiki and later Planner V2.
