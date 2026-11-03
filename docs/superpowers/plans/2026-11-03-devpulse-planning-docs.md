# DevPulse Planning Documentation Implementation Plan

**Superseded by r3 and r4. Do not execute.** This is the historical r2 plan. Its "REQUIRED SUB-SKILL" header below no longer applies: while OD-15 is unresolved, no implementer or reviewer subagents are dispatched. The current documents are the six baseline files; see `docs/superpowers/plans/2026-11-03-devpulse-planning-r4.md` for the latest revision.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Revision:** r2, 2026-11-03. This revision applies David's review comments; see the Revision log at the end.

**Goal:** Write the five planning documents that define what DevPulse is and the order it will be built in:
- requirements
- architecture
- the chunked roadmap
- README
- CLAUDE.md

Nothing is initialized and no application code is written.

**Architecture:** Documentation only.
- `docs/REQUIREMENTS.md` is the source of truth for *what* gets built. It separates confirmed requirements from assumptions and from proposed items.
- `docs/ARCHITECTURE.md` describes the proposed *how* at system level.
- `docs/IMPLEMENTATION_ROADMAP.md` orders the work into 10 phases and 36 chunks. It uses the brief's chunk format plus conventions borrowed from the Web → Mobile Parity to-do.
- `README.md` and `CLAUDE.md` summarize the other three and point to them.

The documents are written in dependency order, so each one can cite the IDs defined in the earlier ones.

**Tech Stack:** Markdown. The application stack being documented is locked by the brief: Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui, SQLite, Drizzle ORM, a Node.js collection script, RSS/Atom and permitted public APIs, Windows Task Scheduler, Vitest and Playwright.

**Spec:** David's brief "Task: Initialize DevPulse Project Planning and Create Implementation Roadmap", pasted into the session on 2026-11-02. It is not stored as a file; Task 1 captures every requirement from it in `docs/REQUIREMENTS.md`. David's review of r1 (2026-11-03) is the second input.

**Format reference:** "Web → Mobile Parity: Chunked To-Do" (`C:\Users\user\Desktop\sharetribe-app\docs\superpowers\plans\2026-10-05-web-parity-todo.md`). David pasted its content into the session because a permission setting blocks reading the file directly.

## Global Constraints

**Scope**
- Create exactly five files: `README.md`, `CLAUDE.md`, `docs/REQUIREMENTS.md`, `docs/ARCHITECTURE.md` and `docs/IMPLEMENTATION_ROADMAP.md`.
- Do not run `git init` or `create-next-app`, install anything, create a `package.json`, or write application code.
- Make no commits. The folder is not a git repository, and initializing one is roadmap task 1.1.

**Verbatim values**
- Task name: `DevPulse-Weekly-News-Collection`.
- Schedule: "every Monday at 08:00 Malaysia time" (`Asia/Kuala_Lumpur`).
- Command: `yarn news:sync`.
- Summary: "2–4 sentences".
- Key takeaways: "3–5 bullets".
- Difficulty: `Beginner` / `Intermediate` / `Advanced`.
- Retention: "two months".

**Requirement labels.** Every statement in the documents carries exactly one of these:

| Label | Meaning |
|---|---|
| **Confirmed (brief)** | Stated in David's brief |
| **Assumption (A-NN)** | Inferred, not stated. David confirms it, and the documents list what depends on it |
| **Proposed (AD-NN / P-NN)** | A technical decision or target, not a requirement. It may change in a chunk spec, unless the change touches cost, privacy, the stack or product behaviour. In that case it becomes an open decision (OD) |
| **Open decision (OD-NN)** | David decides |

Nothing labelled Assumption or Proposed is ever written as confirmed.

**Gate markers in the roadmap**

| Marker | Meaning | Used for |
|---|---|---|
| ⛔ in the chunk heading | Do not start until David's decision is recorded | Only when the decision changes what is built (or whether it is built), or involves cost, privacy, irreversible deletion or a significant architecture change. ⛔ chunks count as Blocked. |
| `Decision before completion: OD-NN` on the Dependencies line | The chunk may start. Its Proposed default lives in one place, and David's decision must be recorded before the chunk is marked `[x]`. | Decisions that only change a value or a single switch |
| `Decision preparation (no application code)` | The chunk prepares a decision for David | Chunk 16 only. Never counted as Blocked. |
| `Go-ahead at execution time` on a task | David approves the action on the day it happens | Actions on David's PC: registering tasks, changing the timezone, live provider calls |

Status markers are `[ ]` `[~]` `[x]` `[!]`.

**Simplification honesty.** The `none` and `fake` providers exist so that collection and testing can proceed without an external AI. They do not satisfy FR-SIM-01…08. Real article simplification stays incomplete until David approves a provider (OD-01) and its output is verified (Chunk 32). The README, the roadmap progress summary and Chunk 36 all say so.

**Scheduling proof rule.** Unit tests in Chunks 7, 29 and 30 prove date maths and the generated task definition, and nothing more. They never count as proof that scheduling works. Chunks 29, 30 and 36 can be marked complete only with real Windows observations recorded on David's PC: the date, the command run and its real output.

**Other rules**
- Never claim a feature is implemented. The documents' status is "Planning — no application code yet".
- Assume no paid service. Provider names appear only as candidates under OD-01 and Chunk 16.
- Use the brief's exact chunk format: Goal / Difficulty / Dependencies / tasks with `Test:` and `Acceptance:` / Manual verification / Status. Each chunk has 1–5 tasks, and task IDs `N.M` are unique.
- Refer to David by name, never by guessed pronouns.
- **Markdown hygiene.** The five documents must be free of markdownlint warnings in the IDE. Use blank lines around lists (MD032), real headings rather than bold text (MD036), and spaced table pipes (MD060). Task 6 checks this with IDE diagnostics. This plan file itself carries those style warnings; they are cosmetic and are not reformatted.

## Review Focus

These failure modes are implied by the brief but no task's tests would otherwise exercise them. Each one is pinned as a test or a real check in the chunk that owns it:

1. **The PC's timezone is not MYT, or a time falls exactly on the Sunday 23:59:59 / Monday 00:00 MYT boundary.**
   - Chunk 7 unit tests run under `TZ=UTC` and `TZ=America/New_York`.
   - Real Windows check 29.4: temporarily switch the Windows timezone and confirm the task's next run time is still 08:00 MYT.
