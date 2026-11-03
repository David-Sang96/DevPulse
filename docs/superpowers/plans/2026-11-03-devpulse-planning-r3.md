# Plan — Planning revision r3 (apply the accepted review)

**Historical record, not normative. ARCHITECTURE governs.** The deployment details below were moved into `docs/ARCHITECTURE.md` in r4; where this record and the six baseline files differ, the baseline files apply. Superseded by r4 (`docs/superpowers/plans/2026-11-03-devpulse-planning-r4.md`).

> Record of the r3 plan as approved by David on 2026-11-03, kept for traceability. It was applied to the six planning files on 2026-11-03. It records engineering corrections and Pending decisions only; nothing in it is a resolved product decision. The ADs it names were numbered AD-23…AD-31 when applied (see ARCHITECTURE).

## Context

David accepted the independent review (H1–H7, M1–M15, L1–L15) as the basis for r3. He approved correcting the engineering and documentation problems, but no new product decisions or scope changes.

r3 edits the six planning files and adds one plan record. It does not:

- initialize git;
- install, scaffold or write application code;
- change the weekly schedule, the two-month retention period or the product scope;
- add a paid service, an external AI provider, a new scheduled trigger or a new feature.

New product questions become Pending open decisions (ODs). No recommendation is recorded as a decision.

Files:

- `CLAUDE.md`
- `README.md`
- `docs/REQUIREMENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/IMPLEMENTATION_ROADMAP.md`
- `.claude/skills/chunk-workflow/SKILL.md`
- new: `docs/superpowers/plans/2026-11-03-devpulse-planning-r3.md` (this classification and decision list, kept as a record)

## Phase 1 — Classification

| Code | Meaning |
| --- | --- |
| E | Engineering correction (applied) |
| D | Documentation correction (applied) |
| U | Technical uncertainty (a verification step is added to the owning chunk) |
| P | Product decision (left Pending for David) |

