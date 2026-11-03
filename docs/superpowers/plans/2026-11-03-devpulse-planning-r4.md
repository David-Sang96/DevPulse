# Plan — Planning revision r4

**Historical record, not the current executable project specification.** This document records the r4 planning revision: the plan as approved by David, which was applied to the six baseline files on 2026-11-03. The baseline files were corrected after that (RV-01…RV-05 and the final baseline review corrections), so they may differ from this record; for current project instructions, the six baseline files take precedence. This record does not approve BL-01, resolve any open decision (OD-NN) or confirm any assumption (A-NN).

## Context

The independent review of r3 found that the baseline is not ready for BL-01. David approved preparing r4 with:

- **Required:** N-01, N-02, N-19.
- **Recommended:** N-05, N-11, N-15, N-18, N-21, the N-23 labels, and the N-03 and N-12 notes.
- **Additional requirement (N-14):** live collection must not start before Chunk 27's retention enforcement is implemented and verified.

Every finding left for a later chunk must keep a gate that can't be silently skipped.

**r4 does not:**

- start Chunk 1;
- approve BL-01, any OD or any assumption;
- choose OD-04 or OD-05;
- change the schedule, the retention period or the product scope;
- initialize git, install packages, change Windows settings, or write application code.

**Files r4 would change** (only after David approves this plan):

- the six baseline files: `CLAUDE.md`, `README.md`, `docs/REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_ROADMAP.md`, `.claude/skills/chunk-workflow/SKILL.md`;
- a banner on the r2 plan and on the r3 record (both in `docs/superpowers/plans/`);
- a new record, `docs/superpowers/plans/2026-11-03-devpulse-planning-r4.md`, holding a copy of this plan.

## 1. Required before BL-01

### N-01 — the skill no longer edits the baseline before the baseline commit

- **SKILL.md, Step 5.** For Chunk 1, task 1.1 runs first:
  1. check that BL-01 is resolved and the hashes match;
  2. `git init -b main`;
  3. the baseline commit;
  4. create `chunk-01-toolchain`.

  Only then does the skill set the roadmap Status to `In progress.` and update the summary, on that branch.
  Steps 1–4 (reading, the spec and plan under `docs/superpowers/`, and approval) write nothing to the six files. Step 3 states this explicitly.
- **Roadmap 1.1 / 1.5 tests:** "the six baseline files are unchanged since the baseline commit, apart from Chunk 1's own Status and summary lines in the roadmap", checked with `git diff <baseline-commit> -- <six files>`. This replaces the hash re-check after the scaffold merge.
- **REQUIREMENTS "Baseline approval procedure":** state the order. Add the BL-01 row, then convert line endings (N-19), then hash. Any later edit before the baseline commit means re-approval.

### N-02 — Chunk 1 rewritten (still 5 tasks)

1. **1.1 Pre-flight and baseline commit.**
   - Check BL-01 and the hashes.
   - `git init -b main`, no remote.
   - Write `.gitattributes` (`* text=auto eol=lf`) and `.editorconfig` (`end_of_line = lf`).
   - Write `.gitignore`:
     - `node_modules/`, `.next/`, `data/`;
     - `.env*` with `!.env.example`;
     - Playwright output;
     - Yarn Berry entries: `.yarn/*` with exceptions for `releases`, `patches`, `plugins`, `sdks` and `versions`, plus `.pnp.*`.
   - First commit: exactly the baseline docs, `docs/BASELINE.md`, `docs/superpowers/`, `.claude/skills/` and these three files.
   - Check that every committed baseline file's SHA-256 (`git show <commit>:<file>`) equals the recorded hash.
   - Append the commit hash to `docs/BASELINE.md` **on `chunk-01-toolchain`** (fixes L-e).
2. **1.2 Scaffold outside the repository, privacy first.**
   - Run `create-next-app` non-interactively with `--skip-install` in a temporary folder **outside** the repository (TypeScript, Tailwind v4, ESLint, App Router, `src/`, `@/*`).
   - Before merging: list every emitted file; remove `next/font/google` (system or local fonts); drop the scaffold's README, and any `AGENTS.md`, `CLAUDE.md` or `.yarnrc.yml`.
   - Merge rule: copy only files that don't already exist; **never overwrite a tracked file**; merge `.gitignore` and `package.json` by hand; package name `devpulse`.
   - No install and no build in this task.