2. **The PC is asleep, off or offline at Monday 08:00, or a feed has dropped older items.**
   - Chunk 30 tests the due-week logic.
   - Real Windows checks 30.3 and 30.4 cover sleep, shutdown and network loss.
   - Risk R-01 records that a feed's limited history caps what can be recovered.
3. **A feed item has a missing, unparseable or future date, or the same article arrives from two sources in one run.**
   - Covered by Chunk 9 and Chunk 10 tests.
   - Re-running the same week inserts 0 rows.
4. **The provider is absent, throws, returns output that breaks the schema, or receives article text containing injected instructions.**
   - Chunk 14 tests with the `none` and `fake` providers.
   - Chunk 31 contract tests.
   - In every case the article's metadata is still stored.
5. **A crash mid-run leaves a lock or a `running` run record behind, or a retry needs text that may not be stored.**
   - Chunk 24 tests stale-lock takeover.
   - Chunk 15 tests the re-fetch path, including `content_unavailable`.

## Execution

**Recommended: Native.** I write all five documents in this session, because they share IDs and must agree line for line.

---

### Task 1: `docs/REQUIREMENTS.md`

**Files:** Create `docs/REQUIREMENTS.md`.

**Interfaces:**
- **Produces:**
  - functional requirement IDs `FR-COL-01…07`, `FR-SIM-01…11`, `FR-DATA-01…07`, `FR-DASH-01…13` and `FR-AUTO-01…09`;
  - technical and non-functional IDs `TR-NN` and `NFR-01…09`;
  - assumptions `A-01…A-06`, the proposed target `P-01` and open decisions `OD-01…OD-10`.
- **Used by:** Tasks 2–5.

- [ ] **Step 1: Write the opening sections.**
  - **"How to read this document":** the four requirement labels from Global Constraints.
  - **"Purpose & scope":** what DevPulse is for.
  - **"Out of scope":** taken from the brief: chatbot, building a local AI model, and unrelated features. Plus the items that follow from assumptions, each cited to its assumption: multi-user or login (A-03), and grouping the same story across outlets (A-02).
- [ ] **Step 2: Write "Functional requirements — Confirmed (brief)".**
  - **Collection:** FR-COL-01…07.
  - **Simplification:**
    - FR-SIM-01…08: the eight output fields;
    - FR-SIM-09: collection continues when simplification fails;
    - FR-SIM-10: failed articles are recorded for retry;
    - FR-SIM-11: choosing a provider and processing content externally need David's approval.
  - **Data and retention:** FR-DATA-01…07.
  - **Dashboard:** FR-DASH-01…13.
  - **Automation:** FR-AUTO-01…09.
  - Add a status note under FR-SIM-01…08: "Satisfied only by an approved, verified provider (Chunks 31–32). The `none` and `fake` providers do not satisfy these requirements."
- [ ] **Step 3: Write "Technical requirements — Confirmed (brief)" and "Non-functional requirements — Confirmed (brief)".**
  - **Technical requirements (TR-NN):** the locked stack, and that collection runs independently of Next.js.
  - **Non-functional requirements, NFR-01…09, stated in the brief only:**
    - local-first;
    - nothing paid without approval;
    - no external AI without approval;
    - no unnecessary architecture;
    - not a chatbot and no local model;
    - no unrelated features;
    - no silent requirement changes;
    - a personal Windows application;
    - the PC must be on, awake and online for scheduled runs.
- [ ] **Step 4: Write "Assumptions — need David's confirmation".** List A-01…A-06 from Appendix C, each with Basis, Affects chunks and Status `Pending`. Then write "Proposed — not requirements": P-01 and a pointer table to the AD items in ARCHITECTURE that are often mistaken for requirements (database driver, retry limit, catch-up cap, localhost binding, Node/Yarn versions).
- [ ] **Step 5: Write "Open product decisions".**
  - A summary table plus one subsection per decision (OD-01…OD-10, from Appendix B).
  - Each subsection gives: Options / Recommendation / Gate type (⛔, before completion, or prepared in) / Chunks / Status `Pending`.
- [ ] **Step 6: Write the "Decision log".** An empty table: `| Date | ID | Decision | Choice | Decided by | Notes |`. It records outcomes for ODs and confirmations of assumptions.
- [ ] **Step 7: Verify.**
  - Grep `^\| OD-\d\d` → 10 matches.
  - Grep `^\| A-0\d` → 6 matches.
  - Grep `English` → it appears only in A-05 and in the output-language requirement.
  - Grep `implemented` → no claim that anything is implemented.

### Task 2: `docs/ARCHITECTURE.md`

**Files:** Create `docs/ARCHITECTURE.md`.

**Interfaces:**
- **Consumes:** the IDs from Task 1.
- **Produces, for Tasks 3–5:**
  - `AD-01…AD-22` and `R-01…R-16`;
  - the component names;
  - the proposed table names: `articles`, `article_technologies`, `article_roles`, `collection_runs`, `collection_run_sources`, `job_lock`;
  - the folder layout.

- [ ] **Step 1: Write the header and diagram.**
  - Header banner: "Proposed — not yet approved by David".
  - ASCII diagram:
    - Task Scheduler starts `yarn news:sync`;
    - the run goes: lock → connectors → extract/validate → dedupe → store → simplify → retry → cleanup → record;
    - it writes to SQLite at `data/devpulse.db`;
    - the Next.js dashboard reads that database and serves `127.0.0.1` to the browser;
    - outbound HTTPS goes to news sources and to "AI provider (only if approved)".
- [ ] **Step 2: Write the eight component sections.** Each one covers Responsibility, Does not, Talks to and Status. These boundaries are fixed:
  - The collector never imports Next.js.
  - The dashboard never fetches news and never calls the provider. The optional Chunk 28 would only start the collector process.
  - The provider sees one article at a time, through `SimplificationProvider.simplify()`.
  - SQLite is the only state shared between processes.
  - Task Scheduler only runs the wrapper script.
  - Retention runs inside `news:sync` under the lock, and also as `yarn news:cleanup`.