| ID | Type | Files / chunks | Correction | David? |
| --- | --- | --- | --- | --- |
| H1 | E+D | REQUIREMENTS decision log, SKILL gate, roadmap summary | Baseline record `BL-01` plus a Type column in the decision log (see Phase 4) | Approve BL-01 later |
| H2 | E | Roadmap Chunk 1, SKILL Step 5 | Rewrite Chunk 1 (details below) | No |
| H3 | E + P | 6.3, 9.3, 11.1, 26, 30.1, AD-27 / OD-11, OD-12 | **Engineering:** source coverage is represented explicitly (see "H3 coverage design"). A warning alone never lets a source or week count as complete, and incomplete weeks stay due for recovery. **Product:** late items (OD-11) and fetch frequency (OD-12) are separate Pending ODs. The weekly schedule is unchanged | OD-11, OD-12 |
| H4 | E+D | 14.2, 15, OD-01/02 text | In-run retries with backoff while content is still in memory; `content_unavailable` counts as an attempt; OD-01/02 text states the backlog and thin-excerpt consequences; Chunk 16 depends on 6 (can be done early, numbering unchanged) | No |
| H5 | E+U | 11.3, 30.2, AD-11, ARCHITECTURE | Collector waits for connectivity with bounded backoff (Proposed: up to 2 h); partial and no-source runs exit 0; RestartOnFailure is best-effort only and still checked in 30.4 | No (daily trigger goes to OD-09) |
| H6 | E | 4.2, 29.1–29.2, new AD-23, CLAUDE, SKILL Step 7 | A separate live checkout runs only an approved commit of `main`, updated by a documented, approval-gated procedure, with its own database (see "H6 live checkout lifecycle") | Each merge into `main` and each live update need explicit approval at execution time |
| H7 | E | SKILL, roadmap legend, Chunk 36 | A dependency is satisfied by `[x]` or `Skipped (OD-NN)` where the OD is resolved as declined; 36.2 and 36.4 conditional; OD-01 deferred means 36 cannot complete | No |
| M1 | E | Chunks 6, 8, 9, 10, 13, 16, 17, 27, 32, 36, Phase 9 note | Dependencies corrected (list below); 6.3's connector test moves to 8.3; new 8.4 fixture feed server, reused by 11, 14, 34; 36.2 gets an OD-03 gate | No |
| M2 | E | 29, OD-10 | Restructure 29: modes as a parameter (29.2) → go-ahead test of each mode with the test task (29.3, informs OD-10) → real registration after OD-10 (29.4) | OD-10 (existing) |
| M3 | E+U | 29.1/29.2, AD-11 | Action `powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File <abs>`, `exit $LASTEXITCODE`; process-scoped only, no Windows setting changed; tests run as the task's account | No |
| M4 | E | 1.2, 4.1, 29.1, AD-18 | Exact Node version pinned (installed: 24.13.0); Yarn release committed via `yarnPath` (no Corepack); wrapper uses absolute node path and checks the version; 4.1 confirms a better-sqlite3 prebuild for that exact version | No |
| M5 | E+D | 1.4, 17.3, 34, P-02, AD-28 | Telemetry off (Yarn, Next.js); local or system fonts; dev and start servers on 127.0.0.1; P-02 privacy target (Proposed, derived from NFR-01) | No |
| M6 | E + P | CLAUDE, AD-29, 14, 34, SKILL Step 6 / OD-15 | **Engineering:** fixtures are synthetic only; logs and `last_error` store error codes and safe messages, never content or raw provider output; sentinel-string test. **Product:** whether any external AI review may run, and on what, is OD-15, left Pending. Until it is resolved the skill runs no separate AI review command or agent (see "OD-15 privacy details") | OD-15 |
| M7 | E | 4.2, 17.3 | DB client singleton; DB pages dynamic (ƒ in build output); production start `next start -H 127.0.0.1` | No |
| M8 | E | 4.4, 24.3, 26.1, 33 | Lock released on graceful exits, SIGINT and SIGBREAK; hard kills handled by stale takeover; status shows stale heartbeat as "interrupted"; close handles before deleting files, with retry; stop the dashboard before the Chunk 33 rename | No |
| M9 | E + P | ARCHITECTURE retention, Chunk 27 | Rows deleted in one transaction, files deleted after commit, orphan sweep; dashboard hides rows past the cutoff even if cleanup didn't run; "expires soon" hint is a conditional task (only if OD-05 includes it) | OD-05 (existing) |
| M10 | E | Roadmap Dependencies lines, SKILL | New marker `Confirm before completion: A-NN` on 5, 6, 7, 9, 10, 16, 17, 22, 23, 30, 34 | Confirm A-01…06 |
| M11 | E | 26.1, 29.2 | `task:status` records task existence and NextRunTime; dashboard shows "schedule not set up / not verified" when unknown or no scheduled run in 8 days | No |
| M12 | D | Roadmap rules, SKILL, Chunk 31 | Completed chunks are never silently reopened; a later decision adds a follow-up task to the gated chunk (31 gets a conditional OD-02 (b)/(c) task) | No |
| M13 | E | 11.1, 30.1, AD-27 | Run status `no_sources` (exit 0) that never completes a week; it fits the H3 coverage design | No |
| M14 | E | 13.2 | Summary returned as an array of 2–4 sentences | No |
| M15 | E | 11.2, 14.1 | Store the source's default category at insert; the provider may replace it only as OD-08 decides | No |
| L1 | D | SKILL | Read gate ODs from the Dependencies line | No |
| L2 | D | Legend, SKILL | Exact Status values: `Not started.` `In progress.` `Blocked — awaiting …` `Complete.` `Skipped (OD-NN).` | No |
| L3 | D | REQUIREMENTS | Status columns marked "not authoritative; see the decision log" | No |
| L4 | D | REQUIREMENTS | Decision log gains Type and Source columns | No |
| L5 | E+D | CLAUDE, Chunk 2 | `db:migrate` is Chunk 4; Chunk 2 adds `yarn lint:md` (markdownlint-cli2, Proposed under AD-17) | No |
| L6 | D | 8, 9, 11, 12 | Real-network manual checks marked Go-ahead | No |
| L7 | P | 22.1 / OD-14 | Auto-mark-as-read removed from the baseline; manual toggle only; new OD | OD-14 |
| L8 | E | 17.3 | Host/Origin allowlist for Server Actions | No |
| L9 | P | AD-11, FR-AUTO-04 / OD-13 | Wrapper becomes Needs David | OD-13 |
| L10 | D | CLAUDE, SKILL | Commit rule: local only, on the chunk branch, after verification, part of the approved plan; never push | No |
| L11 | D | REQUIREMENTS | Decision log intro corrected | No |
| L12 | E | 29.5 | IgnoreNew tested by `schtasks /Run` twice while an instance is running | No |
| L13 | E | 3.1, 7.3, 23.3, 1.1 | TZ set inside the Vitest config/projects, not the shell; env loader reads `.env.local` for the CLI; `.gitignore` allows `.env.example` | No |
| L14 | E | 10.1, 31.2 | Verifiable criteria (documented parameter list; injected content is delimited and schema-gated) | No |
| L15 | E+U | AD-11, 30.3 | Execution time limit Proposed 2 h; sleep-during-run case added to 30.3 (go-ahead) | No |