3. **1.3 Pin the toolchain** (now that `package.json` exists).
   - Exact Node version in `engines` and `.nvmrc` (documentation only).
   - A plain-JavaScript `scripts/check-node.mjs`, so it runs without `tsx`.
   - Commit Yarn 4 as a release file (`yarnPath`) and set `packageManager`.
   - `.yarnrc.yml`: `nodeLinker: node-modules`, `enableTelemetry: false`.
   - The Chunk 1 spec records the method and verifies that `node .yarn/releases/yarn-4.*.cjs -v` and `yarn -v` (in the repo, in a fresh shell) report the committed release with no Corepack prompt. This covers the Chunk-1 part of N-17; the rest moves to the Chunk 29 spec.
4. **1.4 Install, then privacy checks, then the first build.**
   - `yarn install` with the committed release.
   - Next.js telemetry disabled for **every** Next.js invocation, including the bare CLI. The Chunk 1 spec picks and verifies the method.
   - Dev and start bound to `127.0.0.1`.
   - Only then `yarn build`.
   - Tests:
     - `yarn next telemetry status` reports disabled;
     - no `next/font/google` and no font or telemetry hosts appear in the source or build output;
     - `git status --porcelain` is clean after install and build (the Chunk-1 part of N-20).
5. **1.5 Run.**
   - `yarn dev` serves `http://127.0.0.1:3000` with no console errors.
   - The baseline-unchanged diff check passes.
   - Everything after the baseline commit is on `chunk-01-toolchain`, waiting for David's merge approval.

### N-19 — line endings

1. As the **last** r4 step, convert every Markdown file in the project to LF, including `docs/superpowers/**`. Verify that 0 lines contain a carriage return.
2. The BL-01 procedure hashes LF content. Task 1.1 compares the committed blobs with the recorded hashes. The procedure warns that an editor saving with CRLF before the baseline commit forces BL-01 to be re-approved.

## 2. Recommended corrections (included)

- **N-05 — `yarn verify` exists from Chunk 2.**
  - Task 2.4 adds `yarn verify` = `yarn check` + `yarn test:e2e`.
  - Task 34.4 becomes "extend `yarn verify` with the collector E2E and confirm full coverage".
  - `live:update` keeps requiring `yarn verify`, which now exists. This breaks the cycle.
- **N-11 — Chunk 30's Dependencies line:**

  > 29\. Decision before completion: OD-03 (needed before tasks 30.3–30.5), OD-09, OD-11. Chunk 27 Complete needed before tasks 30.3–30.5 (N-14). Confirm before completion: A-01.

  Tasks 30.1–30.2 can proceed. 30.3–30.5 wait for real sources and active retention (F7).

  The OD-03 gate column in REQUIREMENTS, the roadmap Gates table and the decisions-blocking table all add Chunk 30. A new legend marker and skill row, "Chunk NN Complete needed before task N.M", are task-level conditions: they stop only the named tasks, not the start of the chunk. The skill's Dependencies check reads only the leading list of chunk numbers (F1).
- **N-15 — deployment design moved into the baseline.** ARCHITECTURE "Live checkout and deployment" gains the details that existed only in the r3 record:
  - what the maintenance marker contains;
  - the order the guards are released in;
  - checkpoint and backup methods (`db.backup()` or `VACUUM INTO`, never a plain copy);
  - backup verification (`integrity_check`, schema version, row counts);
  - manifest fields (oldest timestamps for every governed table, `retention_active`);
  - the read-only fallback;
  - the rule "deployment refuses while an earlier backup-cleanup failure is unresolved", marked as needing a recovery path (N-13, Chunk 29 spec);
  - the rule for failed-deployment files.

  The r3 record gets a banner: "historical record, not normative; ARCHITECTURE governs."
- **N-18 — plan tooling and OD-15.**
  - SKILL Step 3: if `superpowers:writing-plans` is used, ignore its "REQUIRED SUB-SKILL: subagent-driven-development" header. Execute inline, and never dispatch implementer or reviewer subagents while OD-15 is unresolved.
  - Step 2: superseded plans are history, not instructions.
  - The r2 plan gets a "superseded by r3/r4; do not execute" banner.
- **N-21 — go-ahead gaps.**
  - Task 29.2's wrapper test in the live checkout becomes **Go-ahead at execution time**.
  - The roadmap gates list adds 6.3 and 29.2.