- [ ] **Step 3: Write the proposed data model, run flow and article lifecycle.**
  - **Lifecycle:** `pending → simplified | failed → (retry) → simplified | failed permanently`.
  - **Provider rules:**
    - with the `none` provider, an article stays `pending` and is not counted as a failure;
    - every article records the name of the provider that processed it;
    - `fake` output is labelled as test data and never presented as a real simplification.
- [ ] **Step 4: Write the cross-cutting sections.**
  - **Time:** timestamps stored in UTC; one MYT time module; MYT is fixed at UTC+8 with no daylight saving; the trigger is `+08:00`, synchronized across time zones.
  - **Concurrency:** WAL mode, `busy_timeout`, short transactions, a `job_lock` row with PID and heartbeat, and Task Scheduler's IgnoreNew setting.
  - **Error strategy:** per-source isolation, partial runs, exit codes, restart-on-failure.
  - **Security and data handling:**
    - original article text is held in memory only;
    - retries re-fetch the content instead of reading stored text;
    - rendering relies on React escaping, never `dangerouslySetInnerHTML`;
    - links are http(s) only, opened with `noopener`;
    - secrets live only in `.env.local`;
    - feed content in prompts is treated as untrusted;
    - every outbound request has a timeout, a size cap and a User-Agent, and follows the source's terms.
  - **Folder layout.**
  - **"Scheduling verification":** the scheduling proof rule.
- [ ] **Step 5: Write the decision register, risks and dependencies.**
  - **Decision register:** AD-01…AD-22 from Appendix D. Each entry gives Decision / Why / Alternatives considered / Status `Proposed` / "Needs David if…".
  - **Risks:** R-01…R-16 from Appendix E, each with its mitigation and owning chunk.
  - **External dependencies.**
- [ ] **Step 6: Verify.**
  - All eight components have a `## ` heading.
  - AD-02 lists its alternatives.
  - Every AD row has a Status.
  - Provider names appear only in the context of OD-01.

### Task 3: `docs/IMPLEMENTATION_ROADMAP.md`

**Files:** Create `docs/IMPLEMENTATION_ROADMAP.md`.

**Interfaces:**
- **Consumes:** the IDs from Tasks 1–2.
- **Produces:** chunk numbers 1–36 and their task IDs.

- [ ] **Step 1: Write the header in the reference doc's style.**
  - Title: "DevPulse: Chunked Implementation Roadmap".
  - `**Source:**` `docs/REQUIREMENTS.md`, `docs/ARCHITECTURE.md`.
  - The framing paragraph: "This is a backlog, not an implementation plan…" Specs go in `docs/superpowers/specs/` and plans in `docs/superpowers/plans/`.
- [ ] **Step 2: Write the progress summary, gates table and usage rules.**
  - **Progress summary:**
    - Total phases 10 · Total chunks 36 · Completed 0 · In progress 0 · Blocked 5 (⛔) · Remaining 36 · Last updated 2026-11-03.
    - "Roadmap start: awaiting David's approval of the planning documents."
    - "Article simplification: incomplete until OD-01 is approved and Chunk 32 is verified."
  - **Gates table:** reproduce Appendix B, Part 1. It covers ⛔, decision before completion, decision preparation, go-ahead at execution time, and optional/conditional chunks.
  - **Legend:** the status markers, gate markers and difficulty levels.
  - **"How to use it":**
    - one chunk = one branch, `chunk-NN-slug` off `main`;
    - write the test first;
    - follow the brief's 11 usage rules;
    - tick each task with its commit hash;
    - write an italic note on what was and was not checked by hand;
    - work in dependency order;
    - ⛔ means do not start;
    - "Decision before completion" means do not mark the chunk `[x]` until the decision is logged;
    - apply the scheduling proof rule;
    - a chunk skipped by David's decision is marked "Skipped (OD-NN)" and leaves Remaining;
    - update the summary on every change.
  - **Definition of done:** the brief's six conditions, plus "any decision-before-completion is logged" and "scheduling chunks have real Windows evidence".
- [ ] **Step 3: Write the phase overview and the 36 chunks from Appendix A, in the brief's exact chunk format.**
  - Every task has a `Test:` line and an `Acceptance:` line.
  - The Dependencies line holds the chunk numbers, plus `Decision before completion: OD-NN` where it applies.
  - `**Status:**` is `Not started.`, or `Blocked — awaiting OD-NN.` for ⛔ chunks.
  - The Review Focus items go into Chunks 7, 9, 10, 14, 15, 24, 29, 30 and 31.
- [ ] **Step 4: Write the closing sections.**
  - "Decisions blocking ⛔ chunks".
  - The coverage matrix (35 items → chunks).
  - Requirement traceability (every FR/TR/NFR → chunks).
  - The change log.
- [ ] **Step 5: Verify.**
  - `^### Chunk \d+ — ` → 36 matches.
  - Goal, Difficulty, Dependencies, Manual verification and Status → 36 matches each.
  - Task IDs are unique, with 1–5 per chunk.
  - Headings with ⛔ → 5 (Chunks 12, 27, 28, 31, 32).
  - `Decision before completion:` → 5 (Chunks 13, 18, 21, 29, 30).
  - `Decision preparation` → only Chunk 16.
  - Every dependency number is lower than its chunk's number.
  - No unblocked chunk depends on a ⛔ chunk, except Chunk 36 (see Appendix B).
  - Every FR/TR/NFR is traced.

### Task 4: `README.md`

**Files:** Create `README.md`.

- [ ] **Step 1: Write the README sections.**
  - Overview.
  - **Status:** "Planning — no application code yet". Add the sentence: "Real article simplification needs an AI provider that David has not yet chosen; until then DevPulse can collect articles but not simplify them."
  - Main goals.
  - Stack table.
  - "Planned features".
  - The architecture diagram.
  - Prerequisites.
  - A documentation index.
  - Development status.
- [ ] **Step 2: Verify.**
  - Grep `implemented|works|working` → no claim that anything works.
  - Every link in the index resolves (check with Glob).

### Task 5: `CLAUDE.md`

**Files:** Create `CLAUDE.md`.

