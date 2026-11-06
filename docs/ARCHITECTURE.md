# DevPulse Architecture

> **Status: Proposed — not yet approved by David.** Revision r4, 2026-11-03. Every decision below is Proposed (AD-NN) unless it restates a confirmed requirement. The exception is AD-32: it is David's r4 requirement, not an ordinary Proposed decision, and only David's explicit decision can change it. See [REQUIREMENTS.md](REQUIREMENTS.md) for the labels and the open decisions (OD-NN).

## Overview

DevPulse is two independent programs that share one SQLite file:

- **Collector.** `yarn news:sync` is a Node.js command-line program. Windows Task Scheduler starts it every Monday at 08:00 Malaysia time, and David can also start it by hand. It fetches news, validates it, removes duplicates, stores it, simplifies it, retries failures, cleans up expired data and records the run.
- **Dashboard.** A Next.js app on `127.0.0.1`, started when needed. It reads the database and writes only bookmark and read state.

Neither program needs the other to be running (FR-COL-03, FR-AUTO-05).

**Two folders (AD-23).** Development happens in the development folder, on chunk branches, against a development database, `data/devpulse.dev.db`. Real use — the scheduled collection and the dashboard David reads — runs from a separate **live checkout** of an approved commit of `main`, which holds the only real database. Tests use temporary databases. A scheduled run never executes development code. See [Live checkout and deployment](#live-checkout-and-deployment).

## Diagram

```text
+--------------------------------------------------------------+
| Windows Task Scheduler                                       |
| task: DevPulse-Weekly-News-Collection                        |
| trigger: every Monday 08:00+08:00 (Asia/Kuala_Lumpur)        |
+------------------------------+-------------------------------+
                               | runs wrapper script
                               v
+--------------------------------------------------------------+
| Collector: yarn news:sync (Node.js CLI, never imports Next)  |
| 1 lock -> 2 fetch sources -> 3 extract + validate ->         |
| 4 dedupe -> 5 store -> 6 simplify -> 7 retry ->              |
| 8 retention cleanup -> 9 record run -> release lock          |
+--------------+-------------------------------+---------------+
               | HTTPS, outbound only          | transactions
               v                               v
+----------------------------+   +-----------------------------+
| News sources               |   | Live DB: data/devpulse.db   |
| (RSS/Atom, permitted APIs) |   | (only shared state)         |
| AI provider (if approved)  |   +-----------------------------+
+----------------------------+                 ^
                                               | reads; bookmark/read writes
                                 +-----------------------------+
                                 | Next.js dashboard           |
                                 | http://127.0.0.1 only       |
                                 +-----------------------------+
                                               ^
                                               |
                                 +-----------------------------+
                                 | Browser on David's PC       |
                                 +-----------------------------+

Manual run: David types `yarn news:sync` in a terminal.
The same collector code runs; the trigger is recorded as "manual".
Retention cleanup runs at step 8 in development. In the live checkout it
runs right after the lock, before any fetch (AD-32).
```

## Components

### Next.js dashboard

- **Responsibility:** Shows latest articles, search and filters, categories and technologies, difficulty, article details, original links, the weekly archive, bookmarks, read/unread status, collection status, the last run, the next scheduled run and collection failures (FR-DASH-01…13).
- **Does not:**
  - fetch news;
  - call the AI provider;
  - run on a schedule;
  - need to be open for collection to happen.

  The optional Chunk 28 (OD-07) would only start the collector as a separate process.
- **Talks to:**
  - SQLite. It reads everything and writes only bookmark and read state, through Server Actions.
  - The browser, on `127.0.0.1` only.
- **Status:** Proposed (AD-08).

### Collection script

- **Responsibility:** Runs one collection:
  - takes the lock and, in the live checkout, refuses to collect unless retention is active (AD-32);
  - runs retention cleanup (in the live checkout first, before any collection; in development at the end of the run) and works out which weeks are due;
  - runs the connectors and the processing pipeline;
  - simplifies new articles and retries failed ones;
  - writes the run record;
  - returns an exit code.
- **Entry points:**
  - The Task Scheduler wrapper, with `--scheduled`.
  - The terminal. Options: `--week`, `--source`, `--retry-only`, `--dry-run` (Chunk 25).
- **Does not:**
  - import Next.js (enforced by a lint rule);
  - serve HTTP;
  - store original article text.
- **Talks to:** news sources and the approved AI provider over HTTPS; SQLite.
- **Status:** Proposed (AD-01).

### News source connectors

- **Responsibility:** Fetch one source and return either a list of raw items or an error.
  - Source types: `rss`, `atom` and `api`.
  - Every request has a timeout, a maximum response size and a DevPulse User-Agent, and is retried once.
  - It reports the **coverage** of each target week, using the reach-back test in [Source coverage](#source-coverage).
- **Does not:**
  - throw errors past its boundary;
  - write to the database;
  - know about other sources.

  A failing source never stops the others (FR-COL-06).
- **Configuration:**
  - The source list lives in `src/lib/config/sources.ts` (AD-04).
  - Disabled sources are never fetched.
  - Sources stay disabled until David approves them (OD-03).
- **Status:** Proposed.

### Article processing pipeline

- **Responsibility:**
  1. **Extract:** turn raw items into candidate articles.
  2. **Validate:** check the title, URL, date and week window.
  3. **Remove duplicates:** by canonical URL, then by source and GUID.
  4. **Store:** save new articles as `pending`, with one transaction per source.
- **Content:** The article content needed for simplification stays in memory for the length of the run only (AD-06).
- **Does not:** persist original text, HTML or page copies (FR-DATA-03). The database has no column for them.
- **Status:** Proposed.

### Simplification provider interface

Sketch only; the Chunk 13 spec finalizes it.

```ts
interface SimplificationProvider {
  name: string;
  simplify(input: SimplificationInput): Promise<SimplifiedArticle>;
}
```

- **Implementations:**
  - `none` is the default. Articles stay `pending`, and that is not counted as a failure.
  - `fake` is deterministic. Its output is labelled as test data and never presented as a real simplification.
  - The adapter for an approved provider comes in Chunk 31, and only after OD-01.
- **Validation:** Before anything is stored, the output is checked against `simplifiedArticleSchema`: 2–4 sentences, 3–5 takeaways, the difficulty enum, and roles and categories from the taxonomy module.
- **Does not:**
  - see more than one article per call;
  - get tools;
  - get trusted. Article content is passed as untrusted data.
- **Status:** Proposed. Real simplification stays incomplete until OD-01 is approved and Chunk 32 is verified.

### SQLite database

- **Responsibility:**
  - Each folder has its own file under `data/`, which is gitignored: the live checkout's `data/devpulse.db` (real data), the development folder's `data/devpulse.dev.db`, and temporary files for tests (AD-23).
  - It is the only state shared between the collector and the dashboard.
  - Migrations are generated by drizzle-kit and committed. The collector and the dashboard refuse to use a database whose schema is not current (AD-24).
- **Settings:** WAL mode, `foreign_keys=ON` and `busy_timeout`, with short transactions and one connection per process (AD-02).
- **Does not:** hold original article text, secrets or API keys.
- **Status:** Proposed.

### Windows Task Scheduler

- **Responsibility:**
  - Start the wrapper script in the live checkout every Monday at 08:00 Malaysia time.
  - Never start a second instance.
  - Run as soon as possible after a missed start.
  - Restart after a failure, on a best-effort basis only (AD-26).
- **Does not:** contain logic. The collector decides which weeks are due. The wrapper (whether to use one is OD-13) only checks that it is running the approved live checkout, then runs `yarn news:sync --scheduled`.
- **Settings:** AD-11. The run mode is OD-10.
- **Verification:** see [Scheduling verification](#scheduling-verification). Unit tests are never proof that scheduling works.
- **Status:** Proposed.

### Retention cleanup

- **Responsibility:**
  - Delete articles older than the cutoff (OD-04), together with their related rows, by cascade, applying the bookmark-deletion rule (OD-05).
  - Delete run records older than the same cutoff. This is Proposed (AD-31): run records use the article cutoff.
  - Do all **database** deletions in one transaction. Files can't take part in a transaction, so log files are deleted only **after** the commit, followed by a sweep for orphaned log files. A failed file deletion is reported, never hidden (AD-31).
  - Apply the same expiry to deployment backups, judged by the oldest retained record inside each backup (AD-30).
  - Dashboard queries never show rows past the cutoff, even if cleanup hasn't run yet (AD-31).
- **Runs:**
  - in the live checkout, at the **start** of each `news:sync`, before any collection, while the lock is held. If cleanup fails, the run records `retention_cleanup_failed` and does not collect (AD-32). Which cleanup steps must succeed (database rows only, or also log files and backups) is OD-18;
  - in development, at the **end** of each `news:sync`, after collection and retries, while the lock is held;
  - by hand, with `yarn news:cleanup`;
  - before every live deployment backup (AD-30).
- **Status:** ⛔ blocked until OD-04 and OD-05 (bookmark deletion) are decided, because deletion cannot be undone. The optional "expires soon" hint is a separate decision, OD-16, and never blocks retention.

## Proposed data model

The Chunk 5 spec finalizes the exact columns. All timestamps are stored in UTC.

| Table | Purpose | Key fields |
| --- | --- | --- |
| `articles` | One row per unique article | `source_key`, `source_name`, `guid`, `canonical_url` (unique), `original_url`, `original_title`, `published_at`, `week_start`, `category`, `status`, `summary`, `why_it_matters`, `technical_explanation`, `key_takeaways`, `difficulty`, `provider`, `attempt_count`, `last_error`, `next_retry_at`, `is_read`, `read_at`, `is_bookmarked`, `bookmarked_at`, `collected_at`, `simplified_at`; unique (`source_key`, `guid`) |
| `article_technologies` | Technologies for each article | `article_id` (cascade delete), `technology` |
| `article_roles` | Developer roles for each article | `article_id` (cascade delete), `role` |
| `collection_runs` | One row per run | `trigger`, `week_start`, `started_at`, `finished_at`, `status` (`running`, `succeeded`, `partial`, `failed`, `no_sources`, `retention_inactive`, `retention_cleanup_failed`, `deployment_in_progress`), counts, `error_code`, `log_path`, `backup_cleanup` |
| `collection_run_sources` | Per-source results of a run | `run_id` (cascade delete), `source_key`, `status`, counts, `coverage`, `coverage_reason`, `oldest_fetched_at`, `at_item_limit`, `error_code` |
| `job_lock` | Prevents overlapping runs and deployments | holder (`collector` or `deployment`), PID, `started_at`, `heartbeat_at` |

- **No original content.** No column stores original article text or HTML. `last_error` and `error_code` hold error codes and safe messages only, never article content or raw provider output (AD-29).
- **Taxonomy values.** Role and category values are validated by the application, not by database CHECK constraints, so that the OD-08 lists can change without a migration (AD-22).
- **Default category.** Each article stores its source's default category when it is inserted. The provider may replace it only as OD-08 decides.
- **Governed tables.** Retention and backup expiry use one list of governed tables (`articles`, `article_technologies`, `article_roles`, `collection_runs`, `collection_run_sources`) and one list of exempt tables (`job_lock`, the migrations table). A schema test fails if any table is in neither list.

## Source coverage

Each run records, for every enabled source and target week, whether the source's coverage of that week is proven:

- **Complete** only when the fetch and parse succeeded, at least one item has a valid date, and `oldest_fetched_at` — the earliest valid date among **all** fetched items, not only the in-week ones — is at or before the week's start. The feed then reaches back past the week. This reach-back test is a heuristic: it suggests the feed covered the whole week, but it does not prove that nothing from the week was dropped (for example, with curated or top-N feeds, pinned old items or bogus dates). The Chunk 9 spec must resolve this (N-07). A quiet week with no in-week items is complete only on this test.
- **Possibly incomplete** when `oldest_fetched_at` is newer than the week's start (whether or not there are in-week items, and whether or not the feed returned its maximum item count), when the feed is empty, or when no item has a valid date.
- **Failed** for fetch or parse errors. Disabled sources are not counted.

`at_item_limit` is recorded as extra evidence for the feed-depth data (task 6.3), but it never makes a source complete. API sources apply the same test through pagination.

A **week** is complete only when every enabled source is complete for it. An incomplete week stays due, and later weekly runs re-collect it automatically up to the catch-up limit (AD-21). After that it is marked `incomplete (final)`: automatic recovery stops, the week is never shown as complete, and a manual `--week` run can still retry it. Accepting items into weeks already complete is OD-11; collecting more often than weekly is OD-12.

## Collection run flow

1. **Guards.** Refuse to start if the maintenance marker exists (`deployment_in_progress`) or the schema is not current (AD-24, AD-30).
2. **Lock.** Take the lock. If another run holds it, exit with "already running". If the lock is stale, take it over. Create the run record.
3. **Retention guard (live checkout only, AD-32).** If retention is not active, record `retention_inactive`, exit with code 0, and stop: nothing is collected and no week is marked complete.
4. **Clean up first (live checkout only).** Run retention cleanup, including backup expiry, once Chunk 27 exists. A cleanup failure records `retention_cleanup_failed`, exits non-zero, and stops before any collection. In development, cleanup runs in step 12 instead.
5. **Sources.** If no source is enabled, record `no_sources` and stop; no week is marked complete.
6. **Connectivity.** If the network is unreachable, wait with bounded backoff (AD-26) before failing with the reason `offline`.
7. **Due weeks.** Work out which weeks are due: the previous calendar week, plus earlier weeks that are not complete, up to the catch-up limit (AD-21). Where catch-up starts on the first active run is OD-19.
8. **Fetch.** For each enabled source: fetch, parse, extract and validate, and record its [coverage](#source-coverage). Each source is isolated from the others.
9. **Store.** Remove duplicates, both within the run and against the database. Insert new articles as `pending` with the source's default category, in one transaction per source.
10. **Simplify.** Send this run's pending articles to the configured provider and validate the output, retrying transient errors in-run while the content is still in memory (AD-25). Save valid output in one transaction. Mark remaining errors as `failed`.
11. **Retry.** Retry eligible earlier failures. Their content is fetched again, because it is never stored.
12. **Record.** In development, first run retention cleanup, once Chunk 27 exists. Then finish the run record (status, coverage, counts, log path), release the lock and exit with the documented code (AD-27).

## Article lifecycle

```text
collected --> pending --(provider "none")--> stays pending (not a failure)
                 |
             simplify()
              /       \
     valid output    error or invalid output
          |               |
          v               v
     simplified        failed --(retry, attempts < limit)--> simplify()
                          |
                  (attempts = limit)
                          v
                 failed permanently (shown on the status page)
```

## Time handling

- **Storage:** every timestamp is stored in UTC. All Malaysia-time (MYT) calculations live in one module, `src/lib/time/`.
- **MYT:** a fixed UTC+8 offset with no daylight saving time.
- **Collection week:** Monday 00:00 MYT up to, but not including, the next Monday 00:00 MYT (A-01).
- **Task trigger:** the time carries an explicit `+08:00` offset and the task is set to "synchronize across time zones" (AD-11). The run time therefore stays at 08:00 MYT even if the PC uses another timezone. This is checked on real Windows in task 29.4.
- **Next scheduled run:** the dashboard computes it from the schedule rule (AD-10).

## Concurrency and locking

- **Reads during writes:** WAL mode lets the dashboard read while the collector writes. `busy_timeout` and short transactions keep contention low.
- **No overlap:** the `job_lock` row and Task Scheduler's IgnoreNew setting together prevent overlapping runs (AD-09). This covers manual and scheduled runs alike.
- **Crash recovery:** the lock holder updates a heartbeat. A stale lock is taken over, and the interrupted run is marked `failed` with the reason "interrupted".

## Error handling strategy

- **Source failures:** a failing source is recorded in `collection_run_sources`, and the run continues (FR-COL-06).
- **Simplification failures:** these never stop collection (FR-SIM-09). Failed articles are recorded for retry (FR-SIM-10).
- **Run status and exit codes (AD-27):**
  - `succeeded` (every target week complete), `partial` (any week incomplete, or any source or article failed), `no_sources` and `retention_inactive` exit with code 0, so an expected state never causes restart loops.
  - `failed`, `retention_cleanup_failed`, `deployment_in_progress` and "already running" exit non-zero, each with its own code.
- **Offline:** the collector waits for the network with a bounded backoff (Proposed: up to 2 hours) before failing with the reason `offline` (AD-26). Task Scheduler's restart-on-failure is kept as a best-effort extra only, because it may not fire on a non-zero exit code; Chunk 30 checks this on real Windows.
- **Hard kills:** on Windows a forced stop can't be caught. The lock heartbeat lets the next run take over the stale lock and mark the interrupted run, and the status page shows a stale heartbeat as "interrupted".
- **Logging:** every failure is written to the run's log file and summarized in the run record. The dashboard shows it (FR-DASH-13).

## Security and data handling

- **Original content:** article text is held in memory only. Retries fetch it again (AD-06, OD-02).
- **Rendering:** all article text is rendered as plain text through React's escaping. `dangerouslySetInnerHTML` is never used.
- **Links:** only `http` and `https` links are rendered, and they open with `rel="noopener noreferrer"`.
- **Secrets:** these live only in `.env.local`, which is gitignored. They are never logged and never stored in the database.
- **Prompts:** feed content is untrusted. Prompts mark it as data. Output is accepted only if it passes the schema, and the provider gets no tools.
- **Outbound requests:** each one has a timeout, a size cap and a User-Agent, and follows the source's terms.
- **Dashboard binding:** the dashboard binds to `127.0.0.1` only, in development and production, and Server Actions accept only the local host and origin (AD-08, AD-28).
- **No telemetry:** Yarn and Next.js telemetry are disabled, fonts are local or system fonts, and nothing makes outbound requests except to approved sources and an approved provider (P-02, AD-28).
- **No content leaks (AD-29):**
  - test fixtures are synthetic, never copied from real articles;
  - logs, `last_error` and run records hold error codes and safe messages, never article content or raw provider output;
  - a sentinel-string test proves that article text never reaches the database, logs or errors;
  - `.env.local`, databases, backups and `data/` are never sent to any external service, including AI code review, which is governed by OD-15.

## Scheduling verification

**Scheduling proof rule.**

- Unit tests in Chunks 7, 29 and 30 prove date maths and the generated task definition only. They never count as proof that scheduling works.
- Chunks 29, 30 and 36 are complete only when real Windows checks on David's PC are recorded, each with the date, the command run and its real output.

**Approval rule.** Stop and ask David for explicit approval before any of the following:

- changing Windows settings, including the timezone;
- registering or modifying scheduled tasks;
- running tests that interrupt the PC or the network, such as sleep, shutdown or disconnecting the network.

## Live checkout and deployment

All of this is Proposed (AD-23, AD-30) and is built in Chunk 29, except the live collection guard below (AD-32): it is David's r4 requirement, not an ordinary Proposed decision, and only David's explicit decision can change it. Every step that changes the live checkout needs David's explicit go-ahead at the time.

**The live checkout.** A separate folder outside the development folder, created with `git worktree add --detach` at an approved commit of `main`. It has its own `data/devpulse.db` (the only real database), its own `.env.local`, and refuses the `fake` provider and seeding. It is never used for development.

**Merging.** Merging a chunk into `main` always needs David's explicit approval, after the chunk is verified. Nothing merges automatically.

**Updating.** `yarn live:update <commit>` refuses unless David has approved deploying that commit, the commit is on `main`, `yarn verify` passed at it, the live tree is clean, and no earlier backup-cleanup failure is unresolved. That last rule needs the recovery path required for the Chunk 29 spec (N-13). Then it:

1. **Takes the lock.** It takes `job_lock` as `deployment`, waiting a bounded time for a running collection to finish and refusing if it doesn't. A scheduled run that starts meanwhile exits with `deployment_in_progress`, and the week stays due. Task Scheduler is not modified: no task is disabled or re-registered.
2. **Gets exclusive use of the database through four guards**, kept until it finishes:
   - **(a)** the deployment lock;
   - **(b)** a `data/MAINTENANCE` marker holding the deploy ID, PID and start time, which every DevPulse process checks before opening the database (the deployment's own exception is specified in [Mandatory requirements for later specs](#mandatory-requirements-for-later-specs));
   - **(c)** a check that the live dashboard is stopped: its port is not listening and no dashboard process from the live checkout is running;
   - **(d)** a single connection in SQLite `locking_mode = EXCLUSIVE`.

   A checkpoint result of `busy = 0` only means that checkpoint wasn't blocked. It is never treated as proof of exclusive access.
3. **Runs retention cleanup first**, once retention is active, and refuses if anything expired remains.
4. **Checkpoints and backs up.**
   - It runs `PRAGMA wal_checkpoint(TRUNCATE)` and refuses on a non-zero `busy` or a WAL that isn't empty.
   - It writes a self-contained backup with `db.backup()` or `VACUUM INTO`, never a plain file copy.
   - It verifies the backup with `PRAGMA integrity_check`, the schema version and the row counts of every table.
   - Next to the backup it writes a manifest containing the oldest timestamps of every governed table, per-table row counts, `retention_active`, the schema version, the commit and the creation time.
5. **Deploys.** It checks out the commit, installs with `--immutable`, migrates, builds, and runs a smoke check.
6. **On success,** it records the deployment in `data/live-deploys.log` and releases the guards in reverse order: closes the exclusive connection, removes the marker, then releases the lock.
7. **On failure, it rolls back:**
   1. it closes the connection;
   2. it moves the failed database **and** its `-wal` and `-shm` files into `data/backups/failed-<timestamp>/`;
   3. it restores the backup and confirms that no `-wal` or `-shm` file is left over;
   4. it returns to the previous commit and installs;
   5. it verifies integrity, the schema version, the row counts and a smoke check, and only then reports the rollback as successful.

   If verification fails, it keeps the marker and the lock and asks David.

**Backups follow retention.**

- A backup expires at the earliest expiry of any retained record inside it — articles, their related rows and run records — using the rule that OD-04 and OD-05 resolve. Expired rows are not deleted *inside* backups, because rewriting a backup would break it for rollback.
- **Missing manifest.** It is replaced by a read-only inspection (`mode=ro`) that computes the same oldest timestamps for the current governed tables. A backup containing a table that is neither governed nor exempt is **unverifiable**, reported as a failure and never assumed to be within retention.
- **Backups made before retention.** Those with `retention_active: false` are re-checked by the first cleanup after retention becomes active.
- **Count limit.** At most 5 backups are kept, a Proposed value that never extends a backup past its data's expiry.
- **Failed-deployment folders.** Files kept for diagnosis follow the same expiry, and are deleted at expiry even if David hasn't reviewed them yet, with a report saying so.

**Wrapper guards.** The scheduled wrapper runs only in the live checkout. It refuses when:

- the tree is dirty;
- HEAD differs from the last deployed commit;
- HEAD is not reachable from `main`;
- the database path isn't the live one;
- the schema isn't current.

A scheduled run can never execute a development branch or an unapproved commit.

**Live collection waits for retention (AD-32).** In the live checkout the collector refuses to collect until retention is active. It records `retention_inactive` and exits with code 0. Retention is active only when:

1. OD-04 is resolved;
2. OD-05 (bookmark deletion) is resolved;
3. Chunk 27 is `Complete.` and verified;
4. a commit containing the approved retention implementation and configured rule has been deployed with `live:update` after David's go-ahead;
5. retention cleanup succeeds at the start of the run.

In code, this is a committed configuration value: `retention.rule` stays empty until OD-04 and OD-05 are resolved, and `retention.active` is `false`. Only a commit that David approves after Chunk 27 is complete may set it to `true`. The guard ships in the collector with `active: false` no later than task 29.1, so no live-checkout run can collect before it exists.

Deployment preparation, registering the task and test-task runs may happen earlier; a `retention_inactive` run record proves a test task fired.

## Mandatory requirements for later specs

These come from the independent review of r3. The named chunk spec must resolve them. Each is also listed in the roadmap's "Carried review findings" and on the chunk's `Spec must resolve` line.

- **Chunk 4 spec (N-12): the maintenance-marker exception.**
  - It is an in-process-only API.
  - It requires the marker's deploy ID **and** `pid == process.pid`.
  - It can't be reached through a CLI flag or an environment variable.
  - A lint rule limits which modules may import it.
  - A stale marker is reported, never removed automatically.
  - Tests show that the collector, cleanup and dashboard refuse even if they present a wrong ID.
- **Chunk 29 spec (N-03): every deployment step must be able to run under the guards it holds.**
  - Exclusivity comes from `locking_mode = EXCLUSIVE` across short transactions; in WAL mode, `BEGIN EXCLUSIVE` behaves like `BEGIN IMMEDIATE`.
  - Real-Windows tests from both directions show that another process gets `SQLITE_BUSY`.
- **Joint spec item for Chunks 4 and 29 (F2): the handoff design.** Choose either:
  - running cleanup, migration and smoke check in-process (the old code would then check the new schema); or
  - handing off to a subprocess of the new commit, which requires releasing guard (d) first and an authorisation channel other than `pid == process.pid`.

  The Chunk 4 exception design must not rule out the option Chunk 29 picks. Whichever is chosen, a real-PC test shows that a second process gets `SQLITE_BUSY` before and after the handoff.

## Proposed folder layout

```text
devpulse/                (development folder; the live checkout has the same layout)
  data/                  gitignored: devpulse.dev.db (dev) or devpulse.db (live), logs/, backups/
  docs/
    REQUIREMENTS.md, ARCHITECTURE.md, IMPLEMENTATION_ROADMAP.md
    superpowers/specs/   chunk specs
    superpowers/plans/   chunk plans
  drizzle/               generated migrations (committed)
  scripts/
    news-sync.ts         yarn news:sync
    windows/             run-news-sync.ps1, task registration scripts
  src/
    app/                 Next.js routes (dashboard)
    components/          UI, including shadcn/ui
    lib/
      config/            env.ts, sources.ts
      db/                client.ts, schema.ts
      collector/         connectors, extract, validate, dedupe, pipeline, lock, retention
      simplifier/        types, schema, taxonomy, providers/
      time/              Malaysia-time week and schedule helpers
  tests/                 fixtures/, e2e/
```

Chunk 3 updates this layout to match what exists.

## Decision register

Every entry is **Proposed**, except AD-32. AD-32 is David's r4 requirement, not an ordinary Proposed decision: no chunk spec and no ordinary Technical decision-log row can change it; only David's explicit decision can. "Needs David if" names the change that would turn it into an open decision.

| ID | Decision | Why | Alternatives considered | Status | Needs David if |
| --- | --- | --- | --- | --- | --- |
| AD-01 | One repository and package with two entry points, the dashboard and `tsx` CLI scripts, sharing `src/lib` | Simplest way to share schema and logic while keeping the collector independent of Next.js | A monorepo with separate packages | Proposed | The collector must run on another machine |
| AD-02 | `better-sqlite3` driver, one connection per process (a singleton); database paths per AD-23 | Mature, synchronous transactions, supported by Drizzle | `@libsql/client`; Node's built-in `node:sqlite` | Proposed; the Chunk 4 spec confirms it after checking for a Windows prebuilt binary for the exact pinned Node version | A switch would leave SQLite or Drizzle |
| AD-03 | Store UTC; one Malaysia-time module | One source of truth for week boundaries | Storing local times | Proposed | — |
| AD-04 | Sources in typed, version-controlled config; articles store the source key and name | Simple and reviewable; no admin screens | A sources table edited from the dashboard | Proposed | David wants to manage sources in the dashboard |
| AD-05 | Lifecycle `pending`, `simplified`, `failed`; default provider `none`; `fake` produces labelled test data; provider recorded on each article | Collection works without AI, and fake output can never pass as real | — | Proposed | — |
| AD-06 | Original text kept in memory only; retries fetch it again | Meets FR-DATA-03 with no exceptions | Temporary storage (OD-02 option c) | Proposed, subject to OD-02 | Always (OD-02) |
| AD-07 | Duplicates: unique canonical URL plus unique (`source_key`, `guid`); inserts ignore conflicts | A database-level guarantee (FR-DATA-06) | Matching by title similarity | Proposed | A-02 is rejected |
| AD-08 | Dashboard reads through Server Components and writes through Server Actions; no REST layer; Node.js runtime; bound to `127.0.0.1` | Fewest moving parts; local only | API routes with client-side fetching | Proposed | The dashboard must be reachable from other devices |
| AD-09 | Overlap prevention: a `job_lock` row (PID and heartbeat) plus Task Scheduler's IgnoreNew | Covers manual and scheduled runs | A lock file | Proposed | — |
| AD-10 | Next scheduled run computed from the schedule rule; overdue warning when the latest expected run has no success | The dashboard never has to query Task Scheduler | Calling `schtasks` from the dashboard | Proposed | — |
| AD-11 | Task Scheduler: weekly Monday trigger at `08:00:00+08:00`, synchronized across time zones; IgnoreNew; StartWhenAvailable; restart on failure as best effort only; execution time limit (Proposed: 2 hours). Action: `powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File <absolute path>` to a wrapper that ends with `exit $LASTEXITCODE`. The bypass applies only to that process and changes no Windows setting | Meets FR-AUTO-01…09, survives timezone differences, and works with this PC's `AllSigned` machine policy | A trigger in local time; calling `yarn` directly | Proposed; checked on real Windows in Chunks 29 and 30 | Always for the wrapper (OD-13) and the run mode (OD-10) |
| AD-12 | Search uses parameterized SQL `LIKE` | Enough for two months of articles | SQLite FTS5 full-text search | Proposed | — |
| AD-13 | Tests use fixtures, mocked fetch and temporary SQLite databases, never the live network | Reliable, free, works offline | Tests against live feeds | Proposed | — |
| AD-14 | Run results stored in the database, plus one log file per run in `data/logs/` | Feeds the status page and helps diagnose crashes | Database only | Proposed | — |
| AD-15 | Chunk specs in `docs/superpowers/specs/`, chunk plans in `docs/superpowers/plans/` | Matches David's existing workflow | — | Proposed | — |
| AD-16 | A maintained RSS/Atom parser library, chosen in the Chunk 8 spec | Feed formats vary | Hand-written XML parsing | Proposed | — |
| AD-17 | Supporting libraries: `zod`, `tsx`, a feed parser and a timezone helper, each confirmed in its chunk spec | Validation, running TypeScript scripts, parsing, time | — | Proposed | Any of them is paid or heavy |
| AD-18 | An **exact** Node.js version (this PC has 24.13.0 via nvm-windows), checked by the wrapper and by `yarn check`, with the wrapper calling `node` by absolute path; Yarn 4 committed as a release file (`yarnPath`), so it doesn't depend on Corepack; `.yarnrc.yml` with `nodeLinker: node-modules` and `enableTelemetry: false` | nvm-windows ignores `.nvmrc`, Yarn doesn't enforce `engines`, and a Node switch silently breaks the native SQLite module | Yarn via Corepack; Plug'n'Play | Proposed; the Chunk 1 spec confirms the exact versions | — |
| AD-19 | Retry limit of 3 attempts across runs, on top of in-run retries (AD-25); `content_unavailable` uses up an attempt | Bounded effort | Unlimited retries | Proposed; revisit with OD-01 | A paid provider is chosen, because each retry costs money |
| AD-20 | Commits stay local, on the chunk branch. The repository has one remote, `origin` (`https://github.com/David-Sang96/DevPulse.git`), but nothing is pushed anywhere without David's explicit approval, and the remote is not added to, changed or removed without it. Having `origin` authorizes no push or other remote operation | Personal project; nothing leaves the PC unless David approves it | No remote at all (the original wording, outdated because `origin` now exists); routine pushes to the remote | Proposed | Always: adding or changing a remote, or pushing anywhere, needs David |
| AD-21 | Automatic catch-up limit of 4 weeks, re-collected only by the existing weekly runs; after it, a week is `incomplete (final)` but can still be retried by hand with `--week` (within retention) | Feeds rarely keep older items (R-01) | Catching up the whole retention period | Proposed technical policy. It limits automatic recovery (FR-AUTO-07); David may override it. Where catch-up starts on the first active run is OD-19 | Always, if David wants a different limit |
| AD-22 | Roles and categories validated in the application (zod), not by database CHECK constraints | The OD-08 lists can change without a migration | Database CHECK constraints | Proposed | — |
| AD-23 | Separate live checkout (detached worktree of an approved `main` commit) with the only real database; development uses `data/devpulse.dev.db`, tests use temporary databases; seeding and `fake` refuse the live database | A scheduled run must never execute development code or mix fake rows into real data | One folder and one database | Proposed | — |
| AD-24 | The collector and the dashboard check at startup that the schema is current, and refuse otherwise | Prevents runs against a half-migrated database | Trusting that migrations ran | Proposed | — |
| AD-25 | In-run retries with backoff for transient provider errors (timeout, 429, 5xx, invalid JSON), while the content is still in memory | Weekly re-fetch usually finds the item gone | Retry only on the next weekly run | Proposed | A paid provider is chosen (cost) |
| AD-26 | The collector waits for connectivity with bounded backoff (Proposed: up to 2 hours) before failing as `offline`; Task Scheduler's restart-on-failure is best effort only | Restart-on-failure may not fire on a non-zero exit code | Relying on restart-on-failure | Proposed; checked on real Windows in Chunk 30 | — |
| AD-27 | Run statuses and exit codes: `succeeded`, `partial`, `no_sources` and `retention_inactive` exit 0; `failed`, `retention_cleanup_failed`, `deployment_in_progress` and "already running" exit non-zero with distinct codes; source coverage and week completeness as in [Source coverage](#source-coverage) | Honest reporting without restart loops | Treating every problem as a failure | Proposed | — |
| AD-28 | Privacy defaults: Yarn and Next.js telemetry off; local or system fonts; dev and production servers on `127.0.0.1`; Server Actions accept only the local host and origin | Local-first (NFR-01, P-02) | Framework defaults | Proposed | — |
| AD-29 | Content-leak rules: synthetic fixtures only; logs, `last_error` and run records hold codes and safe messages only; a sentinel-string test; nothing from `.env.local`, databases or `data/` is sent anywhere | FR-DATA-03 covers more than the database | Trusting each module | Proposed | — |
| AD-30 | Live deployment with `yarn live:update`: four exclusivity guards, retention before backup, verified self-contained backups with manifests, data-based backup expiry, verified rollback; at most 5 backups (Proposed value) | Safe updates of the only real database | Copying files by hand | Proposed; checked on real Windows in Chunk 29 | — |
| AD-31 | Retention deletes rows in one transaction and files after the commit, with an orphan sweep; dashboard queries hide rows past the cutoff; run records use the article cutoff | File deletion can't be rolled back; expired rows must not show even if cleanup didn't run | One combined "transaction" | Proposed, including "run records use the article cutoff" | David wants a different period for run records |
| AD-32 | Live collection guard: in the live checkout the collector records `retention_inactive` and collects nothing until retention is active (OD-04 and OD-05 resolved, Chunk 27 complete and verified, the approved rule deployed, cleanup succeeding at the start of each run, before collection); a cleanup failure records `retention_cleanup_failed`. Implemented as committed configuration (`retention.rule`, `retention.active: false` by default) | Preserves FR-DATA-04: no live article data can exist before it can be expired | Collecting before retention exists | David's r4 requirement (2026-11-03), not an ordinary Proposed decision; only David's explicit decision can change it. The scope of "cleanup must succeed" is OD-18 | Always: any change to it |
| AD-33 | Yarn release 4.12.0: the committed `.yarn/releases/yarn-4.12.0.cjs` and the `packageManager` value (a detail of AD-18) | Corepack's default Yarn on this PC, already in its cache, so the shim needs no download | The newest Yarn 4 at execution time | Proposed; David's decision is in the decision log (Chunk 1 spec, Q1) | Any other Yarn version |
| AD-34 | Next.js scaffold version: the latest stable `create-next-app`, looked up at execution time from registry metadata only (G-1a), downloaded and run only after a separate approval (G-1b) | The roadmap names no Next.js version | A version fixed without a registry lookup | Proposed; David's decision is in the decision log (Chunk 1 spec, Q2) | Any other version rule |
| AD-35 | Per-project Next.js telemetry switch: a committed `.env.yarn` containing only `NEXT_TELEMETRY_DISABLED=1`, which Yarn injects into `yarn dev`, `yarn build`, `yarn start` and `yarn next …`; direct invocations outside Yarn, such as `npx next` or `node …/next`, are not covered and are not supported (a detail of AD-28) | A per-project setting; `next telemetry disable` writes a per-user setting | `next telemetry disable` | Proposed; David's decision is in the decision log (Chunk 1 spec, Q3) | Telemetry must also be off outside Yarn |
| AD-36 | Format scripts: `format` = `prettier --write .` and a separate `format:check` = `prettier --check .`; task 2.1's acceptance check is `yarn format:check` | Prettier writes files when `--write` and `--check` are combined, so `yarn format --check` on a `--write` script would rewrite files instead of checking them | One `format` script, run as `yarn format --check` | Proposed; David's decision is in the decision log (Chunk 2 spec, D-1) | Any other layout of the format commands |
| AD-37 | Chunk 2's E2E smoke test checks the exact current page title `Create Next App`; the app is unchanged in Chunk 2, and Chunk 17 updates the test when it changes the title | An exact title also detects a different app answering on the test port | Setting the title to DevPulse in Chunk 2; checking only for a non-empty title | Proposed; David's decision is in the decision log (Chunk 2 spec, D-2) | Changing the page title before Chunk 17 |
| AD-38 | markdownlint (`markdownlint-cli2`) with MD013 (line length) off; formatting-only violations in existing docs are fixed without wording changes, in their own commit | Long lines are the house style, and docs must stay free of markdownlint warnings | Turning off every rule the existing docs break | Proposed; David's decision is in the decision log (Chunk 2 spec, D-3) | A fix that changes wording, or turning off any rule other than MD013 |
| AD-39 | `typecheck` = `next typegen && tsc --noEmit` | `src/app/layout.tsx` uses `LayoutProps`, declared only in the generated `.next/types/routes.d.ts`; `next typegen` generates it without a build, so the check also works on a clean checkout | Plain `tsc --noEmit`, which needs an earlier build or `yarn dev` | Proposed; David's decision is in the decision log (Chunk 2 spec, D-4) | Any other type-check command |
| AD-40 | Existing code that fails `yarn format:check` gets one formatting-only commit, which may touch Chunk 1 files such as `scripts/check-node.mjs`, with no behaviour change, recorded in the change log | Adopting Prettier is Chunk 2's job, and it keeps Prettier's defaults | Ignoring Chunk 1 files in `.prettierignore`; a wider `printWidth` | Proposed; David's decision is in the decision log (Chunk 2 spec, D-5) | Any non-formatting change to a completed chunk's files |
| AD-41 | Chunk 2 devDependencies, pinned exactly and installed in one approved step (G-2b): `prettier@3.9.10`, `markdownlint-cli2@0.24.0`, `vitest@5.1.0`, `@playwright/test@1.64.1` and `vite@8.3.5` | The tools for tasks 2.1–2.3, at the latest stable versions found by the G-2a registry lookup on 2026-11-04; `vite` because Vitest 5 declares it as a non-optional peer dependency (Vite 6.4 or later, 7 or 8), which Vitest uses to transform and run test files | Version ranges (`^`); leaving Vitest's `vite` peer dependency unmet | Proposed; David's decision is in the decision log (Chunk 2 spec, D-6) | Any other package or version |
| AD-42 | Chunk 2's Playwright E2E tests run in the installed Google Chrome (`channel: "chrome"`; 156.0.8078.80 at decision time, 2026-11-04), not in a browser downloaded by Playwright; no browser download is planned in Chunk 2, and any download needs a fresh go-ahead (G-2c) | The cached Chromium revisions are 1223 and 1228. The exact revision required by Playwright 1.64.1 has not yet been verified. Chunk 2 uses installed Google Chrome, so no browser download is planned | Playwright's bundled Chromium via `yarn playwright install chromium` (G-2c) | Proposed; David's decision is in the decision log (Chunk 2 spec, D-7) | Any other browser, or any browser download |
| AD-43 | markdownlint handling of the last 20 violations in the planning-r2 plan `docs/superpowers/plans/2026-11-03-devpulse-planning-docs.md` (a detail of AD-38): its 18 bold-only label lines become plain text (MD036), and MD038 is disabled for two lines only, each with a `markdownlint-disable-next-line MD038` comment above a code span that intentionally ends with a space; no other rule is disabled and no file is excluded | The 18 lines are labels and phase titles, not headings, and turning them into headings would change the document outline. The two code spans end with a space on purpose (a `##` heading prefix followed by a space, and a regex ending in a space used for a "36 matches" check), so removing the space would change the text | Converting the 18 lines to headings; adding a trailing colon to them; rewording the two code spans; excluding the file from lint | Proposed; David's decision is in the decision log (Chunk 2 spec, D-3; a detail of AD-38) | Disabling MD038 or any other rule anywhere else, excluding a file from lint, or changing the wording of a doc |

## Risks

| ID | Risk | Mitigation | Chunks |
| --- | --- | --- | --- |
| R-01 | Feeds keep a limited history, so items can be lost even in a normal week (busy feeds) and a week missed for long may be unrecoverable | Coverage recorded per source and week, incomplete weeks stay due, feed depth measured for candidates; late items (OD-11) and more frequent collection (OD-12) are David's decisions | 6, 9, 30 |
| R-02 | Feed dates are missing, wrong or in an unexpected timezone | Validate dates and reject bad ones with a reason | 9 |
| R-03 | Copyright and terms of use, for sources and for the AI provider | Only approved sources; store only derived content and a link; review the provider's terms in Chunk 16 | 6, 16 |
| R-04 | AI cost and rate limits | Per-run caps, a budget stop, backoff | 32 |
| R-05 | AI output that is inaccurate or invented | Schema validation, an "AI-simplified" label, the original link, David's review | 19, 32 |
| R-06 | Instructions hidden in article content (prompt injection) | Content marked as untrusted data, structured output, no tools | 31 |
| R-07 | Toolchain on Windows: the native `better-sqlite3` module can break after a Node.js upgrade, and Yarn installation depends on whether the Node.js release bundles Corepack | Pin versions; document the setup and rebuild steps | 1, 4 |
| R-08 | The dashboard's reads and the collector's writes contend for SQLite | WAL, `busy_timeout`, short transactions | 4, 24 |
| R-09 | The scheduled task's environment is missing PATH, yarn or the working directory | A wrapper script with absolute paths; an on-demand test run | 29 |
| R-10 | The PC is off, asleep or offline at the trigger time | StartWhenAvailable, restart on failure, catch-up; checked on real Windows | 29, 30 |
| R-11 | The PC's timezone is not Malaysia time, or it changes | Explicit `+08:00` trigger; the app computes in Malaysia time whatever the OS timezone is | 7, 29 |
| R-12 | A crash leaves a stale lock or an interrupted run | Heartbeat, stale-lock takeover, recovery of interrupted runs | 24 |
| R-13 | Retention deletes bookmarked articles unexpectedly | OD-05 (bookmark deletion), plus the optional "expires soon" hint (OD-16) | 27 |
| R-14 | Feed formats vary: malformed XML, unusual encodings | A maintained parser, fixtures for each source, isolation per source | 8 |
| R-15 | Scope creep, or requirements changed silently | CLAUDE.md "stop and ask David" rules; ⛔ gates; decision log | All |
| R-16 | Task Scheduler behaves differently from its documentation, for example after sleep, while logged off, or by not restarting on a non-zero exit | Real Windows checks; connectivity wait in the collector (AD-26); any limitation is reported honestly | 29, 30, 36 |
| R-17 | A scheduled run executes development code or touches development or fake data | Live checkout, wrapper guards and separate databases (AD-23, AD-30) | 4, 29 |
| R-18 | Original article text leaks through fixtures, logs, errors or external review | AD-29 rules, sentinel test, OD-15 | 14, 34 |
| R-19 | A deployment corrupts or loses the real database, or a backup keeps expired data | Exclusive guards, verified backups and rollback, data-based backup expiry (AD-30) | 27, 29 |

## External dependencies

- **Node.js and Yarn.** The current LTS release of Node.js; both are free.
- **Open-source packages** from the npm registry.
- **Windows 11 and Windows Task Scheduler.**
- **Internet access** at run time.
- **News sources.** Their availability and terms of use (OD-03).
- **An AI provider**, only if approved (OD-01). It may cost money.