- **N-23 — labels.**
  - CLAUDE.md gets a line before "Architecture principles": these principles carry Proposed decisions (AD-NN). They are the working design, changed only through a chunk spec or a Technical decision-log row, and BL-01 doesn't make them approved product decisions.
  - AD-21: remove "not a product decision". Say it limits automatic recovery (FR-AUTO-07) and David may override it.
  - 25.1's `--week` refusal: phrase it as "older than the retention cutoff defined by OD-04", with no assumption about the date basis.
  - The run-record cutoff (27.1, AD-31): labelled "Proposed: run records use the article cutoff".
  - OD-06 and OD-11 get **development-only interim behaviour, labelled Proposed**:
    - OD-06: show pending articles with a badge;
    - OD-11: reject late items, which is today's behaviour.

    Neither chunk can be marked complete until David resolves the OD.
- **N-03 and N-12 — mandatory spec requirements**, as a new ARCHITECTURE subsection "Mandatory requirements for later specs":
  - **Chunk 4 spec (N-12):**
    - The maintenance-marker exception is an in-process-only API.
    - It requires the marker's deploy ID **and** `pid == process.pid`.
    - It can't be reached through a CLI flag or environment variable.
    - A lint rule limits which modules may import it.
    - A stale marker is reported, never removed automatically.
    - Tests show that the collector, cleanup and dashboard refuse even if they present a wrong ID.
  - **Chunk 29 spec (N-03):**
    - Every deployment step must be able to run under the guards it holds.
    - **Joint "Spec must resolve" for Chunks 4 and 29 (F2):** the handoff design. Choose between:
      - running cleanup, migration and smoke check in-process (but the old code would then check the new schema);
      - handing off to a subprocess of the new commit. That needs releasing guard (d) first and an authorisation channel other than `pid == process.pid`.

      The Chunk 4 exception design must not rule out the option Chunk 29 picks. Whichever is chosen, a real-PC test shows that a second process gets `SQLITE_BUSY` before and after the handoff.
    - Exclusivity comes from `locking_mode=EXCLUSIVE` across short transactions; in WAL mode `BEGIN EXCLUSIVE` behaves like `BEGIN IMMEDIATE`.
    - Real-Windows tests from both directions.
  - Task 4.2 and 29.1 text point to this subsection.

## 3. Additional requirement — N-14 (live collection waits for verified retention)

- **New guard (ARCHITECTURE run flow, task 29.2 wrapper and collector, CLAUDE.md):** in the live checkout, the collector refuses to collect until **retention is active**. It records the status `retention_inactive`, exits with code 0 so there are no restart loops, and never marks a week complete.
- **"Retention is active" means all of these:**
  1. **OD-04 is resolved**: what "two months" means and which date it is measured from.
  2. **OD-05's bookmark-deletion question is resolved.** REQUIREMENTS.md:249–255 defines OD-05 as "whether bookmarked articles are deleted at expiry", with the options "delete" or "keep beyond the cutoff". Cleanup can't run without knowing whether to delete bookmarked articles, so this is a retention responsibility, and it stays a condition under David's own rule ("unless REQUIREMENTS defines another retention-related responsibility").
  3. **Chunk 27 retention enforcement is `Complete.` and verified**, with the verification recorded.
  4. **The deployed commit** (through `live:update`) contains the approved retention implementation and the configured rule.
  5. **Retention cleanup succeeds before each collection run:** it runs first, and the expired-record count afterwards is 0. If cleanup fails, the run refuses to collect.
- **The "expires soon" dashboard hint gates nothing here.** It appears in REQUIREMENTS only as part of OD-05's *recommendation*. In r4 it is split from OD-05's retention question:
  - REQUIREMENTS records it as a separate Pending decision, **OD-16**, "show an 'expires soon' hint on bookmarked articles?" (see F14);
  - it gates only the conditional task 27.5, never Chunk 27's ⛔ start, retention activation or live collection.
- **If David wants collection to start sooner,** the bookmark question can be decided on its own, ahead of the hint. That is offered as a choice, not decided here.
- **What this does not choose:** the rule's values, and whether bookmarks are deleted. They come only from the OD-04 and OD-05 rows in the decision log.
- **What may happen before retention is active:**
  - deployment preparation: creating the live checkout, `live:update`, registering the task (29.4);
  - test-task runs (29.3, 29.5), which are accepted with a `retention_inactive` run record as proof the task fired.

  Real collection, and the checks that need it (30.3, 30.4, 36.2), wait for active retention.