- [ ] **Step 1: Write CLAUDE.md, about 120 lines at most.** Sections:
  - **Context.**
  - **Locked stack.**
  - **Planned commands**, marked "available after Chunks 1–3".
  - **Architecture principles.**
  - **Coding conventions:**
    - TypeScript strict, no `any`;
    - zod at every boundary;
    - Server Components by default;
    - Server Actions for mutations;
    - Drizzle transactions for multi-row writes;
    - every date goes through the time module;
    - kebab-case file names;
    - no new abstraction until there is a second real use.
  - **Testing rules:** test first; Vitest with a temporary database; fixtures only, never live network; Playwright against a seeded database; show real `typecheck` / `lint` / `test` output before claiming anything is done.
  - **Requirement labels:** never treat an Assumption or a Proposed item as confirmed.
  - **Simplification honesty**, as stated in Global Constraints.
  - **Scheduling proof rule**, as stated in Global Constraints.
  - **Security and data handling.**
  - **"Stop and ask David" list:**
    - changing the stack or adding a notable dependency;
    - anything paid;
    - choosing a provider, or sending content outside the PC;
    - adding or removing sources;
    - changing a product requirement;
    - a destructive migration;
    - registering or changing a scheduled task;
    - changing the Windows timezone;
    - deleting data outside the retention rules;
    - adding a git remote or pushing anywhere;
    - starting a ⛔ chunk;
    - completing a chunk while its decision-before-completion is still pending.
  - **Implementation workflow.**
  - **Documentation rules.**
- [ ] **Step 2: Verify.**
  - Line count is about 120 or fewer.
  - Grep finds `DevPulse-Weekly-News-Collection`, `yarn news:sync`, `Asia/Kuala_Lumpur` and `Scheduling proof`.

### Task 6: Final review and report

- [ ] **Step 1: Check the folder.** Glob `**/*` and `.*` → only the five documents plus this plan. No `package.json`, `node_modules`, `.git` or `src/`.
- [ ] **Step 2: Run the brief's nine-point review, plus three checks from David's r1 review.** Fix any gap in place.
  - The brief's nine points:
    1. every requirement is covered;
    2. dependencies are correct;
    3. chunks are 1–5 tasks;
    4. difficulty rises through the roadmap;
    5. no paid service is assumed;
    6. approval gates are marked;
    7. the design is simple;
    8. the documents agree with each other;
    9. nothing is implemented.
  - The three checks from David's r1 review:
    - every ⛔ is justified by the gate rule;
    - assumptions and proposed items are never written as confirmed;
    - scheduling chunks require real Windows evidence.
- [ ] **Step 3: Report to David.** Cover:
  - what changed;
  - the files created;
  - every tool or command run, with its real output;
  - what passed and what failed;
  - the key decisions;
  - the open decisions;
  - what remains unverified.

  Then stop. Chunk 1 waits for David's approval.

---

## Appendix A — Roadmap chunks (pinned boundaries)

Each chunk reads `N · Title · Difficulty · Depends on`, followed by its gates and short task headlines. The roadmap expands each task into `Test:` and `Acceptance:` lines.

**Phase 1 — Project Foundation**

- **1 · Repository and toolchain initialization · Easy · none.** The roadmap as a whole starts only once David approves the planning documents.
  - 1.1 Local `git init` on `main`, with no remote (AD-20). Add `.gitignore` (node_modules, .next, `data/`, `.env*`, Playwright output), `.gitattributes` (LF line endings) and `.editorconfig`.
  - 1.2 Pin the Node.js LTS version (`.nvmrc`, `engines`) and Yarn 4 with `nodeLinker: node-modules` (`packageManager`), per AD-18. Confirm both in the Chunk 1 spec.
  - 1.3 Scaffold Next.js App Router with TypeScript strict, Tailwind v4 and ESLint, using Yarn, a `src/` directory and the `@/*` alias.
  - 1.4 Confirm `yarn dev` serves the default page and `yarn build` passes.
- **2 · Quality tooling and test runners · Easy · 1**
  - 2.1 Add Prettier, plus `lint`, `format` and `typecheck` (`tsc --noEmit`) scripts.
  - 2.2 Set up Vitest (node environment, path alias) with one sample test.
  - 2.3 Set up Playwright (Chromium) with a home-page smoke test.
  - 2.4 Add `yarn check`, which runs typecheck, then lint, then the tests.
- **3 · Application structure and shared foundations · Easy · 2**
  - 3.1 Add a zod-validated `src/lib/config/env.ts` covering the DB path, the log directory and the provider name.
  - 3.2 Add a stub `scripts/news-sync.ts`, run through `tsx` by `yarn news:sync`. Add an ESLint `no-restricted-imports` rule that stops `scripts/` and `src/lib/` from importing `next/*`.
  - 3.3 Initialize shadcn/ui and render a Button.
  - 3.4 Update the folder layout in ARCHITECTURE to match.

**Phase 2 — Database Foundation**

- **4 · SQLite and Drizzle setup · Easy · 3**
  - 4.1 Add `better-sqlite3` (AD-02, Proposed; confirmed in the Chunk 4 spec, with alternatives recorded), `drizzle-orm` and `drizzle-kit`. Confirm the native module loads on Windows.
  - 4.2 Write `src/lib/db/client.ts`: WAL, `foreign_keys=ON`, `busy_timeout`, and create `data/` if missing.
  - 4.3 Add `drizzle.config.ts`, the `db:generate` and `db:migrate` scripts, and commit the migrations.
  - 4.4 Write a test helper that creates a temporary database with migrations applied.
- **5 · Core schema and migrations · Intermediate · 4**
  - 5.1 `articles` table, with unique `canonical_url`, unique `(source_key, guid)`, a provider-name column and `week_start`.
  - 5.2 `article_technologies` and `article_roles` tables with cascade deletes. There are no CHECK constraints on role or category values, so the OD-08 lists can change without a migration (AD-22).
  - 5.3 `collection_runs`, `collection_run_sources` and `job_lock` tables.
  - 5.4 Indexes for the dashboard queries, and CHECK constraints on status and difficulty.
  - 5.5 Migration test: constraints and cascades hold, and no column stores raw article content.

**Phase 3 — News Collection Pipeline**

- **6 · News source configuration · Easy · 3**
  - 6.1 A typed source list with a zod schema, in `src/lib/config/sources.ts`.
  - 6.2 Load-time validation: unique keys, http(s) URLs, known categories.
  - 6.3 Decision preparation for OD-03: a candidate list with each source's name, feed URL and terms/permission note, entered with `enabled: false`. David enables the approved sources, and that change is recorded in the decision log. Disabled sources are never fetched.