### Chunk 1 rewrite (H2), 5 tasks

1. Pre-flight: BL-01 resolved and file hashes match. Then `git init -b main` and add `.gitignore` (with `!.env.example`), `.gitattributes` and `.editorconfig`. The first commit contains the approved baseline docs, `.claude/skills/` and these files. Record the commit hash in the baseline record. Further work goes on branch `chunk-01-toolchain`.
2. Exact Node pin and committed Yarn release; `.yarnrc.yml` with `nodeLinker: node-modules` and `enableTelemetry: false`.
3. Scaffold non-interactively in a temporary folder named `devpulse`, then merge, never overwriting README.md, CLAUDE.md, `docs/` or `.claude/`. Package name `devpulse`. Baseline hashes are unchanged afterwards.
4. Privacy defaults: telemetry off, no Google font fetch, dev on 127.0.0.1.
5. `yarn build` and `yarn dev` work.

### H3 coverage design (engineering only; no schedule or product change)

#### Per-source coverage

Each run records the following for each source and target week, in `collection_run_sources`:

- `coverage`: `complete`, `possibly_incomplete`, `failed` or `not_attempted` (disabled sources are not counted);
- `coverage_reason`: for example `oldest_item_after_window_start`, `feed_at_item_limit`, `fetch_error`, `parse_error`.

**When a source counts as complete for a target week.** Coverage is judged from **all** items the feed returned, not only the in-week items. Let `oldest_fetched_at` be the earliest valid published date among all fetched items. A source is `complete` only when all of these hold:

- the fetch and parse succeeded;
- at least one item has a valid date;
- `oldest_fetched_at` is at or before the target week's start.

In that case the feed reaches back past the week, so nothing from the week can have been dropped.

Otherwise the source is `possibly_incomplete` (or `failed` for fetch and parse errors). The cases below are spelled out because they would otherwise slip through:

| Case | Coverage | Reason |
| --- | --- | --- |
| Full item count, **no** in-week items, `oldest_fetched_at` newer than the week start | `possibly_incomplete` | `oldest_item_after_window_start` (never complete just because there is no oldest in-week item) |
| Some in-week items, `oldest_fetched_at` newer than the week start | `possibly_incomplete` | `oldest_item_after_window_start` |
| Empty feed (0 items) | `possibly_incomplete` | `empty_feed` (coverage can't be shown) |
| Items exist but none has a valid date | `possibly_incomplete` | `no_dated_items` |
| `oldest_fetched_at` at or before the week start, zero in-week items | `complete` | A quiet week |

Whether the feed returned its maximum item count is recorded as `at_item_limit`, for the 6.3 feed-depth data. It is only extra evidence, though: neither a full nor a short feed can turn a source `complete` without the reach-back test.

API sources (Chunk 12) follow the same test. Pagination must reach an item at or before the week start, or the source is `possibly_incomplete`.

#### Week completeness

A week is **complete** only when every enabled source is `complete` for it. Any other state makes the week **incomplete**. A warning on its own never upgrades a week to complete.

#### Run status

- `succeeded`: only when every target week is complete.
- `partial`: any week is incomplete.
- `failed`: the run could not proceed.
- `no_sources`: nothing is enabled.

The exit codes from AD-27 are unchanged.

#### Recovery

- **Catch-up limit.** The 4-week automatic catch-up limit is AD-21: a **Proposed technical policy**, not an approved product decision. It is labelled Proposed in ARCHITECTURE and REQUIREMENTS, and it may only change through a chunk spec or a decision-log row (Type `Technical`).
- **Automatic recovery.** An incomplete week stays **due**. Later *weekly* runs within the catch-up limit re-collect it automatically. There is no new trigger, and the schedule is unchanged. De-duplication makes this safe, and items still in the feed are recovered.
- **`incomplete (final)`.** Once a week is past the limit, it is marked `incomplete (final)` with its reasons. This means only that **automatic** recovery has stopped. The week is never shown as complete.
- **Manual retry stays possible.** `yarn news:sync --week <monday>` can re-collect any week, including one marked `incomplete (final)`. FR-COL-04 (manual collection) supports this, and no existing requirement prevents it.
  - If every enabled source is then `complete`, the week becomes complete. Otherwise it stays `incomplete (final)`, with the new reasons recorded.
  - The one limit is retention. Once OD-04 is resolved and Chunk 27 exists, `--week` refuses a week entirely older than the retention cutoff, because anything collected for it would be deleted at once (FR-DATA-04).
- Recovery re-collects the *same* target week under the existing window rule. Accepting items into weeks already marked complete stays OD-11. Fetching more often stays OD-12.

#### Display

The status page (26.1/26.2) shows per-source coverage and incomplete weeks with their reasons. Candidate sources (6.3) record feed depth: item count and age of the oldest item.

### H6 live checkout lifecycle

#### Two folders, three kinds of database

- **Development folder** (this one): chunk branches; database `data/devpulse.dev.db`. Tests use temporary databases. Seed and `fake` runs refuse any path that isn't a dev or temporary database.
- **Live checkout:** a separate folder outside the development folder, created by `git worktree add --detach <live-path> <approved-commit>`. It has its own `data/devpulse.db` (the only real database) and its own `.env.local`. It is never used for development, and the `fake` provider is refused there.

#### Merging into `main`

Merging always requires David's explicit approval at execution time, after the chunk is verified. Neither the skill nor any script merges on its own.

#### Updating the live checkout

`yarn live:update <commit>` (Chunk 29.1) refuses unless:

1. David has explicitly approved deploying that commit (go-ahead at execution time);
2. the commit is on `main`;
3. `yarn verify` has passed at that commit;
4. the live tree is clean.

Then it follows these steps, in order:

1. **Stop collection during deployment.** Take the collector's `job_lock` (AD-09) with holder `deployment`.
   - If a run holds the lock, wait up to a bounded time for it to finish, then refuse.
   - While the deployment holds the lock, a scheduled run that starts exits with status `deployment_in_progress` and a non-zero code. It never touches the database.
   - The missed week stays due, and the next weekly run or a manual `--week` recovers it.
   - Task Scheduler is not modified; no task is disabled or re-registered.
2. **Get exclusive use of the live database.** No single check proves exclusivity, so the deployment layers four guards and keeps them all in place until it finishes.
   - **(a) Collector lock.** The deployment holds `job_lock` (step 1). No collection or cleanup run can start.
   - **(b) Maintenance marker.** The deployment creates `data/MAINTENANCE`, which contains the deploy ID, PID and start time. Every DevPulse process checks this file *before* opening the live database, and refuses while it exists: the collector, cleanup, `live:update`, and the dashboard's database client, both at startup and on each new connection. Because it is a plain file, the check works without touching the database.
   - **(c) Dashboard stopped.** The live dashboard must not be running: its port is not listening, and no dashboard process from the live checkout is alive. A dashboard that was already running when the marker was created could still hold an open connection, so the marker alone isn't enough.
   - **(d) SQLite exclusive lock, which is the actual proof.** `live:update` opens **one** connection and sets `PRAGMA locking_mode = EXCLUSIVE`, then starts `BEGIN EXCLUSIVE`.
     - This succeeds only if no other connection holds a lock on the database or its `-shm` file at that moment. Once it succeeds, other connections are blocked (`SQLITE_BUSY`) until this connection is closed.
     - The checkpoint, backup, migration and post-migration checks all run through this single connection, while it holds the lock.
     - If the exclusive lock can't be acquired within a short bounded wait, the deployment refuses and changes nothing. Something unknown, such as a SQLite viewer, is still using the file.
   - **Checkpoint.** `PRAGMA wal_checkpoint(TRUNCATE)` runs **inside** the exclusive connection, purely to fold the WAL into the main file before the backup.
     - Its result `busy = 0` means only that this checkpoint was not blocked at the moment it ran. It does **not** prove there are no other database users, and it is never treated as such. Another process could hold an idle connection, or open one a moment later. Guards (a)–(d) are what provide exclusivity.
     - A non-zero `busy`, or a `-wal` file that is still not empty, also makes the deployment refuse.
   - **Release.** On success or a verified rollback, the deployment releases the guards in reverse order: closes the exclusive connection, removes the marker, then releases `job_lock`. If the rollback fails, it keeps the marker and the lock (step 6.7).
   - **Uncertainty to verify in Chunk 29.** SQLite's EXCLUSIVE locking behaviour with WAL on Windows, and with better-sqlite3, is checked with a real test: a second process must get `SQLITE_BUSY` while the deployment holds the lock.
3. **Apply retention before the backup.** This step does not choose a retention rule. It uses whatever rule OD-04 and OD-05 resolve.
   - **Retention active** (OD-04 and OD-05 resolved, and Chunk 27 deployed):
     1. Run the retention cleanup against the live database, still holding the deployment lock.
     2. Check that nothing expired remains: count expired articles, their related rows and expired run records. The count must be `0`.
     3. If cleanup fails or the count is not `0`, **refuse the deployment**: no backup is made and no code changes. Report it.
   - **Retention not yet active** (OD-04 pending or Chunk 27 not built): no expiry rule exists yet, so nothing can be expired and the live data has no agreed expiry either. The backup manifest records `retention_active: false`. The first cleanup after retention goes live re-checks every such backup (step 7).
3a. **Back up.** Write a single self-contained file to `data/backups/devpulse-<timestamp>-<commit>.db`, using SQLite's online backup API (better-sqlite3 `db.backup()`) or `VACUUM INTO`, never a plain copy of a live file. Then verify the backup:
   - `PRAGMA integrity_check` returns `ok`;
   - the schema version and the row counts of every table match the live database.

   If verification fails, stop before anything changes. Record the previous commit, schema version and row counts for the rollback.

   Next to each backup, write a manifest, `<backup>.json`. It covers **every record type governed by FR-DATA-04**, using a single list of governed tables that the retention module also uses:

   - **Articles:** `oldest_published_at` and `oldest_collected_at`. The manifest does not choose between them; OD-04 stays open.
   - **Article-related rows** (`article_technologies`, `article_roles`): these have no timestamps of their own. They expire with their parent article, so the article values cover them. The manifest records their counts.
   - **Run records** (`collection_runs` and their `collection_run_sources`): `oldest_started_at` and `oldest_finished_at`.
   - **Exempt tables** (no retained content): `job_lock` and the migrations table. Each is listed with the reason it is exempt.
   - Per-table row counts, `retention_active`, the schema version, the commit and `created_at`.

   **Keeping the table list complete.** A schema test (part of 5.5) fails if any table is neither in the governed list nor explicitly exempt. A table added later can therefore never be left out of backup expiry by accident.
4. **Deploy.** Check out the commit (detached), run `yarn install --immutable`, apply migrations to the live database, then run a `--dry-run` smoke check (schema current, config valid, sources load).
5. **On success:**
   - record the deployed commit, date, approval source and backup file in `data/live-deploys.log`;
   - release the lock.
6. **On failure** in step 4, roll back, then verify the rollback:
   1. Close every connection.
   2. Move the failed `devpulse.db`, `devpulse.db-wal` and `devpulse.db-shm` into `data/backups/failed-<timestamp>/`. A stale WAL or SHM file must never sit next to the restored database, where it could be replayed.
   3. Restore the backup to the live path with the backup API or a byte copy of the self-contained backup file. Confirm that no `-wal` or `-shm` file is left over.
   4. Check out the previous commit and run `yarn install --immutable`.
   5. Verify: `PRAGMA integrity_check` is `ok`; the schema version and row counts equal the values recorded in step 3; a `--dry-run` smoke check passes on the previous commit.
   6. Only if every check passes, report **rollback succeeded**, log it and release the lock.
   7. Otherwise, report **rollback failed** with the exact state and the paths of the untouched backup and the failed files. Keep the lock held, so no scheduled run touches a damaged database. Ask David how to proceed.
7. **Backup retention is based on the data inside, not the file's age (FR-DATA-04).** Backups and `failed-<timestamp>/` folders hold article data, so the agreed rule applies to them exactly as it does to the live database.
   - **Expiry of a backup.** A backup expires at the **earliest** expiry of any retained record it contains. That includes articles, their related rows (through their parent article), and run records with their per-source rows.
     - For each governed table, apply the rule resolved in OD-04 and OD-05 to that table's oldest timestamp in the manifest. Run records use the same cutoff as task 27.2.
     - The backup's expiry is the minimum across all tables. Once *any* record inside a backup would have been deleted from the live database, the whole backup is deleted.
     - The calculation never assumes a particular OD-04 date basis. It uses whichever field the resolved rule names.
   - **Read-only fallback.** If a manifest is missing, unreadable, or lacks a governed table (for example, it was written before that table existed), cleanup opens the backup **read-only** (`mode=ro`, no WAL writes) and computes `MIN()` of each timestamp column in the current governed list.
     - A governed table missing from an older backup simply contributes nothing.
     - A table present in the backup but absent from both the governed list and the exempt list makes the backup **unverifiable**. It is never assumed to be within retention.
     - Expired rows are not deleted *inside* backups. Rewriting a backup would break its use for rollback.
     - In practice a backup lives only until its oldest article reaches the cutoff. With weekly collection that is usually a matter of days, so backups are short-term rollback aids, not an archive.
   - **When cleanup runs.** Every retention cleanup (Chunk 27, inside `news:sync` and `yarn news:cleanup`) and every successful deployment (step 5) checks every backup and failed folder.
     - If a manifest is missing or unreadable, cleanup opens the backup **read-only** to compute the same facts.
     - If that fails too, the backup is reported as **unverifiable**. It is never assumed to be within retention.
   - **Backups made before retention existed** (`retention_active: false`) are evaluated by the first cleanup after Chunk 27 goes live, like any other.
   - **Count limit.** At most 5 backups are kept. This is a **Proposed technical value**, not an approved product decision. It is an *additional* limit only and never extends a backup past its data's expiry.
   - **Honest reporting.** Backup cleanup is recorded separately on the run record: `backup_cleanup: ok | failed | unverifiable`, with counts and paths.
     - If any expired backup or failed folder can't be deleted, for example because the file is locked, or any backup is unverifiable, the run's retention result is **failed**. The run is at least `partial`, and the status page shows it.
     - Retention cleanup is never reported as successful while expired data may remain in a backup.
     - A deployment refuses to start while a previous backup-cleanup failure is unresolved.
   - **Failed-deployment files.** Files from a failed deployment that are kept for diagnosis follow the same expiry. If they would expire before David has reviewed them, cleanup deletes them anyway, because the requirement takes precedence, and reports that it did.

#### Wrapper guards (Chunk 29.2)

The scheduled wrapper runs only in the live checkout. It refuses, recording the reason and exiting non-zero, when:

- the tree is dirty;
- HEAD differs from the last commit in the deploy log;
- HEAD is not reachable from `main`;
- the database path is not the live one;
- the schema is not current (AD-24).

A scheduled run can therefore never execute a development branch or an unapproved commit.

#### Chunk 29 reshaped (5 tasks)

| Task | Content | Go-ahead |
| --- | --- | --- |
| 29.1 | Live checkout and `live:update` procedure | Yes |
| 29.2 | Wrapper with guards, task scripts with run mode as a parameter, launch line, `task:status` recording | — |
| 29.3 | Test each run mode with the test task (input for OD-10) | Yes |
| 29.4 | Register the real task, inspect it, check the timezone. Needs OD-10, OD-12 and OD-13 resolved | Yes |
| 29.5 | Test task fires unattended; IgnoreNew via a double `schtasks /Run`; lock overlap | Yes |

### OD-15 privacy details (Pending; nothing assumed safe)

**What would leave the PC** if an AI review command or agent runs (for example `/code-review` or a review subagent):

- the diff;
- the surrounding source files it reads;
- tests and fixtures (synthetic, but they still reveal code and test design);
- configuration files;
- project docs;
- the review instructions.

This goes to the AI provider behind the review tool (Anthropic for `/code-review`). It is subject to that provider's data retention and usage terms.

**Never to be sent:** `.env.local`, databases, `data/` logs and backups, and real article content. These exclusions are enforced by `.gitignore` and the fixture rule, but a reviewer that reads files directly could still open them, so the skill must forbid it explicitly.

**Already happening:** the development assistant itself (this Claude Code session) already sends every file it reads, and its tool output, to the same provider. OD-15 does not change that. David may also want to decide whether that is acceptable.

**Options** (none recorded):

- **(a)** Allow AI review of diffs, code and synthetic fixtures.
- **(b)** Allow code diffs only; exclude fixtures, docs and config.
- **(c)** No separate AI review. Use a structured self-review checklist in the current session, labelled as a self-review, not independent.

**Until OD-15 is resolved:** the skill uses (c) and states that the review was not independent. Fixtures stay synthetic regardless.

### Dependency corrections (M1)

| Chunk | From | To |
| --- | --- | --- |
| 9 | 7, 8 | 5, 7, 8 |
| 10 | 9 | 5, 9 |
| 13 | 3 | 3, 6 |
| 16 | 13 | 6 (decision preparation; recommended early) |
| 17 | 3 | 3, 5 |
| 27 | 22, 24 | 22, 24, 26 |
| 32 | 31 | 26, 31 |

Also: Phase 9 note fixed; Chunk 36 gets `Decision before completion: OD-03 (needed before 36.2)`.

New gates also land on existing chunks:

| Decision | Before completion of | Notes |
| --- | --- | --- |
| OD-11 | 9 and 30 | — |
| OD-12 | 29 | Needed before 29.4 |
| OD-13 | 29 | Needed before 29.4 |
| OD-14 | 22 | — |

The ⛔ set stays 12, 27, 28, 31, 32.

## Phase 3 — Decisions for David (added to REQUIREMENTS as Pending; none recorded as decided)

| ID | Question | Recommendation |
| --- | --- | --- |
| OD-11 | Accept late or back-dated items into weeks already collected and not yet expired? | Accept; de-duplication makes it safe |
| OD-12 | Fetch more often than weekly, but show results weekly? | Decide after measuring feed depth (6.3 data) |
| OD-13 | Run `yarn news:sync` through a PowerShell wrapper? | Yes; the command itself is unchanged |
| OD-14 | Does opening an article mark it read? | Manual toggle only, or mark on an explicit action, not on render |
| OD-15 | May an external AI review receive anything from this project, and if so what? | **No recommendation recorded as decided; stays Pending.** Options and privacy implications are under "OD-15 privacy details" |
| OD-09 | Options extended: logon trigger and/or daily "run only if a week is due" trigger | Neither added without approval |

Each new OD's text in REQUIREMENTS gives the choices, consequences and affected chunks. The report also restates A-01…A-06 with recommendations, plus BL-01 and OD-01…OD-10.

## Phase 4 — Baseline approval mechanism

- The decision log gains `Type` (`Baseline`, `Product decision`, `Assumption`, `Technical`) and `Source` (date plus a quote or message reference) columns.
- **BL-01, "Planning baseline approved"**, is recorded only when David explicitly approves. At that moment:
  1. add the BL-01 row;
  2. compute SHA-256 hashes of the six files with `Get-FileHash` (read-only);
  3. write the hashes, sizes and timestamp to `docs/BASELINE.md`, a record file outside the six, so there is no self-reference.
- **Before git:** this is labelled "content fingerprint, not version-pinned". Chunk 1.1 checks the hashes, commits, and appends the commit hash. From then on git is the record.
- **Rules:**
  - Baseline approval lifts only Chunk 1's start gate.
  - A-NN rows confirm assumptions.
  - OD rows resolve product decisions.
  - Technical rows approve or override AD/P items.
  - Each type follows the Decision status rule (extended to BL-NN).
- `docs/BASELINE.md` is **not** created in r3; only the procedure is documented.

## Phase 2 — Application approach

- Targeted edits per file, with roadmap task numbering preserved wherever possible. New tasks: 8.4, 27.5, and a reshaped 29.x / 1.x.
- ARCHITECTURE:
  - new AD-23 to AD-29;
  - updated AD-02, AD-11, AD-18, AD-19 and R-01, R-10;
  - new R-17 to R-19;
  - retention, run-flow and DB-path text updated.
- README, CLAUDE and SKILL aligned with the above. All docs get revision notes and change-log rows.

## Phase 5 — Validation

Grep, awk and IDE diagnostics only:

- 36 chunks and all required fields.
- Unique task IDs, 1–5 per chunk.
- Every dependency points to an earlier chunk; only Chunk 36 depends on ⛔ chunks.
- ⛔ count 5. Counts of before-completion and confirm-before-completion lines.
- 85 or more requirement IDs traced. All IDs defined in REQUIREMENTS appear in traceability.
- OD rows 1…15, A rows 6, decision log has only the placeholder row.
- Contradiction search (DB path, "recorded/logged", Status formats, commit rules, telemetry).
- Skill cross-checked against CLAUDE section names and roadmap markers.
- markdownlint via `code -r` and IDE diagnostics.

No application tests (no code exists). Then stop, report, and do not start Chunk 1.