- **FR-DATA-04 and the two-month requirement are unchanged.** The guard makes sure no live article data exists before it can be expired.
- **Consequence for David:** real use can't begin until OD-04 and OD-05's bookmark question are decided and Chunk 27 is done. Chunks 30, 33, 34, 35 and 36 can't *complete* before then.
- **Corresponding text edits in r4:**
  - Chunk 27's ⛔ line names "OD-04, OD-05 (bookmark deletion)";
  - the hint becomes its own Pending decision, OD-16, in REQUIREMENTS, and task 27.5 says "only if OD-16 is approved".

  No option is chosen.
- **The rest of N-14** (manifest vs OD-05 "keep bookmarks", read-only open of failed folders, short rollback window) becomes a "Spec must resolve" item for Chunks 27 and 29.

## 4. Deferred findings — gates that can't be skipped

**New field.** Each owning chunk gets its own line, `**Spec must resolve:** N-xx, …`, directly after its Dependencies line. It is **not** part of the Dependencies line, so it never counts as a chunk dependency (F1).

**Roadmap.**

- A new "Carried review findings" section lists every deferred item: ID, owning chunk(s), what the spec must decide or verify.
- The legend defines the new marker.

**Skill.**

- **Step 2:** a "Spec must resolve" row. The spec must contain one section per listed item, saying how it is resolved or how it will be verified on the real PC.
- **Step 4:** the approval summary lists them.
- **Step 6:** a chunk can't be marked `Complete.` until each item is resolved and its verification is recorded.

A carried item can only be dropped by a decision-log row (Type `Technical`) that names it.

| Chunk | Spec must resolve |
| --- | --- |
| 1 | N-17 (Chunk-1 part), N-20 (Chunk-1 part) |
| 4 | N-12 |
| 5 | N-06; N-16 (scheduler-status table, governed or exempt) |
| 6 | N-16 (feed-depth measurement before Chunk 8: a minimal read-only fetch, or move the measurement to after Chunk 8) |
| 9 | N-07 |
| 11 | N-16 (the "already running" exit code before Chunk 24) |
| 14 | N-16 (sentinel check of the run log before 26.4) |
| 16 | N-16 (content-length data needs parsing) |
| 25 | N-16 (`incomplete (final)` defined in 30.1) |
| 26 | N-09, N-16 (task-status source), L-k |
| 27 | N-14 (manifest vs OD-05, cap before 27, rollback window), N-16 (manifest format) |
| 29 | N-03, N-04, N-10, N-13, N-14 (failed-folder read-only open), N-16 (needs Chunk 17), N-17, N-20, L-g, L-h |
| 30 | N-10, N-22 |
| 33 | N-08 |
| 35 | N-13 (recovery procedure in OPERATIONS) |

## 5. Small documentation consistency fixes (no product effect; David may drop them)

- **L-a:** remove `--force` from ARCHITECTURE:81.
- **L-b:** complete the CLAUDE.md command list.
- **L-c:** Chunk 16 completes once the decision is logged **and** A-06 is confirmed.
- **L-d:** legend rule: Status moves from `Blocked — awaiting …` to `Not started.` when every listed OD is resolved.
- **L-e:** covered in N-02, task 1.1.
- **L-i:** scope the CLAUDE "no outbound requests" rule to the app at run time. Tooling downloads and feed checks are governed by their own go-aheads.
- **L-j:** "How to use it": enabling approved sources is a small commit after OD-03, deployed with `live:update` (go-ahead).
- **L-l:** provenance note: the earlier reviews were AI subagents on the same provider as this session.
- **L-m:** "mark a chunk `[x]`" becomes "set Status to `Complete.`" in CLAUDE.md and the Definition of done.
- **L-f:** left as is. The "waiting for BL-01" wording is a known frozen state, updated on `chunk-01-toolchain` after BL-01.

## 5a. Corrections from the independent review of this plan (r4.1)

Each item below is a text edit included in r4. None makes a product decision.

### Retention and the live guard