- **7 · Timezone and week-window utilities · Intermediate · 2**
  - 7.1 `previousWeekWindow(now)`: from Monday 00:00 MYT to the next Monday 00:00 MYT, end exclusive, returned as UTC.
  - 7.2 `weekStartOf()`, `latestScheduledRun()` and `nextScheduledRun()`. The scheduled time is Monday 08:00 MYT.
  - 7.3 MYT display helpers. Tests cover boundary instants and the year boundary, under `TZ=UTC` and `TZ=America/New_York`. These tests prove the date maths only; they do not prove scheduling works.
- **8 · RSS/Atom fetching · Intermediate · 6**
  - 8.1 `fetchFeed()`: timeout, size cap, User-Agent, one retry.
  - 8.2 Parse feeds into `RawFeedItem[]` using the parser chosen under AD-16.
  - 8.3 `collectSource()` returns `{ ok, items | error }` and never throws. Tests use fixtures and a mocked fetch.
  - Manual verification: fetch one candidate feed read-only; nothing is stored.
- **9 · Article extraction and validation · Intermediate · 7, 8**
  - 9.1 Map raw items to `CandidateArticle`. The article content stays in memory only.
  - 9.2 Validate items and keep only those inside the window. A missing, unparseable or future date is rejected with a reason.
  - 9.3 Record per-source counts.
  - 9.4 A test proves the insert type has no content field.
- **10 · Duplicate prevention · Intermediate · 9**
  - 10.1 `canonicalizeUrl()`.
  - 10.2 Remove duplicates within a run, across sources.
  - 10.3 Inserts ignore conflicts, and duplicates are counted. Re-running a week inserts 0 rows. Duplicates are defined per A-02.
- **11 · Article storage, run recording and end-to-end `news:sync` · Intermediate · 5, 10**
  - 11.1 Run record lifecycle.
  - 11.2 Store new articles as `pending`, with one transaction per source.
  - 11.3 Wire `yarn news:sync` end to end, with exit codes.
  - 11.4 Integration test with fixture feeds, one of them failing.
  - Manual verification: run against the approved sources if OD-03 is recorded. Otherwise, run against a local fixture feed server and carry the real-source run to 36.2 with a note.
- **12 · Permitted public API connector (conditional) · Intermediate · 11** ⛔ OD-03
  - 12.1 A connector for the approved API source.
  - 12.2 Tests with recorded fixtures.
  - Skipped if David approves no API source.

**Phase 4 — Simplification Framework**

- **13 · Simplification provider interface and output schema · Intermediate · 3.** Decision before completion: OD-08.
  - 13.1 Types `SimplificationInput` and `SimplifiedArticle`, and the interface `SimplificationProvider { name; simplify(input) }`.
  - 13.2 `simplifiedArticleSchema`: 2–4 sentences, 3–5 takeaways, a difficulty enum, technologies, and roles and category validated against `src/lib/simplifier/taxonomy.ts`. That module holds the Proposed lists until OD-08 is decided.
  - 13.3 A default `none` provider and a deterministic `fake` provider, selected by `SIMPLIFIER_PROVIDER`. `fake` output is labelled as test data.
- **14 · Simplification step and validated storage · Intermediate · 11, 13**
  - 14.1 Provider → validate → normalize → save in one transaction.
  - 14.2 Errors set `failed`, and the run continues.
  - 14.3 Fake-provider tests for valid output, invalid output, a throw and a timeout. The run ends `partial` and the metadata stays intact.
- **15 · Failed processing and retry · Intermediate · 14**
  - 15.1 Retry selection, with a limit of 3 attempts (AD-19, Proposed; revisited with OD-01, because retries to a paid provider cost money).
  - 15.2 Re-fetch the article content from its source. If it is gone, record `content_unavailable`.
  - 15.3 At the attempt limit the article becomes permanently failed and is shown as such.
  - 15.4 Every sync retries the eligible articles.
- **16 · AI provider selection · Easy · 13.** Decision preparation; no application code, and no article content is sent anywhere.
  - 16.1 A comparison spec covering cost, rate limits, data retention and training use, terms for third-party content, structured output, and quality. Candidates include paid APIs, free tiers and running a model locally.
  - 16.2 A usage estimate, based on A-06, giving a monthly cost range.
  - 16.3 David records OD-01 and OD-02: approve, defer or decline.
  - The chunk is complete when David's decision is logged. It is never counted as Blocked. Its outcome unblocks Chunks 31 and 32.

**Phase 5 — Dashboard Core**

- **17 · Dashboard layout and navigation · Easy · 3**
  - 17.1 App shell and navigation.
  - 17.2 Loading, error, not-found and empty states.
  - 17.3 Bind to 127.0.0.1 and use the Node runtime (AD-08).
  - 17.4 Playwright test of the navigation.
- **18 · Latest articles · Intermediate · 14, 17.** Decision before completion: OD-06.
  - 18.1 Paginated query of the latest articles.
  - 18.2 Article card. Whether pending articles are shown comes down to one query clause and one card variant, decided by OD-06. Articles from the `fake` provider show a "Test data" badge.
  - 18.3 `yarn db:seed`, filling the database from the `fake` provider.
- **19 · Article details · Intermediate · 18**
  - 19.1 Show all eight fields, or a 404.
  - 19.2 A safe original link, with text rendered as plain text.
  - 19.3 An "AI-simplified" label, plus pending and failed views.

**Phase 6 — Dashboard Features**

- **20 · Search and difficulty filtering · Intermediate · 18**
  - 20.1 Parameterized `LIKE` search.
  - 20.2 Difficulty and source filters, kept in URL parameters.
  - 20.3 Tests.
- **21 · Categories and technologies · Intermediate · 18.** Decision before completion: OD-08.
  - 21.1 Browse and filter by category.
  - 21.2 Technologies index with counts.
  - 21.3 Tests.
- **22 · Bookmarks and read/unread · Intermediate · 19**
  - 22.1 Server actions for bookmark and read. Opening the details page marks the article read (Proposed; confirmed in the chunk spec).
  - 22.2 Bookmarks page and an unread filter.
  - 22.3 Tests, including an E2E check that state survives a reload.
- **23 · Weekly archive · Intermediate · 7, 18**
  - 23.1 Index of the MYT weeks present in the database, with counts. It does not depend on OD-04.
  - 23.2 A page for each week.
  - 23.3 Boundary tests.

**Phase 7 — Collection Operations and Retention**

- **24 · Run lock and overlap prevention · Intermediate · 11**
  - 24.1 Acquire the lock atomically. A second run exits with "already running".
  - 24.2 Heartbeat while running. A stale lock is taken over, and the interrupted run is marked as failed.
  - 24.3 Release the lock on success, on failure and on a signal.
  - 24.4 Tests using two processes, plus a stale-lock test.
- **25 · Manual collection commands · Intermediate · 15, 24**
  - 25.1 Flags: `--week`, `--source`, `--retry-only`, `--dry-run`, `--scheduled`. The trigger (manual or scheduled) is recorded.
  - 25.2 A console summary of the run.
  - 25.3 Tests. `--dry-run` writes nothing.
- **26 · Collection status and logs · Intermediate · 17, 25**
  - 26.1 Last run, next scheduled run in MYT, and an overdue warning.
  - 26.2 The run records present, with per-source errors.
  - 26.3 List of failed articles.
  - 26.4 One log file per run, in `data/logs/`.
- **27 · Two-month retention and cleanup · Intermediate · 22, 24** ⛔ OD-04, OD-05 (irreversible deletion)
  - 27.1 `cleanupExpired(now)`: a single transaction that cascades, applying the OD-05 bookmark rule.
  - 27.2 Prune old run records and log files.
  - 27.3 Run it at the end of every sync, and as `yarn news:cleanup`.
  - 27.4 Tests: boundaries, cascade, bookmark rule, idempotency and rollback.
- **28 · Dashboard-triggered collection (optional) · Advanced · 24, 26** ⛔ OD-07 (product approval, and the dashboard would start processes)
  - 28.1 A server action that starts a detached `news:sync` and refuses while the lock is held.
  - 28.2 Show the running state.
  - 28.3 Tests.
  - Skipped if David declines OD-07.

**Phase 8 — Background Automation** (real Windows verification required; see the scheduling proof rule)

- **29 · Windows Task Scheduler registration · Advanced · 25.** Decision before completion: OD-10, which is needed before 29.3.
  - 29.1 Wrapper `scripts/windows/run-news-sync.ps1`: sets the working directory, resolves node and yarn, runs `yarn news:sync --scheduled`, writes a log and passes the exit code through.
    - Real check: run it from a fresh PowerShell outside the project folder. Expect a run record with trigger `scheduled`, a log file, and the correct exit code.
  - 29.2 `yarn task:register`, `task:unregister` and `task:status`. Settings:
    - weekly on Monday at `08:00:00+08:00`, synchronized across time zones;
    - IgnoreNew for overlapping instances;
    - StartWhenAvailable;
    - RestartOnFailure;
    - an execution time limit;
    - the run mode chosen in OD-10.

    A Vitest test checks the generated definition. It is labelled "not proof of scheduling".
  - 29.3 Go-ahead at execution time. Register the task on David's PC, then:
    - `schtasks /Query /TN "DevPulse-Weekly-News-Collection" /XML` shows the `+08:00` boundary, the Monday trigger, IgnoreNew and StartWhenAvailable;
    - `/V /FO LIST` shows a Next Run Time equal to the next Monday 08:00 MYT.
  - 29.4 Go-ahead at execution time. Switch the Windows timezone temporarily, for example to UTC. Next Run Time must then show Monday 00:00 UTC (08:00 MYT). Restore the timezone, and record both outputs.
  - 29.5 Go-ahead at execution time. Use the same script to register a temporary `DevPulse-Schedule-Test` task with a one-time `+08:00` trigger about 3 minutes ahead. Confirm it fires without anyone touching it, creating a run record and a log.
    - Overlap check: run `schtasks /Run` while a manual run holds the lock. The second run must be refused, and the refusal recorded.
    - Delete the test task afterwards.
  - Manual verification also covers the real Monday 08:00 MYT run: record it if it happens during the chunk. Otherwise 36.3 confirms it.
- **30 · Missed-run recovery · Advanced · 29.** Decision before completion: OD-09, the optional logon trigger.
  - 30.1 Due-week logic. Process every week without a successful run, up to the catch-up cap of 4 weeks (AD-21, Proposed), oldest first, and skip completed weeks unless `--force` is given. Unit tests cover the date maths only.
  - 30.2 When offline, fail fast with a reason and a non-zero exit code, so that RestartOnFailure retries.
  - 30.3 Go-ahead at execution time. Using the test task:
    - put the PC to sleep across the trigger, wake it, and confirm StartWhenAvailable runs the task and the due week is collected;
    - shut down across the trigger, boot, and confirm the same.
  - 30.4 Go-ahead at execution time. Disconnect the network across the trigger. Expect a failure recorded with a reason; after reconnecting, the RestartOnFailure retry succeeds.
  - 30.5 Only if OD-09 approves it: add the logon trigger and verify it by logging off and on.
  - Record each real check with its date, the `schtasks` or Task Scheduler History output, and the run records. History may first need "Enable All Tasks History". Any scenario that does not recover is recorded as a known limitation and reported to David, not hidden.

**Phase 9 — AI Provider Integration**

This whole phase is ⛔ until Chunk 16 has a recorded approval. It may then move earlier, since its code depends only on Chunks 13–16.

- **31 · Approved provider adapter · Advanced · 15, 16** ⛔ OD-01, OD-02 (cost and privacy)
  - 31.1 Adapter. The API key comes from `.env.local`, is validated with zod, and is never logged.
  - 31.2 Prompt for simple English at a junior-developer level, with structured JSON output and the article content marked as untrusted.
  - 31.3 Contract tests against recorded responses: valid output, malformed output, a refusal, HTTP 429, a timeout, and an injected instruction.
- **32 · Usage limits and quality verification · Advanced · 31** ⛔ OD-01 (cost)
  - 32.1 Caps, timeout, low concurrency and backoff. When the budget cap is reached, simplification stops and articles stay pending.
  - 32.2 Record usage per run.
  - 32.3 Go-ahead at execution time. A live run on at most 10 articles. David reviews readability and accuracy, and the prompt is tuned.
  - This is the chunk that completes FR-SIM-01…08.