- **F3 — where the guard sits and when it is built.**
  - The `retention_inactive` guard sits in the run flow after the lock and the run-record creation, before sources and fetching.
  - It ships in the collector no later than 29.1, with a committed config default of **inactive**, so no live-checkout run can collect before it exists.
  - 29.3 records, per run mode, a **network probe that collects nothing** (a HEAD request to a fixed approved host, defined in the Chunk 29 spec), so OD-10 can be decided without active retention.
  - 29.5's lock check uses a manual run in the **development** folder against its development database, while the test task runs in the live checkout.
  - The consequence list adds: "Chunk 29 itself does not wait for retention".
- **F6 — what "retention is active" means in code.** A committed config value: `retention.rule` (empty until OD-04 and OD-05 are resolved) plus `retention.active` (false). Only a commit that David approves after Chunk 27 is `Complete.`, deployed with `live:update`, may set `active: true`.
  - At run time the guard checks the config, that the retention module is present, and condition 5.
  - The owning task is new text in 27.3 (code and test). The switch itself is a go-ahead in Chunk 29 or later.
- **F5 — matching the rest of the documents to condition 5** (condition 5 is David's own requirement).
  - In the live checkout, cleanup runs **before** collection; 27.3 and the ARCHITECTURE run flow are edited to match.
  - The refusal records `retention_cleanup_failed`, exits with a non-zero code and never marks a week complete.
  - Whether "cleanup" includes the file and backup steps is **a question for David** (decision D-2 below).
- **F16 — `retention_inactive` and `retention_cleanup_failed` added everywhere statuses are listed:** the ARCHITECTURE status list and exit codes, AD-27, 5.3 CHECK values, 11.1, and the 26.1 tests.

### Gates and dependencies

- **F8 — the start gate and the diff check after the baseline commit.**
  - Skill Step 2 "Roadmap start" applies only while no baseline commit exists; after that it checks `git diff <baseline-commit>`.
  - The 1.5 allow-list names exactly what may change: Chunk 1's Status and summary lines, and the "waiting for BL-01" wording in README.md and CLAUDE.md (L-f).
  - The check runs before Step 7.
- **F12 — N-08 belongs earlier.** It is added to the "Spec must resolve" lines of Chunks 11 and 29 (refused runs are first written in 11.3), as well as 33.
- **F13 — task 26.2.** Its `incomplete (final)` dependency is added to row 26 of the table.
- **F14 — the hint gets its own ID.** The "expires soon" hint becomes **OD-16** (Pending), separate from OD-05 (bookmark deletion). It is added to the OD table, the decisions-blocking table, R-13 and task 27.5. Verification checks that OD-01 through OD-19 are all Pending.
- **F15 — live checks before a merge.** "Live checks need code that isn't on `main` yet" is added to Chunk 29's and 30's "Spec must resolve".
- **F17 — dropping a carried item and completion rules.**
  - A new decision-log Type, `Carried finding` (N-xx), so a carried item can only be dropped by a logged row.
  - The Definition of done gains "all Spec must resolve items resolved and verified".
  - The skill's completion rule moves to Step 7.2, where the Status is set.

### Line endings and baseline

- **F9 — byte-exact conversion and hashing.**
  - Convert line endings byte-exactly with Git Bash `sed -i 's/\r$//'`, never with a PowerShell write cmdlet.
  - Verify: new size = old size − carriage-return count; no BOM; 0 carriage returns.
  - The 1.1 blob check uses Git Bash `git cat-file blob <commit>:<file> | sha256sum`.
  - Dry-run it on copies in the scratchpad first.
- **F22 — keeping LF after linting.** Lint **before** the LF conversion. After converting, re-check for 0 carriage returns without opening the files in the editor.
- **F21 — the baseline commit's contents.** The first commit includes the Chunk 1 spec and plan under `docs/superpowers/` (state this explicitly). Those files aren't in the six-file hash set.

### Chunk 1 toolchain

- **F10 — added to Chunk 1's "Spec must resolve" (N-17).**
  - Whether to set `packageManager` at all, given the Corepack shim.
  - How to get the Yarn release file.
  - `COREPACK_ENABLE_AUTO_PIN=0` and `YARN_ENABLE_TELEMETRY=0` for bootstrap commands.
  - Write `.yarnrc.yml` first.
  - Verify with `where yarn`, `corepack --version` and `yarn -v` in a fresh shell.
- **F11 — scaffold side effects, in task 1.2.**
  - Use `--disable-git` and `--yes`, with `NEXT_TELEMETRY_DISABLED=1` set during the scaffold.
  - Never copy `.git/`.
  - Prefer a per-project telemetry setting; `next telemetry disable` writes a per-user file.
  - Listing what `next build` and `next dev` rewrite (`tsconfig.json`, `next-env.d.ts`) is part of N-20.

### Labels and wording

- **F18 — the full list of moved terms.** Also moved into ARCHITECTURE:
  - the bounded wait for a running collection;
  - `wal_checkpoint(TRUNCATE)` with refusal on non-zero `busy` or a non-empty WAL;
  - the `failed-<ts>/` rollback steps;
  - "unverifiable";
  - "no deletion of expired rows inside backups";
  - re-checking backups made with `retention_active: false`;
  - how the deployment detects that the dashboard is stopped;
  - "Task Scheduler not modified".

  Verification greps for each of these terms in ARCHITECTURE.
- **F19 — "not a product decision" also appears in REQUIREMENTS.md:169.** That line is reworded too.
- **F20 — what interim behaviour means.**
  - OD-06 and OD-11 interim behaviour means "no code choosing an option", **not** a choice of OD-11 option (a).
  - "Development-only" means never merged into `main`, or deployed, while the OD is unresolved.
- **F23 — catch-up start date.** N-22's text names "the date retention became active, or the first week with enabled sources" as a **candidate** starting point for catch-up, for David to decide (D-3).

### Decisions this review raises for David (not decided; options only)

- **D-1 = OD-17 (F4): real-source data before retention exists.** Chunk 11's real-source check, and 32.3 if run in development, would store real articles in a database without retention. Options:
  - (a) Before Chunk 27, real-source checks use `--dry-run` only.
  - (b) They use a temporary database that is deleted after the check.
  - (c) The `retention_inactive` guard applies to **any** database that would hold real-source articles.

  Recommendation: (b) for Chunk 11, plus naming the database for 32.3 explicitly. Until D-1 is decided, both tasks are marked "needs D-1".
- **D-2 = OD-18 (F5): what "retention cleanup must succeed" covers.** Options:
  - (a) Only the database expired-row check.
  - (b) Database rows, log files and backups.

  With (b), a locked backup file stops weekly collection until it is fixed, and needs the N-13 recovery path. Recommendation: none; it changes how strict FR-DATA-04 is in practice.
- **D-3 = OD-19 (F23, N-22): catch-up start date.** Options:
  - (a) Backfill up to 4 weeks on the first active run.
  - (b) Start from the first week after retention becomes active.

  Recommendation: none.

D-1, D-2 and D-3 are added to REQUIREMENTS as Pending OD-17, OD-18 and OD-19, owned by Chunks 11/32, 27/29 and 30.

## 6. Verification after applying r4 (read-only checks)

In addition to the checks below:

- OD-01…OD-19 are all Pending.
- Every term from F16 and F18 appears in the named files.
- No Dependencies line contains "Spec must resolve" or a later chunk number.

- **Roadmap structure:**
  - 36 chunks, every field present;
  - task count = 130 (Chunk 1 still has 5 tasks, no tasks added or removed elsewhere);
  - unique IDs, 1–5 per chunk;
  - no dependency pointing forward;
  - the ⛔ set is still 12, 27, 28, 31, 32.
- **Gates:**
  - "Spec must resolve" lines match the table above;
  - every deferred N-xx appears in at least one owning chunk.
- **Requirements:**
  - 70 requirement IDs, all traced;
  - OD-01 through OD-19 are all Pending;
  - A-01 through A-06 are all Pending;
  - BL-01 is not approved;
  - D-1, D-2 and D-3 appear in REQUIREMENTS as OD-17, OD-18 and OD-19 respectively;
  - decision log has only the placeholder row;
  - no `docs/BASELINE.md`.
- **Searches:**
  - `retention_inactive` appears consistently in ARCHITECTURE, roadmap, CLAUDE and the skill;
  - `yarn verify` is defined before its first use;
  - every former r3-record-only term is now in ARCHITECTURE;
  - no "not a product decision" wording remains.
- **Line endings:** 0 lines with a carriage return in any Markdown file.
- **Lint:** markdownlint via `code -r` and IDE diagnostics. Every file must show it was analysed (a line count).
- **Dry read of Chunk 1 against the skill:** nothing writes to the six files before 1.1's hash check.
- **Then stop:** no Chunk 1, no BL-01.