**Phase 10 — Reliability, Testing and Release Readiness**

- **33 · Error handling and reliability hardening · Advanced · 26, 30**
  - 33.1 Failure-mode review: DB busy or locked, `data/` not writable, bad config, a crash mid-run, an unhandled rejection. In each case the run is marked failed and the failure is logged.
  - 33.2 A fault-injection test for each mode.
  - 33.3 When the DB is missing, or migrations are pending, the dashboard shows a clear message.
- **34 · Test suite completion and E2E · Advanced · 20, 21, 22, 23, 26, 33**
  - 34.1 Fill coverage gaps against the traceability table. Measure P-01 with 5,000 seeded articles.
  - 34.2 Playwright flows over the seeded database.
  - 34.3 Collector E2E: fixture feed server → fake provider → dashboard. A second run adds 0 rows.
  - 34.4 `yarn verify`.
- **35 · Documentation completion · Intermediate · 34**
  - 35.1 README covering setup and usage.
  - 35.2 `docs/OPERATIONS.md`: the scheduled task, manual runs, logs, backup, troubleshooting, sources and provider.
  - 35.3 Reconcile REQUIREMENTS and ARCHITECTURE with what was built, and complete the decision log.
- **36 · Final integration and verification · Advanced · 27, 30, 32, 35**
  - 36.1 Set up from a fresh clone, using only the README.
  - 36.2 A real collection run against the approved sources, reviewed in the dashboard. This needs OD-03.
  - 36.3 Real Windows checks with the final build: at least one real Monday 08:00 MYT run observed, and the sleep-across-trigger scenario repeated.
  - 36.4 Run retention against seeded old data. Confirm real simplification with the approved provider. Run `yarn verify` and check it passes, and finalize the roadmap.
  - If David declines a provider, 36 runs with `none` and records FR-SIM-01…08 as unmet by decision. DevPulse is not feature-complete in that case.

## Appendix B — Gates and open decisions

**Part 1 — Gates**

| Gate type | Chunks | Why |
|---|---|---|
| ⛔ Blocked until decided | 12 (OD-03), 27 (OD-04, OD-05), 28 (OD-07), 31 (OD-01, OD-02), 32 (OD-01) | Chunk 12: the approved API defines the whole chunk, and its terms apply. Chunk 27: deletion cannot be undone. Chunk 28: an optional product feature, and it would let the dashboard start processes. Chunks 31 and 32: cost, and article content leaving the PC. |
| Decision before completion | 13, 21 (OD-08) · 18 (OD-06) · 29 (OD-10, needed before 29.3) · 30 (OD-09) | Each decision changes only a value or a single switch, and the default lives in one place |
| Decision preparation | 16 (OD-01, OD-02) · task 6.3 (OD-03 candidates) | Prepares the decision, writes no application code, and is never Blocked |
| Go-ahead at execution time | 29.3–29.5, 30.3–30.5, 32.3, 36.2–36.3 | These are actions on David's PC or calls to a paid service |
| Optional / conditional | 28 (optional), 12 (only if an API source is approved) | Skipped by decision; not counted in Remaining |
| Chain to the final chunk | 36 depends on 27 and 32 | Final integration needs every confirmed requirement. This is the only unblocked chunk that waits on ⛔ chunks. |

Chunks unblocked in r2, with the reason for each:

| Chunk | Was blocked on | Why it no longer is |
|---|---|---|
| 1 | Old OD-11, OD-12 | Node/Yarn choice became AD-18 (technical); the git remote became AD-20 plus a CLAUDE.md rule |
| 6 | OD-03 | The candidate list is disabled until David approves it |
| 13, 21 | OD-08 | Values live in one module, with no DB constraint |
| 18 | OD-06 | One clause and one card variant |
| 29 | OD-10 | The scripts don't depend on it; only registration does |
| 30 | OD-09 | The logon trigger is an optional add-on, and the catch-up cap is technical (AD-21) |

The dependency on Chunk 27 was removed from Chunks 29 and 33, which do not need retention. Chunks 23, 26 and 30 no longer read the retention period.

**Part 2 — Open decisions** (OD-01…OD-10)

| ID | Decision | Recommendation | Gate |
|---|---|---|---|
| OD-01 | AI provider, model, monthly budget cap, and permission to send article content | Decide in Chunk 16. No provider is assumed free. | ⛔ 31, 32 |
| OD-02 | What content is used: (a) feed content, held in memory and re-fetched on retry; (b) also fetch the original page transiently; (c) store an excerpt temporarily until simplified | (a). Choosing (b) or (c) adds tasks to Chunks 15 and 31. | ⛔ 31 |
| OD-03 | RSS/Atom sources and any public APIs, after checking their terms | The candidate list from 6.3 | ⛔ 12. Also needed before the first real-source run (11 or 36.2). |
| OD-04 | Whether "two months" means 2 calendar months or 60 days, and whether it is measured from the published date or the collected date | 2 calendar months from the published date, in MYT | ⛔ 27 |
| OD-05 | Bookmarked articles at expiry: delete or keep | Delete (strict), with an "expires soon" hint | ⛔ 27 |
| OD-06 | Show articles that are not yet simplified? | Yes, with an "Awaiting simplification" badge | Before completing 18 |
| OD-07 | Dashboard "Run collection now" button (optional) | The CLI is required; the button is optional | ⛔ 28 |
| OD-08 | Category list, role list, and who assigns the category | Fixed lists. The AI picks from the list, falling back to the source default. | Before completing 13 and 21 |
| OD-09 | Add a logon trigger for catch-up? | Optional. StartWhenAvailable is the baseline. | Before completing 30 |
| OD-10 | Task run mode (logged on only, or whether logged on or not), password storage, wake-to-run | Avoid storing a password. Decide once the options are shown in Chunk 29. | Before 29.3 |

## Appendix C — Requirement classification

**Assumptions** (not in the brief; David confirms them by approving the docs or in the decision log)

| ID | Assumption | Basis | Affects |
|---|---|---|---|
| A-01 | "Previous calendar week" means Monday 00:00 to Sunday 23:59:59 MYT | The brief's "previous calendar week" and its MYT schedule | 7, 9, 23, 30 |
| A-02 | A duplicate is the same canonical URL or the same source item. The same story from different outlets is kept as separate articles; stories are not grouped. | The brief's "prevent duplicate articles" | 10 |
| A-03 | Single user, no login. Bookmarks and read state belong to that one user. | The brief's "personal Windows application" | 5, 22 |
| A-04 | The dashboard is started on demand, on localhost only | Local-first; collection runs independently of the website | 17 |
| A-05 | Sources are in English. Nothing filters by language; the approved source list settles it. | Not in the brief; inferred from the "simple English" output | 6 (via OD-03) |
| A-06 | Volume is tens to low hundreds of articles a week | A curated source list | 16 (cost), P-01 |

**Proposed — not requirements**
- P-01, a performance target: dashboard pages respond in under 1 s locally with ≤ 5,000 articles. Measured in 34.1.
- Database driver: AD-02.
- Retry limit: AD-19.
- Catch-up cap: AD-21.
- Node and Yarn versions: AD-18.
- Localhost binding: AD-08.
- No live network in tests: AD-13.

## Appendix D — Proposed technical decisions (AD-01…AD-22)

All of these are **Proposed**.

**Structure and data**
- **AD-01** One repository with two entry points, both sharing `src/lib`.
- **AD-02** `better-sqlite3` as the SQLite driver.
  - Why: mature; synchronous transactions; Drizzle support.
  - Alternatives: `@libsql/client` and Node's built-in `node:sqlite`.
  - The Chunk 4 spec confirms it and checks for Windows prebuilt binaries.
- **AD-03** Timestamps stored in UTC, with one MYT time module.
- **AD-04** Sources live in a typed config file.
- **AD-05** Article lifecycle states.
  - `none` is the default provider.
  - `fake` produces labelled test data and is never counted as real simplification.
  - Each article records which provider processed it.
- **AD-06** Original text is kept in memory only, and retries re-fetch it. Subject to OD-02.
- **AD-07** Duplicate-detection keys: canonical URL and source item.

**Dashboard and scheduling**
- **AD-08** The dashboard uses Server Components and Server Actions, with no REST layer, the Node runtime, and a bind to 127.0.0.1.
- **AD-09** Overlap is prevented by a database lock plus Task Scheduler's IgnoreNew.
- **AD-10** The next scheduled run is computed from the schedule, and an overdue warning is shown when it is missed.
- **AD-11** Task Scheduler settings, as listed in task 29.2.

**Tooling and project conventions**
- **AD-12** Search uses `LIKE`.
- **AD-13** Tests make no live network calls.
- **AD-14** Logs are kept in the database and in per-run files.
- **AD-15** Specs and plans live under `docs/superpowers/`.
- **AD-16** The feed parser is chosen in the Chunk 8 spec.
- **AD-17** Supporting libraries: `zod`, `tsx`, a feed parser and a timezone helper. Each is confirmed in its chunk spec.
- **AD-18** Current Node.js LTS, with Yarn 4 using `nodeLinker: node-modules`. This was OD-11. It carries a risk that Corepack bundling has changed (R-07).
- **AD-19** Retry limit of 3 attempts. Revisit together with OD-01.
- **AD-20** Local git only. Adding a remote or pushing anywhere needs David. This was OD-12.
- **AD-21** Catch-up cap of 4 weeks.
- **AD-22** Roles and categories are validated in the application (zod), not by database CHECK constraints.

## Appendix E — Key risks (R-01…R-16)

| ID | Risk | Chunk(s) |
|---|---|---|
| R-01 | Feeds keep a limited history, so a long-missed week may be unrecoverable | 30 |
| R-02 | Feed dates are missing or wrong | 9 |
| R-03 | Copyright and terms for sources and the provider | 6, 16 |
| R-04 | AI cost and rate limits | 32 |
| R-05 | AI output that is inaccurate or invented | 19, 32 |
| R-06 | Prompt injection through article content | 31 |
| R-07 | Toolchain on Windows: the native `better-sqlite3` module, and Yarn/Corepack setup | 1, 4 |
| R-08 | SQLite contention between dashboard and collector | 4, 24 |
| R-09 | Task Scheduler environment: PATH, yarn and the working directory | 29 |
| R-10 | The PC is off, asleep or offline at the trigger time | 29, 30 |
| R-11 | The PC's timezone is not MYT, or changes | 7, 29.4 |
| R-12 | A stale lock or an interrupted run | 24 |
| R-13 | Retention deletes bookmarks | 27 |
| R-14 | Feed format variance | 8 |
| R-15 | Scope creep | all |
| R-16 | Task Scheduler behaves differently than documented, for example after sleep or when logged off | Mitigated by real Windows verification in 29, 30 and 36, with limitations reported honestly |

## Revision log

- **r1 (2026-11-03):** plan created. 36 chunks, 12 ⛔ chunks, OD-01…OD-12.
- **r2 (2026-11-03):** David's review.
  1. ⛔ reduced to 5 genuine gates (12, 27, 28, 31, 32). Added the "decision before completion" gate type (13, 18, 21, 29, 30).
  2. Added requirement labels and Appendix C. Single-user scope, no story grouping and English-only sources are now assumptions A-02, A-03 and A-05. The performance target is P-01. The DB driver (AD-02, with alternatives), retry limit (AD-19) and catch-up cap (AD-21) are Proposed.
  3. Added the simplification honesty rule to the README, progress summary, FR-SIM note and Chunks 32 and 36.
  4. Added the scheduling proof rule. Chunks 29, 30 and 36 now require real Windows checks: XML and next-run inspection, a timezone switch, a test task that fires by itself, overlap, sleep, shutdown, network loss, and a real Monday run.
  5. Chunk 28 is marked optional and stays ⛔ on OD-07.
  6. Dependency review:
     - 7 → 2, 13 → 3 and 17 → 3 (each was 3 or 5);
     - 29 no longer depends on 27;
     - 33 → 26 and 30 (was 27 and 30);
     - 34 gains 20, 21 and 22;
     - 36 → 27, 30, 32 and 35;
     - Chunks 23, 26 and 30 no longer depend on retention.
  7. Chunk 16 is labelled decision preparation and is never counted as Blocked. Task 6.3 is labelled the same way.

  Also: OD-11 became AD-18 and OD-12 became AD-20, so the open decisions are now OD-01…OD-10.
