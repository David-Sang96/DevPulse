# DevPulse: Chunked Implementation Roadmap

**Source:** [REQUIREMENTS.md](REQUIREMENTS.md) and [ARCHITECTURE.md](ARCHITECTURE.md). Every chunk traces back to requirement IDs; see [Requirement traceability](#requirement-traceability).

**This is a backlog, not an implementation plan.** Before a chunk starts, it gets its own short spec and then a plan, under `docs/superpowers/specs/` and `docs/superpowers/plans/`. The rule is spec, then plan, then code. This file records *what* to build and *in what order*. The chunk's plan records *how*.

## Progress summary

| Item | Value |
| --- | --- |
| Total phases | 10 |
| Total chunks | 36 |
| Completed chunks | 2 |
| In-progress chunks | 0 |
| Blocked chunks (⛔) | 5 (Chunks 12, 27, 28, 31, 32) |
| Remaining chunks | 34 |
| Last updated | 2026-11-06 |

- **Revision:** r4 (2026-11-03), applying the independent review of r3.
- **Roadmap start:** BL-01 approved by David on 2026-11-03 (see the [REQUIREMENTS decision log](REQUIREMENTS.md#decision-log)); Chunk 1 is complete and merged into `main` (merge commit 1dc014d).
- **Chunk 2:** complete on the branch `chunk-02-quality-tooling`, which is not merged; merging into `main` needs David's explicit approval. David's manual verification is recorded in the Chunk 2 note below.
- **Article simplification:** incomplete until OD-01 is approved and Chunk 32 is verified. The `none` and `fake` providers do not count.
- **Live collection:** nothing is collected in the live checkout until retention is active: OD-04 and OD-05 resolved, and Chunk 27 complete, verified and deployed (AD-32). Real use can't begin before then, and Chunks 30, 33, 34, 35 and 36 can't complete before then. Chunk 29 itself doesn't wait for retention.
- **Open decisions:** OD-01…OD-19 and assumptions A-01…A-06 are all Pending.

## Legend

### Status markers

Task checkboxes use these markers:

| Marker | Meaning |
| --- | --- |
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Completed: meets the [Definition of done](#definition-of-done) |
| `[!]` | Blocked |

Each chunk's `**Status:**` line uses exactly one of these values, so that a session can check it reliably: `Not started.`, `In progress.`, `Blocked — awaiting <IDs>.`, `Complete.` or `Skipped (OD-NN).`

A dependency is **satisfied** when that chunk's Status is `Complete.`, or `Skipped (OD-NN).` with that OD resolved as declined in the decision log. Only the leading list of chunk numbers on a Dependencies line counts as dependencies.

A chunk's Status moves from `Blocked — awaiting <IDs>.` to `Not started.` once every listed decision is resolved. A chunk's Status is set to `Complete.` only when it meets the [Definition of done](#definition-of-done).

### Gate markers

| Marker | Meaning |
| --- | --- |
| ⛔ in a chunk heading | Do not start until David's decision is *resolved* in the REQUIREMENTS decision log. This follows the Decision status rule in `.claude/skills/chunk-workflow/SKILL.md`: a recommendation, a Proposed entry or a Deferred entry does not count. Used only when the decision changes what is built, or whether it is built, or when it involves cost, privacy, irreversible deletion or a significant change to the architecture. ⛔ chunks count as Blocked. The ODs are named on the Dependencies line. |
| `Decision before completion: OD-NN` | The chunk may start. Its Proposed default lives in one place, and David's decision must be resolved before the chunk's Status is set to `Complete.`. Where a task needs it earlier, the line says so ("needed before task N.M"). |
| `Confirm before completion: A-NN` | The chunk may start, but it builds on an assumption, so the assumption must be confirmed in the decision log before the chunk's Status is set to `Complete.`. |
| `Chunk NN Complete needed before task N.M` | A task-level condition on the Dependencies line. It stops only the named tasks, never the start of the chunk. |
| `**Spec must resolve:**` line | Its own line, directly after the Dependencies line, listing carried review findings (see [Carried review findings](#carried-review-findings)). The chunk's spec must contain one section per item, saying how it is resolved or verified. The chunk can't be `Complete.` until each is resolved and its verification recorded. It is never a chunk dependency. |
| `Decision preparation (no application code)` | The chunk prepares a decision for David. It is never counted as Blocked. |
| **Go-ahead at execution time** | Stop and ask David for explicit approval right before doing the task. |

### Difficulty

Easy, Intermediate or Advanced.

## Gates

| Gate type | Chunks | Why |
| --- | --- | --- |
| ⛔ Blocked until decided | 12 (OD-03), 27 (OD-04, OD-05 bookmark deletion), 28 (OD-07), 31 (OD-01, OD-02), 32 (OD-01) | **12:** the chosen API, and its terms, define the whole chunk. **27:** deletion cannot be undone. **28:** an optional product feature that would let the dashboard start processes. **31 and 32:** cost, and article content leaving the PC. |
| Decision before completion | 9 (OD-11), 11 (OD-17, needed before the real-source check), 13 and 21 (OD-08), 18 (OD-06), 22 (OD-14), 27 (OD-18), 29 (OD-10, OD-12, OD-13 needed before task 29.4; OD-18), 30 (OD-03 needed before tasks 30.3–30.5; OD-09, OD-11, OD-19), 32 (OD-17, needed before task 32.3), 36 (OD-03, needed before task 36.2) | Each decision changes only a value, a single switch, or whether a later task runs, and its default lives in one place. |
| Task-level chunk condition | 30 (Chunk 27 Complete needed before tasks 30.3–30.5) | Live collection needs active retention (AD-32). |
| Spec must resolve | 1, 4, 5, 6, 9, 11, 14, 16, 25, 26, 27, 29, 30, 33, 35 | Carried review findings; see [Carried review findings](#carried-review-findings). |
| Hint decision | 27.5 (OD-16) | Gates only the optional "expires soon" hint; never Chunk 27, retention or collection. |
| Confirm before completion | 5 and 22 (A-03), 6 (A-05), 7, 9, 23 and 30 (A-01), 10 (A-02), 16 and 34 (A-06), 17 (A-04) | These chunks build on assumptions that are not yet confirmed. |
| Decision preparation | Chunk 16 (OD-01, OD-02); task 6.3 (OD-03 candidates and feed depth) | Prepares the decision and writes no application code. Never counted as Blocked. Chunk 16 can be done early, any time after Chunk 6. |
| Go-ahead at execution time | 6.3 (feed-depth fetches); real-network manual checks in 8, 9, 11, 12; 29.1–29.5; 30.3–30.5; 32.3; 36.2–36.3; every merge into `main`; every live update; switching retention to active | Actions that use real sources, change David's PC or the live checkout, interrupt the PC or its network, or call a paid service. |
| Optional or conditional | 28 (optional), 12 (only if David approves an API source), 27.5 and 31.4 (only if their OD says so) | Skipped when David decides so. A skipped chunk leaves the Remaining count. |
| Chain to the final chunk | 36 depends on 27 and 32 | Final integration needs every confirmed requirement. This is the only unblocked chunk that waits on ⛔ chunks. If David declines OD-01, Chunk 32 is `Skipped (OD-01)` and still satisfies the dependency. |

## How to use it

- **Approval:** the roadmap starts only after BL-01 is resolved in the decision log.
- **One chunk at a time:** each chunk gets its own branch, `chunk-NN-slug`, made from `main`. A chunk has 1–5 tasks. Chunk 1 is the exception: it creates `main` with the baseline commit first, then continues on `chunk-01-toolchain`.
- **Commits and merges:** commits are local only, made on the chunk branch after verification, as part of the approved plan. Merging into `main` always needs David's explicit approval at the time. The repository has one remote, `origin` (`https://github.com/David-Sang96/DevPulse.git`), but that authorizes no push or other remote operation: nothing is pushed without David's explicit approval, and the remote is not added to, changed or removed without it.
- **Live checkout:** scheduled runs and real use run only from the live checkout, updated with `yarn live:update` after David's go-ahead (see ARCHITECTURE, "Live checkout and deployment"). Development never uses the live database. In the live checkout nothing is collected until retention is active (AD-32).
- **Enabling sources:** after OD-03 is resolved, enabling the approved sources is a small commit, deployed with `yarn live:update` after David's go-ahead.
- **No silent reopening:** a completed chunk is never reopened silently. If a later decision changes what a completed chunk built, a follow-up task is added to the chunk that the decision gates (for example 31.4 for OD-02), and the change log records it.
- **Carried review findings:** a chunk's `**Spec must resolve:**` items must each be resolved in its spec and verified before the chunk is `Complete.`. They can only be dropped through a decision-log row of Type `Carried finding`.
- **Code review:** follows OD-15. Until it is resolved, the review is a structured self-review, labelled as not independent, and no implementer or reviewer subagents are dispatched.
- **Test first:** each task names the test to write before the code.
- **Dependencies, not importance:** each chunk uses only what earlier chunks built.
- **Ticking a task:** write its commit hash next to it, for example `- [x] **4.2** (abc1234) …`.
- **Manual-verification note:** after each chunk, add an italic note under Manual verification. Record what was checked by hand, on which date, and what was *not* checked.
- **⛔ chunks:** never start one before its decision is resolved in the [REQUIREMENTS decision log](REQUIREMENTS.md#decision-log), as the Decision status rule defines it.
- **Decision before completion:** never set the chunk's Status to `Complete.` before that decision is resolved.
- **Approving the planning documents** approves the planning baseline and lets Chunk 1 start, nothing more. It confirms no assumption, approves no Proposed item and resolves no open decision.
- **Scheduling proof rule:**
  - Unit tests in Chunks 7, 29 and 30 prove date maths and the generated task definition only. They never count as proof that scheduling works.
  - Chunks 29, 30 and 36 are complete only with real Windows checks recorded on David's PC: the date, the command run and its real output.
- **Explicit approval rule:** stop and ask David for explicit approval before any of these:
  - changing Windows settings, including the timezone;
  - registering or modifying scheduled tasks;
  - running tests that interrupt the PC or the network, such as sleep, shutdown or disconnecting the network.
- **Simplification honesty:** output from the `fake` provider is test data. Real simplification is incomplete until OD-01 is approved and Chunk 32 is verified.
- **Skipped chunks:** a chunk that David's decision skips is marked "Skipped (OD-NN)" and removed from Remaining.
- **Keeping the summary current:** update the progress summary whenever any status changes.

### Usage rules

1. Work on one chunk at a time.
2. Respect chunk dependencies.
3. Create a dedicated specification before implementation.
4. Create an implementation plan before coding.
5. Write tests before implementation.
6. Implement only the current chunk's approved scope.
7. Run tests and type checks.
8. Review changes.
9. Update the roadmap.
10. Update documentation.
11. Stop and ask David when a product decision or approval is required.

## Definition of done

A chunk's Status is set to `Complete.` only when all of these are true:

1. Implementation is complete.
2. The relevant tests pass.
3. TypeScript checks pass.
4. The acceptance criteria are satisfied.
5. The required manual verification is complete and recorded.
6. Documentation is updated where necessary.
7. Any "Decision before completion" is resolved, and any "Confirm before completion" assumption is confirmed, in the decision log, per the Decision status rule.
8. Scheduling chunks (29, 30, 36) have real Windows evidence recorded.
9. Every `**Spec must resolve:**` item is resolved in the spec and its verification is recorded.

Unverified work is never marked complete.

## Phase overview

| Phase | Chunks | Difficulty | Delivers |
| --- | --- | --- | --- |
| 1 — Project Foundation | 1–3 | Easy | Repository, toolchain, quality tools, app structure |
| 2 — Database Foundation | 4–5 | Easy → Intermediate | SQLite, Drizzle, schema, migrations |
| 3 — News Collection Pipeline | 6–12 | Easy → Intermediate | Sources, fetching, validation, deduplication, storage, a working `news:sync` |
| 4 — Simplification Framework | 13–16 | Intermediate | Provider interface, `none`/`fake` providers, retries, AI provider decision preparation |
| 5 — Dashboard Core | 17–19 | Easy → Intermediate | Layout, latest articles, article details |
| 6 — Dashboard Features | 20–23 | Intermediate | Search, filters, categories, technologies, bookmarks, read state, archive |
| 7 — Collection Operations and Retention | 24–28 | Intermediate → Advanced | Run lock, manual commands, status page, retention, optional dashboard trigger |
| 8 — Background Automation | 29–30 | Advanced | Task Scheduler and missed-run recovery, verified on real Windows |
| 9 — AI Provider Integration | 31–32 | Advanced | Real simplification with the approved provider |
| 10 — Reliability, Testing and Release Readiness | 33–36 | Intermediate → Advanced | Hardening, complete tests, documentation, final verification |

Difficulty rises phase by phase. The easier chunks inside later phases (6, 16 and 17) each open a new area.

---

## Phase 1 — Project Foundation

### Chunk 1 — Repository and toolchain initialization

**Goal:** A local git repository whose first commit is the approved planning baseline, a pinned and private Node.js and Yarn toolchain, and a Next.js app scaffolded into the existing folder without touching the baseline files.

**Difficulty:** Easy

**Dependencies:** None. The roadmap starts only after BL-01 is resolved in the decision log.

**Spec must resolve:** N-17 (Chunk 1 part: whether to set `packageManager` given the Corepack shim, how to get the Yarn release file, `COREPACK_ENABLE_AUTO_PIN=0` and `YARN_ENABLE_TELEMETRY=0` for bootstrap commands, writing `.yarnrc.yml` first, and verifying with `where yarn`, `corepack --version` and `yarn -v` in a fresh shell), N-20 (Chunk 1 part: which files install, build and dev rewrite, such as `tsconfig.json` and `next-env.d.ts`, and the ignore set that keeps `git status --porcelain` clean).

**Order:** task 1.1 runs before anything else writes to the six baseline files, including the roadmap's own Status line. The skill (Step 5) sets this chunk's Status to `In progress.` only after the baseline commit, on `chunk-01-toolchain`.

- [x] **1.1** (1121f49, c21abe3) Pre-flight and baseline commit.
  - Check that BL-01 is resolved and that the six baseline files still match the hashes in `docs/BASELINE.md`.
  - Run `git init -b main`, with no remote (AD-20).
  - Add `.gitattributes` (`* text=auto eol=lf`) and `.editorconfig` (`end_of_line = lf`).
  - Add `.gitignore` covering: `node_modules/`, `.next/`, `data/`; `.env*` with `!.env.example`; Playwright output; and the Yarn Berry entries (`.yarn/*` with exceptions for `releases`, `patches`, `plugins`, `sdks` and `versions`, plus `.pnp.*`).
  - Make the first commit on `main`. It contains exactly the six baseline files, `docs/BASELINE.md`, `docs/superpowers/` (including the Chunk 1 spec and plan), `.claude/skills/` and these three files.
  - Check each committed baseline file against its recorded hash with Git Bash `git cat-file blob <commit>:<file> | sha256sum`.
  - Create `chunk-01-toolchain`, and append the commit hash to `docs/BASELINE.md` on that branch.
  - Test: before committing, the hashes match; after committing, every committed baseline blob matches its recorded hash; a dummy file in `data/` and a `.env.local` don't appear as untracked, while a `.env.example` does.
  - Acceptance: `git log` shows the baseline commit first, `git remote -v` prints nothing, and `docs/BASELINE.md` records the commit hash on `chunk-01-toolchain`.

- [x] **1.2** (d7ae49a, db17ee9) Scaffold outside the repository, privacy first.
  - Run `create-next-app` non-interactively (`--yes`, `--disable-git`, `--skip-install`, with `NEXT_TELEMETRY_DISABLED=1` set) in a temporary folder **outside** the repository: TypeScript, Tailwind CSS v4, ESLint, App Router, a `src/` directory and the `@/*` alias.
  - Before merging, list every emitted file. Remove `next/font/google` (use system or local fonts). Drop the scaffold's README, and any `AGENTS.md`, `CLAUDE.md` or `.yarnrc.yml`.
  - Merge rule: copy only files that don't already exist; never copy `.git/`; **never overwrite a tracked file**; merge `.gitignore` and `package.json` by hand. The package name is `devpulse`.
  - No install and no build in this task.
  - Test: the list of emitted files is recorded; no tracked file changed (`git status` shows only additions plus the hand-merged `.gitignore`); no `next/font/google` remains.
  - Acceptance: `package.json` is named `devpulse`, `tsconfig.json` has `"strict": true`, Tailwind v4 is configured, and the `@/*` alias is set.

- [x] **1.3** (d9c7d9c, 8f619d8) Pin the toolchain, now that `package.json` exists.
  - Pin the exact Node.js version (AD-18; the PC currently has 24.13.0) in `engines`, and in `.nvmrc` as documentation only.
  - Add a plain-JavaScript version check, `scripts/check-node.mjs`, so it runs without `tsx`.
  - Commit Yarn 4 as a release file (`yarnPath`), and set `packageManager` as the Chunk 1 spec decides (N-17).
  - Write `.yarnrc.yml` with `nodeLinker: node-modules` and `enableTelemetry: false`.
  - Test: the version check passes on the pinned version and fails with a clear message on any other; `node .yarn/releases/yarn-4.*.cjs -v` and `yarn -v`, in the repository in a fresh shell, report the committed release.
  - Acceptance: `yarn config get enableTelemetry` prints `false`, and no Corepack prompt or download happens.

- [x] **1.4** (bbbb1f5, 841a80e) Install, then privacy checks, then the first build.
  - Run `yarn install` with the committed release.
  - Disable Next.js telemetry for **every** Next.js invocation, including the bare CLI; the Chunk 1 spec picks and verifies a reliable method (AD-28, P-02). Prefer a per-project setting kept in the repository. `next telemetry disable` writes a per-user setting outside the project, so it is not assumed to be the project-level solution.
  - Bind dev and start to `127.0.0.1`.
  - Only then run `yarn build`.
  - Test: `yarn next telemetry status` reports disabled; a search of the source and build output finds no `next/font/google` and no font or telemetry hosts; `git status --porcelain` is clean after install and build.
  - Acceptance: the dev server is not reachable from another device.

- [x] **1.5** (f8a35ec) Run, and check the baseline is untouched.
  - Test: `yarn dev` serves the default page at `http://127.0.0.1:3000` with no console errors. Before the skill's Step 7, `git diff <baseline-commit> -- <six baseline files>` shows changes only to: Chunk 1's Status and progress-summary lines in the roadmap, and the "waiting for BL-01" status wording in README.md and CLAUDE.md.
  - Acceptance: everything after the baseline commit is on `chunk-01-toolchain`, ready for David's approval to merge.

**Manual verification:** Open the default page in a browser. In a fresh terminal, check the pinned versions and that telemetry is off.

*2026-11-04. Checked by hand: David opened `http://127.0.0.1:3000` while `yarn dev` ran, and the browser console showed no red errors. In a new terminal of David's own: `where yarn` listed the Corepack shim first and the global Yarn 1.22.22 second; `node -v` printed `v24.13.0`; `yarn -v` printed `4.12.0`; `yarn config get enableTelemetry` printed `false`; `yarn next telemetry status` reported Disabled. The assistant recorded that `yarn dev` and `yarn start` each served HTTP 200 on `127.0.0.1:3000`, and found 0 external established connections in point-in-time snapshots.*

*Not checked: reachability from another device was not independently tested. David accepted the loopback evidence for 1.4: `--hostname 127.0.0.1`, the server logs, only `127.0.0.1:3000` socket entries, and no wildcard or IPv6 listener. Windows reported the listener's state unreliably (`Get-NetTCPConnection` and `netstat` showed it as missing, `FIN_WAIT_1` or `CLOSED`). 76 lockfile entries have no checksum, including the five installed Windows binaries, so their integrity is unverified. The D3 temporary evidence (scaffold, fixtures, Yarn tarball) was lost outside the session. No OS-level network capture was performed. The Phase 1 install's console output was lost. The review was a self-review, not independent (OD-15 Pending).*

*N-17 evidence: `packageManager` is `yarn@4.12.0`; `.yarnrc.yml` (with `yarnPath`) was written before any `yarn` command; the bootstrap variables were set per command; `corepack --version` printed 0.34.5; `node .yarn/releases/yarn-4.12.0.cjs -v` printed `4.12.0`; `yarn config get yarnPath` printed the committed release's path; `node .yarn/releases/yarn-4.12.0.cjs install --immutable` passed; `COREPACK_ENABLE_NETWORK=0 yarn -v` printed `4.12.0`; nothing was auto-pinned. The process tree for `yarn dev` showed Corepack's cached `yarn.js` running the script directly, with no separate process for the committed release. The two files are byte-identical (SHA-256 `1fe4e119…1702`). The `npm_execpath` check was replaced by the checks above (decision F3). It is not claimed that the committed release ran through `yarnPath`.*

*N-20 evidence: the final ignore set is the Task 1 set plus the scaffold's own entries and `!.env.yarn`. Install and build created `yarn.lock` (committed, LF) and `.yarn/install-state.gz`, `node_modules/`, `.next/`, `next-env.d.ts` and `tsconfig.tsbuildinfo` (all ignored). The build did not rewrite `tsconfig.json`. `next dev` generated `AGENTS.md` in an AI-agent session until `agentRules: false` was set (decision F5). After a second install, build and dev, `git status --porcelain` printed nothing.*

**Status:** Complete.

### Chunk 2 — Quality tooling and test runners

**Goal:** The lint, format, type-check, unit-test and end-to-end-test commands that every later chunk uses.

**Difficulty:** Easy

**Dependencies:** 1

- [x] **2.1** (7ec2ca1, b6b64ac, f1bac66) Add Prettier and the scripts `lint`, `format`, `format:check`, `typecheck` (`next typegen && tsc --noEmit`) and `lint:md` (markdownlint-cli2, a Proposed supporting library under AD-17) for the docs.
  - Test: a deliberate type error makes `yarn typecheck` fail, and a deliberate markdown error makes `yarn lint:md` fail; removing them makes both pass.
  - Acceptance: `yarn lint`, `yarn lint:md`, `yarn format:check` and `yarn typecheck` all exit with code 0 on the clean repository.

- [x] **2.2** (6c75c0a, a60c907) Configure Vitest (node environment, `@/*` alias) with one sample test, run by `yarn test`. Timezone-specific test runs are defined as Vitest projects that set `TZ` in the config, not in the shell, so they work in PowerShell and cmd.
  - Test: the sample test fails when its assertion is inverted and passes when it is restored.
  - Acceptance: `yarn test` exits with code 0.

- [x] **2.3** (53ab420) Configure Playwright (Chromium only) with a smoke test of the home page, run by `yarn test:e2e`.
  - Test: the smoke test opens the home page and checks the page title.
  - Acceptance: `yarn test:e2e` exits with code 0 locally.

- [x] **2.4** (6d412cb) Add `yarn check`, which runs the Node version check, typecheck, lint, `lint:md` and the unit tests, in that order; and `yarn verify`, which runs `yarn check` and then `yarn test:e2e`.
  - Test: a lint error makes `yarn check` fail, and a failing end-to-end test makes `yarn verify` fail.
  - Acceptance: `yarn check` and `yarn verify` exit with code 0 on the clean repository.

**Manual verification:** Run each command once in a fresh terminal and read the output.

*2026-11-06. Automated checks, run by the assistant on David's PC (Windows 11, Node.js 24.13.0, Yarn 4.12.0, Google Chrome 156.0.8078.80, Playwright 1.64.1). This is not David's manual verification. `yarn check` (the Node version check, `typecheck`, `lint`, `lint:md`, then 3 Vitest tests in two projects), `yarn verify` (the same, then 1 Playwright test), `yarn format:check` and `yarn build` each exited 0, and `git status --porcelain` was clean afterwards. During the tasks, `yarn test` and `yarn check` also exited 0 both directly in PowerShell and through `cmd /c`. Each task has failing-first evidence: a missing script, an unresolved `@/` alias, a missing base URL, a deliberate type error, markdown error or lint error, an inverted assertion and a wrong page title each made the matching command fail, and removing them made it pass.*

*As built: Prettier (`yarn format`, `yarn format:check`) covers code and config only, and `.prettierignore` excludes Markdown, `.yarn/`, `yarn.lock`, `public/` and `.claude/`. markdownlint (`yarn lint:md`) covers every Markdown file, with line length (MD013) off and one inline MD038 exception on two lines of the planning-r2 plan (AD-43). `yarn typecheck` is `next typegen && tsc --noEmit` (AD-39), so it also works on a clean checkout. Vitest has two projects: `unit` runs `src/**/*.test.ts` in `UTC`, and `tz-kuala-lumpur` runs `src/**/*.tz.test.ts` in `Asia/Kuala_Lumpur`, with `TZ` set in `vitest.config.mts` and never in the shell. A permanent test, `src/vitest-unit-time-zone.test.ts`, checks that the `unit` project sees `process.env.TZ` equal to `UTC` and a UTC offset of 0. Playwright runs one Chromium project in the installed Google Chrome (`channel: "chrome"`, AD-42), against the production app, which it builds and serves on `127.0.0.1:3100` without reusing an existing server. No browser was downloaded on this PC.*

*2026-11-06. Manual verification by David, in a fresh terminal of his own: Windows 11 (build 26300.9818), Git Bash (MINGW64), Node.js 24.13.0 and Google Chrome 156.0.8078.80 (Official Build, 64-bit). All nine commands of the spec's section 7 passed: (1) `yarn typecheck`; (2) `yarn lint`; (3) `yarn lint:md`, with 14 Markdown files and 0 issues; (4) `yarn format:check`; (5) `yarn test`, with 3 test files and 3 tests; (6) `MSYS_NO_PATHCONV=1 cmd.exe /d /c "yarn.cmd test"`, which runs the tests under cmd.exe, with 3 test files, 3 tests and exit code 0; (7) `yarn test:e2e`, with 1 Playwright test in the Chromium project, which the config runs in the installed Chrome; (8) `yarn check`; (9) `yarn verify`, which ran all the checks and the 1 Playwright test. Only the cmd.exe run came with an explicit exit code. The other eight are recorded as passed, and no further output is kept here. David ran the commands in Git Bash, not in PowerShell as the spec's section 7 planned.*

*Not checked: David's own manual run did not use PowerShell directly. PowerShell was covered only by the assistant's automated runs above. Nothing was checked on another operating system, with a later Chrome version, or with Playwright's own Chromium. The self-review was not independent (OD-15 Pending). It found no defect to fix. Two observations remain open: the smoke test runs without a seeded database, because none exists yet (Chunks 4 and 18), and running `yarn test:e2e` while `yarn dev` is running was not tested (spec risk N6).*

*Known limitations, dependencies (recorded, not fixed): (1) Yarn prints the existing `YN0086` peer warning, because the peer requirement `pe0e3c6` is unmet: `@next/eslint-plugin-next` does not provide `eslint` to `@eslint-community/eslint-utils`. Chunk 1 already recorded it, and the Chunk 2 install did not introduce it. (2) 16 of the 124 lockfile entries added by the Chunk 2 install have no checksum, mainly the platform-specific `@rolldown/binding-*` packages. The Windows binary installed on this PC is `@rolldown/binding-win32-x64-msvc@1.2.16`. Its integrity is not recorded in `yarn.lock`, and its authenticity has not been verified.*

*Known limitations, environment: (3) Chrome 156.0.8078.80 launched successfully with Playwright 1.64.1 on this PC, but later Chrome updates and other operating systems are unverified. (4) Time-zone behaviour was tested on this Windows PC only; other operating systems are unverified. This PC's own zone already resolves to `Asia/Kuala_Lumpur`, so the committed Kuala Lumpur test also passes without any configuration. (5) The permanent UTC test verifies the `unit` project's UTC setting, and a temporary mutation check that was not committed showed that the Kuala Lumpur project's `TZ` setting also takes effect. (6) Automated test success does not prove Windows Task Scheduler behaviour or any future collection workflow.*

**Status:** Complete.

### Chunk 3 — Application structure and shared foundations

**Goal:** The agreed folder layout, a validated config module, a runnable `yarn news:sync` stub that does not depend on Next.js, and shadcn/ui set up.

**Difficulty:** Easy

**Dependencies:** 2

- [ ] **3.1** Add `src/lib/config/env.ts`. It is validated with zod and holds the database path (default `data/devpulse.dev.db`), the log directory and the simplification provider name (default `none`). Command-line scripts load `.env.local` explicitly, because `tsx` doesn't; a committed `.env.example` lists every variable without values.
  - Test: unit tests show that a valid config parses; that an unknown provider name or an empty path fails with a clear message; and that a value in `.env.local` reaches a script.
  - Acceptance: other modules read settings only through this module, and `.env.example` matches the schema.

- [ ] **3.2** Add a stub `scripts/news-sync.ts`, which `yarn news:sync` runs through `tsx`. Add an ESLint `no-restricted-imports` rule that stops `scripts/` and `src/lib/` from importing `next` or `next/*`.
  - Test: a temporary `import "next/server"` in `src/lib/` makes `yarn lint` fail.
  - Acceptance: `yarn news:sync` prints a start line and a finish line, and exits with code 0 while the Next.js server is stopped (FR-COL-03).

- [ ] **3.3** Initialize shadcn/ui (`components.json` and Tailwind v4 tokens) and render one Button on the home page.
  - Test: the Playwright smoke test finds the button.
  - Acceptance: `yarn build` passes with shadcn/ui installed.

- [ ] **3.4** Update the folder layout in ARCHITECTURE.md to match what now exists.
  - Test: none (documentation only).
  - Acceptance: every top-level folder in the repository appears in the documented layout.

**Manual verification:** Run `yarn news:sync` while `yarn dev` is not running. View the button in a browser.

**Status:** Not started.

---

## Phase 2 — Database Foundation

### Chunk 4 — SQLite and Drizzle setup

**Goal:** A working SQLite connection through Drizzle, migration tooling, and a test helper that gives each test file its own database.

**Difficulty:** Easy

**Dependencies:** 3

**Spec must resolve:** N-12 (the maintenance-marker exception: an in-process-only API requiring the marker's deploy ID and `pid == process.pid`, unreachable through a CLI flag or environment variable, import-restricted by a lint rule, with stale markers reported and never removed automatically, and tests showing that wrong IDs are refused); F2 jointly with Chunk 29 (the exception design must not rule out the deployment handoff Chunk 29 chooses).

- [ ] **4.1** Add `better-sqlite3` (AD-02), `drizzle-orm` and `drizzle-kit`. The Chunk 4 spec confirms the driver after checking that a Windows prebuilt binary exists for the exact pinned Node.js version, and records the alternatives.
  - Test: a unit test opens an in-memory database and runs `select 1`.
  - Acceptance: the native module installs and loads on David's PC without a local compiler.

- [ ] **4.2** Write `src/lib/db/client.ts`. It opens the configured file as a single connection per process (kept on `globalThis` so Next.js reloads don't open more), sets WAL mode, `foreign_keys=ON` and `busy_timeout`, and creates `data/` if it is missing. It refuses to open the database while `data/MAINTENANCE` exists (AD-30), except for the deployment's own connection, as specified in ARCHITECTURE "Mandatory requirements for later specs", and it refuses the live database path for seeding and the `fake` provider (AD-23).
  - Test: a unit test reads back the three settings, confirms that a missing `data/` folder gets created, that a second import reuses the connection, and that the maintenance marker and the live-path rules are enforced.
  - Acceptance: the collector and the dashboard both use this one client module.

- [ ] **4.3** Add `drizzle.config.ts`, the scripts `db:generate` and `db:migrate`, and `assertSchemaCurrent()`, which the collector and the dashboard call at startup (AD-24). Commit the generated migrations in `drizzle/`.
  - Test: `yarn db:migrate` succeeds on an empty file and changes nothing the second time; `assertSchemaCurrent()` refuses a database with a pending migration, with a message naming the command to run.
  - Acceptance: migrations are committed and applied in order, and no process runs against an out-of-date schema.

- [ ] **4.4** Write a test helper that creates a temporary database with all migrations applied, and deletes it afterwards. On Windows it closes the connection first and retries the deletion, including the `-wal` and `-shm` files.
  - Test: two test files that use the helper never see each other's rows, and no temporary database files are left behind.
  - Acceptance: database tests in later chunks use only this helper.

**Manual verification:** Run `yarn db:migrate`, then confirm that `data/devpulse.dev.db` and its `-wal` file appear after a write.

**Status:** Not started.

### Chunk 5 — Core schema and migrations

**Goal:** The tables every later chunk relies on, with constraints that enforce uniqueness, cascading deletes and the rule that original text is never stored.

**Difficulty:** Intermediate

**Dependencies:** 4. Confirm before completion: A-03.

**Spec must resolve:** N-06 (coverage stored per source **per week**, a week-state rule, how coverage combines across runs, and whether "every enabled source" means enabled at the time of the run); N-16 (a table for the scheduler status that `task:status` records in 29.2, classified as governed or exempt).

- [ ] **5.1** Define `articles` with its metadata, status, simplified fields, category, provider name, read and bookmark fields, `week_start` and retry fields. `canonical_url` is unique, and so is (`source_key`, `guid`).
  - Test: inserting a second row with the same canonical URL fails, and so does a second row with the same source key and GUID.
  - Acceptance: the columns match the data model in ARCHITECTURE, as finalized in the Chunk 5 spec.

- [ ] **5.2** Define `article_technologies` and `article_roles` with `ON DELETE CASCADE`. Do not add CHECK constraints on role or category values (AD-22).
  - Test: deleting an article deletes its technology and role rows.
  - Acceptance: a role value outside the proposed list can still be stored, because validating it is the application's job.

- [ ] **5.3** Define `collection_runs`, `collection_run_sources` and `job_lock`, with the run statuses, coverage fields and lock holders from ARCHITECTURE (AD-27).
  - Test: a run with source rows can be created and read back, and deleting the run deletes its source rows.
  - Acceptance: the run status (including `retention_inactive` and `retention_cleanup_failed`), coverage, trigger and lock-holder columns accept only their documented values.

- [ ] **5.4** Add indexes for the dashboard's queries (published date, week, status, difficulty, bookmark) and CHECK constraints on status and difficulty.
  - Test: an invalid difficulty value is rejected, and `EXPLAIN QUERY PLAN` for the latest-articles query uses an index.
  - Acceptance: the indexes are part of the migration.

- [ ] **5.5** Add a migration test and the governed-table list used by retention and backup expiry.
  - Test: an empty database migrates to the latest schema; a check of every table's column list shows no column for original text or HTML (FR-DATA-03); and every table is either in the governed list or explicitly exempt.
  - Acceptance: the test runs as part of `yarn test`, and adding a table without classifying it fails the test.

**Manual verification:** Read the generated migration SQL against the Chunk 5 spec.

**Status:** Not started.

---

## Phase 3 — News Collection Pipeline

### Chunk 6 — News source configuration

**Goal:** A typed, validated source list, and a list of candidate sources ready for David's OD-03 decision.

**Difficulty:** Easy

**Dependencies:** 3. Confirm before completion: A-05.

**Spec must resolve:** N-16 (task 6.3 measures feed depth before Chunk 8 builds fetching: either a minimal read-only fetch defined here, or the measurement moved to after Chunk 8).

- [ ] **6.1** Create `src/lib/config/sources.ts` with a zod schema. Each source has a key, a name, a type (`rss`, `atom` or `api`), a URL, a default category, an `enabled` flag and a note about its terms or permission.
  - Test: a valid entry parses; an entry with no URL, or with an unknown type, fails.
  - Acceptance: sources are read only through this module.

- [ ] **6.2** Validate the list when it loads: keys must be unique, URLs must be http(s), and every default category must be non-empty. Errors name the bad entry. Chunk 13 adds the check against the category list.
  - Test: duplicate keys and an `ftp://` URL each fail, with a message that names the entry.
  - Acceptance: `yarn news:sync` refuses to start with an invalid list.

- [ ] **6.3** Decision preparation for OD-03 (and data for OD-12). Add candidate sources, each with its name, feed URL, terms or permission note, and **feed depth** (item count and age of the oldest item, measured once with a read-only fetch), all with `enabled: false`. Present the list to David. David enables the approved ones later, and each change is logged in the REQUIREMENTS decision log.
  - Test: the candidate list loads, and every candidate has `enabled: false` and a feed-depth entry.
  - Acceptance: David has the candidate list, and nothing is enabled without a logged decision.

**Manual verification:** **Go-ahead at execution time** for the read-only feed-depth fetches. David reviews the candidate list, its terms notes and the feed depths.

**Status:** Not started.

### Chunk 7 — Timezone and week-window utilities

**Goal:** One tested module for every Malaysia-time (MYT) date calculation: the collection week, the week buckets and the schedule.

**Difficulty:** Intermediate

**Dependencies:** 2. Confirm before completion: A-01.

- [ ] **7.1** `previousWeekWindow(now)` returns `{ start, end }` as UTC instants, from Monday 00:00 MYT to the next Monday 00:00 MYT, with the end excluded (A-01).
  - Test: these cases give the expected window:
    - `now` at Monday 08:00 MYT returns the previous Monday to Sunday;
    - Sunday 23:59:59 MYT is inside the window, and Monday 00:00 MYT is outside it;
    - a window that spans New Year.
  - Acceptance: the results are identical in the Vitest projects for `UTC`, `Asia/Kuala_Lumpur` and `America/New_York`, whose `TZ` is set in the config.

- [ ] **7.2** Add `weekStartOf(date)` (the Monday of the date's MYT week), `latestScheduledRun(now)` and `nextScheduledRun(now)`. Scheduled runs are Mondays at 08:00 MYT.
  - Test:
    - at Monday 07:59 MYT, the next run is 08:00 the same day;
    - at Monday 08:00 MYT, it is the following Monday;
    - an instant that is still Sunday in UTC but already Monday in MYT belongs to the new MYT week.
  - Acceptance: no other module computes week boundaries itself.

- [ ] **7.3** Add helpers that format dates and times in MYT for display.
  - Test: a UTC instant formats as the expected MYT string under each test `TZ`.
  - Acceptance: these tests prove the date maths only. They are not proof that scheduling works (scheduling proof rule).

**Manual verification:** Read the test output. The real schedule is verified in Chunks 29, 30 and 36.

**Status:** Not started.

### Chunk 8 — RSS/Atom fetching

**Goal:** Fetch and parse each source safely, so that a failure in one source stays contained to that source.

**Difficulty:** Intermediate

**Dependencies:** 6

- [ ] **8.1** `fetchFeed()` uses a timeout, a maximum response size and a DevPulse User-Agent. It retries once on a network error or a 5xx response.
  - Test: with a mocked fetch, each of these produces its documented result: a timeout, a 404, a 500 followed by a 200, and an oversized body.
  - Acceptance: no request runs without a timeout.

- [ ] **8.2** Parse RSS and Atom into `RawFeedItem[]`, using the parser library chosen in the Chunk 8 spec (AD-16).
  - Test: fixtures cover RSS 2.0, Atom, an empty feed and malformed XML.
  - Acceptance: malformed XML becomes an error result, not a crash.

- [ ] **8.3** `collectSource()` returns either `{ ok: true, items }` or `{ ok: false, error }`, and never throws. Only enabled sources are passed to it.
  - Test: when one of three sources fails, the other two still return their items (FR-COL-06); a disabled source is never passed to a connector.
  - Acceptance: every error result has a readable reason.

- [ ] **8.4** Add a local fixture feed server for tests and manual checks: it serves synthetic RSS and Atom fixtures on `127.0.0.1`, including a full feed, an empty feed, a feed whose oldest item is inside the week, and a failing endpoint.
  - Test: the server starts and stops inside a test and serves each fixture.
  - Acceptance: Chunks 11, 14 and 34 use it instead of the internet; its fixtures contain no real article text (AD-29).

**Manual verification:** **Go-ahead at execution time.** Fetch one feed from the candidate list as a read-only check. Nothing is stored.

**Status:** Not started.

### Chunk 9 — Article extraction and validation

**Goal:** Turn raw feed items into clean candidate articles, reject bad ones with a reason, and never persist original text.

**Difficulty:** Intermediate

**Dependencies:** 5, 7, 8. Decision before completion: OD-11. Confirm before completion: A-01.

**Spec must resolve:** N-07 (the reach-back test is a heuristic: curated or top-N feeds, sorting by update date, pinned old items and bogus dates; ignore outlier dates, for example by requiring several items at or before the week start, and test these cases).

- [ ] **9.1** Map each `RawFeedItem` to a `CandidateArticle`: decode HTML entities, strip HTML from text fields and trim whitespace. The article content is kept in memory only, for simplification.
  - Test: fixture items with entities, HTML tags and extra whitespace come out clean.
  - Acceptance: `CandidateArticle` has every field the pipeline needs.

- [ ] **9.2** Validate each item: a title is required, the URL must be http(s), and the date must parse and fall inside the target week window.
  - Test: each of these is rejected with its own reason:
    - a missing date;
    - a date that cannot be parsed;
    - a date in the future;
    - a `javascript:` URL;
    - an item from outside the window.
  - Acceptance: only valid items from inside the window continue.

- [ ] **9.3** Count for each source how many items were fetched, valid, invalid (by reason) and outside the window, and work out its **coverage** of the target week with the reach-back test (ARCHITECTURE, "Source coverage"): `complete` only when the fetch succeeded, at least one item has a valid date, and the oldest fetched item is at or before the week's start; otherwise `possibly_incomplete` or `failed`, with a reason. Record `oldest_fetched_at` and `at_item_limit`.
  - Test: the counts for a mixed fixture match exactly, and each coverage case gives the expected result: a full feed with no in-week items whose oldest item is newer than the week start is `possibly_incomplete`; an empty feed, or one with no dated items, is `possibly_incomplete`; a quiet week whose feed reaches back before the week start is `complete`.
  - Acceptance: the counts and coverage are available for the run record (Chunk 11), and no warning on its own makes a source complete.

- [ ] **9.4** Guarantee that original content is never written to the database.
  - Test: a type-level test and a unit test show that the database insert type has no content field.
  - Acceptance: FR-DATA-03 holds by construction.

**Manual verification:** **Go-ahead at execution time.** Run extraction on one candidate feed as a read-only check, and read the rejection reasons and the coverage result.

**Status:** Not started.

### Chunk 10 — Duplicate prevention

**Goal:** Each article is stored once, however many times it arrives and from however many sources (A-02).

**Difficulty:** Intermediate

**Dependencies:** 5, 9. Confirm before completion: A-02.

- [ ] **10.1** `canonicalizeUrl()`:
  - lowercases the scheme and host;
  - removes the fragment;
  - removes only the tracking parameters on a documented list (`utm_*`, `fbclid`, `gclid`);
  - keeps the path, including any trailing slash, and every other query parameter exactly as they were.
  - Test: a table of URL variants maps to the expected canonical forms, and URLs that differ only in a non-listed parameter or a trailing slash stay different.
  - Acceptance: only the listed changes are ever made to a URL.

- [ ] **10.2** Remove duplicates within a run, across sources: first by canonical URL, then by source key and GUID.
  - Test: the same article in two fixture feeds produces one candidate.
  - Acceptance: the number of duplicates is recorded.

- [ ] **10.3** Database inserts ignore conflicts on the unique keys and count the duplicates.
  - Test: running the same week again against the same fixtures inserts 0 rows.
  - Acceptance: FR-COL-07 and FR-DATA-06 hold.

**Manual verification:** Read the test output.

**Status:** Not started.

### Chunk 11 — Article storage, run recording and end-to-end `news:sync`

**Goal:** A working `yarn news:sync` that collects, validates, deduplicates and stores article metadata, and records every run.

**Difficulty:** Intermediate

**Dependencies:** 5, 10. Decision before completion: OD-17 (needed before the real-source manual check).

**Spec must resolve:** N-16 (the "already running" exit code in 11.3 comes before the lock in Chunk 24); N-08 (how a run that is refused before the database can be opened is recorded: in the log or wrapper output, not the refusing database).

- [ ] **11.1** Implement the run record's lifecycle. A run is created as `running` and finishes as `succeeded` (every target week complete), `partial` (any week incomplete, or any source failed), `failed` or `no_sources` (nothing enabled), with its counts and per-source coverage (AD-27).
  - Test: a run with one failing source ends as `partial`; a run with only `possibly_incomplete` sources ends as `partial`; a run whose config fails ends as `failed`; a run with no enabled sources ends as `no_sources` and marks no week complete.
  - Acceptance: every run leaves exactly one finished record (FR-AUTO-08), and a week is recorded as complete only when every enabled source is complete for it. The live-only statuses `retention_inactive` and `retention_cleanup_failed` (AD-32) never mark a week complete either.

- [ ] **11.2** Store new articles as `pending`, with their source's default category, using one transaction per source, and write one result row per source.
  - Test: a forced error partway through one source rolls back only that source's inserts, and every stored article has a category.
  - Acceptance: FR-DATA-07 holds, and the category filter works even with the `none` provider.

- [ ] **11.3** Wire `yarn news:sync` from end to end: guards (maintenance marker, schema check), config, sources, fetch, extract and validate, deduplicate, store, finish the run. Use the exit codes from AD-27: 0 for `succeeded`, `partial` and `no_sources`; distinct non-zero codes for `failed` and "already running".
  - Test: check the exit code for each outcome.
  - Acceptance: it works while the Next.js server is stopped (FR-COL-03, FR-COL-04).

- [ ] **11.4** Add an integration test that runs fixture feeds, one of them failing, against a temporary database.
  - Test: the expected rows, counts and run status are produced.
  - Acceptance: the test runs as part of `yarn test`, with no network.

**Manual verification:** Run `yarn news:sync` against the fixture feed server from 8.4 on the development database, and inspect the stored rows and coverage. If OD-03 and OD-17 are resolved, also run it against the approved sources as OD-17 decides (**Go-ahead at execution time**); otherwise add a note that the real-source run moves to task 36.2.

**Status:** Not started.

### Chunk 12 — Permitted public API connector (conditional) ⛔

**Goal:** Collect from an approved public API, if David approves one.

**Difficulty:** Intermediate

**Dependencies:** 11. ⛔ Blocked until OD-03 is resolved with at least one approved API source. Skipped if none is approved.

- [ ] **12.1** Build a connector for the approved API. It returns `RawFeedItem[]` and respects the API's rate limits and terms.
  - Test: recorded fixture responses map to the expected items, and a rate-limit response is handled.
  - Acceptance: the connector plugs into `collectSource()` without changes to the pipeline.

- [ ] **12.2** Isolate the connector's failures exactly as in task 8.3.
  - Test: an API failure does not stop the RSS sources.
  - Acceptance: the errors appear in the run record.

**Manual verification:** **Go-ahead at execution time.** Make one read-only call to the approved API and store nothing. Pagination must reach back to the week start for the source to count as complete.

**Status:** Blocked — awaiting OD-03.

---

## Phase 4 — Simplification Framework

### Chunk 13 — Simplification provider interface and output schema

**Goal:** One small interface that every provider implements, a strict output schema, and two providers that need no AI, so that collection and tests work without an external service.

**Difficulty:** Intermediate

**Dependencies:** 3, 6. Decision before completion: OD-08.

- [ ] **13.1** Define `SimplificationInput`, `SimplifiedArticle` and `SimplificationProvider { name; simplify(input) }`.
  - Test: the type tests compile, and a provider without `name` does not.
  - Acceptance: the interface matches ARCHITECTURE.

- [ ] **13.2** Write `simplifiedArticleSchema` (zod). It requires:
  - a summary given as an array of 2–4 sentences, so sentences are never counted by splitting text on full stops (which breaks on "Node.js", "e.g." or "v1.2");
  - "why it matters";
  - a technical explanation;
  - 3–5 key takeaways;
  - at least one technology;
  - roles and a category taken from `src/lib/simplifier/taxonomy.ts`;
  - a difficulty of `Beginner`, `Intermediate` or `Advanced`.

  Also check the sources' default categories against the same taxonomy.

  - Test: valid output passes, including a sentence that contains "Node.js" and "e.g.". Each of these fails with a clear issue: a summary array of 1 or 5 sentences, 2 takeaways, 6 takeaways, an unknown role, and the difficulty `Expert`.
  - Acceptance: the taxonomy holds the Proposed lists until OD-08 is resolved, and David's lists after that.

- [ ] **13.3** Add the `none` provider, which is the default and leaves articles `pending`. Add a deterministic `fake` provider. `SIMPLIFIER_PROVIDER` selects between them. `fake` output is labelled as test data.
  - Test: `none` never returns content, and `fake` returns schema-valid output that is identical on every run.
  - Acceptance: neither provider can make an external call.

**Manual verification:** Read the test output.

**Status:** Not started.

### Chunk 14 — Simplification step and validated storage

**Goal:** Each run simplifies its new articles through the configured provider, stores only validated output, and keeps collecting when simplification fails.

**Difficulty:** Intermediate

**Dependencies:** 11, 13

**Spec must resolve:** N-16 (the 14.3 sentinel check covers "the run's log file", which arrives in 26.4: define a temporary log sink here, or limit 14.3 to the database and `last_error` and extend it in 26.4).

- [ ] **14.1** After storing, send the run's pending articles to the provider one at a time. For each one:
  - validate the output;
  - normalize the technology names;
  - save the fields, technologies and roles in one transaction, with status `simplified` and the provider name. The category stored at insert is replaced only if OD-08's resolution says the provider assigns it.
  - Test: with `fake`, every new article ends as `simplified` with all eight items.
  - Acceptance: nothing is saved from output that failed validation.

- [ ] **14.2** Retry transient provider errors (timeout, HTTP 429, 5xx, invalid JSON) inside the run, with backoff, while the content is still in memory (AD-25). When the in-run retries are used up, or the output is invalid, set the article to `failed` and record `attempt_count`, an error code in `last_error` and `next_retry_at`. Then continue with the next article, and record the counts on the run.
  - Test: a provider that fails twice and then succeeds leaves the article `simplified`; a provider that throws on every attempt for one article out of three leaves two `simplified`, one `failed` and the run `partial`.
  - Acceptance: FR-SIM-09 and FR-SIM-10 hold.

- [ ] **14.3** Add failure-mode tests using test providers. Cover invalid output (a 1-sentence summary, 6 takeaways, a bad difficulty), a thrown error and a timeout. Add a sentinel-string test (AD-29): a synthetic fixture article carries a unique marker string, and after every failure mode the marker appears nowhere in the database, the run's log file or `last_error`.
  - Test: each case ends as `failed` with its own reason, the metadata stays intact, and the sentinel is never found.
  - Acceptance: simplification never crashes a run, and no article content leaks into storage or logs.

**Manual verification:** Run `yarn news:sync` with `SIMPLIFIER_PROVIDER=fake` against the fixture feed server (8.4) on the development database, and check that the rows are labelled as test data.

**Status:** Not started.

### Chunk 15 — Failed processing and retry

**Goal:** Failed simplifications are retried later, up to a limit, without ever storing original text.

**Difficulty:** Intermediate

**Dependencies:** 14

- [ ] **15.1** Select articles to retry:
  - `failed` articles below the attempt limit (3, AD-19) whose `next_retry_at` has passed;
  - older `pending` articles, when a provider is configured.
  - Test: articles at the limit, articles not yet due, and articles already simplified are not selected.
  - Acceptance: the limit is a single setting. Chunk 32 revisits it if a paid provider is approved.

- [ ] **15.2** Fetch the article's content again by finding the item in its source feed (OD-02 option (a) only; options (b) and (c), if chosen, are added in 31.4). If the item is no longer there, record `content_unavailable`, which uses up an attempt (AD-06, AD-19).
  - Test: if the item is still in the feed, the article is retried; if it is gone, the article becomes `failed` with `content_unavailable` and its attempt count rises.
  - Acceptance: no stored text is used.

- [ ] **15.3** An article that reaches the attempt limit becomes permanently failed, and is listed as such.
  - Test: the third failure marks the article permanently failed, and it is no longer selected.
  - Acceptance: a permanently failed article keeps its metadata and its original link.

- [ ] **15.4** Every `news:sync` retries the eligible articles after collecting.
  - Test: using fixture feeds, a second run retries an article that failed in the first.
  - Acceptance: retry counts appear on the run record.

**Manual verification:** Read the test output.

**Status:** Not started.

### Chunk 16 — AI provider selection

**Goal:** Give David what is needed to decide OD-01 and OD-02. No application code is written, and no article content is sent anywhere.

**Difficulty:** Easy

**Dependencies:** 6. Decision preparation (no application code). Never counted as Blocked. Confirm before completion: A-06. It can be done early, any time after Chunk 6, to shorten the period in which articles pile up unsimplified.

**Spec must resolve:** N-16 (the content-length data in 16.1 needs feed parsing from Chunk 8: a minimal read-only parse, or doing that part after Chunk 8).

- [ ] **16.1** Write a comparison spec in `docs/superpowers/specs/`.
  - Candidates: paid APIs, free tiers, and an existing model running locally if David considers that allowed.
  - For each candidate, cover:
    - cost;
    - rate limits;
    - data retention and use for training;
    - terms for third-party article text;
    - support for structured output;
    - expected quality.
  - It also records, for each candidate source from 6.3, how much content its feed carries (title only, short excerpt or full text), and states the backlog consequence of deciding late (OD-01, OD-02).
  - Test: every candidate has every column filled in, with a source link for each price or policy.
  - Acceptance: no candidate is presented as free without a cited limit.

- [ ] **16.2** Estimate monthly usage from A-06: articles per week × input and output size, including retries. Give a cost range for each candidate.
  - Test: the formula and inputs are written down, so David can recompute the numbers.
  - Acceptance: the estimate covers the best case and the worst case.

- [ ] **16.3** David records OD-01 and OD-02 in the decision log: approve, defer or decline.
  - Test: none (this is a decision).
  - Acceptance: the decision log has an entry for OD-01 and one for OD-02.

**Manual verification:** David reads the comparison.

**Status:** Not started.

This chunk is complete once David's decision on OD-01 and OD-02 is logged (approve, defer or decline) **and** A-06 is confirmed. The outcome unblocks Chunks 31 and 32, or leaves them blocked.

---

## Phase 5 — Dashboard Core

### Chunk 17 — Dashboard layout and navigation

**Goal:** The dashboard shell that every page uses, reachable only from the local machine.

**Difficulty:** Easy

**Dependencies:** 3, 5. Confirm before completion: A-04.

- [ ] **17.1** Build the app shell with navigation to Latest, Archive, Bookmarks, Technologies and Status, using shadcn/ui components.
  - Test: a component test renders the shell and every navigation item.
  - Acceptance: the shell is shared by every page.

- [ ] **17.2** Add shared `loading.tsx`, `error.tsx` and `not-found.tsx` pages, plus empty states.
  - Test: an unknown route shows the not-found page, and an empty database shows an empty state.
  - Acceptance: no page crashes when the database is empty.

- [ ] **17.3** Bind the dashboard to `127.0.0.1` in development and production (production start: `next start -H 127.0.0.1`), use the Node.js runtime for database access, render every database-backed page dynamically, check the schema at startup (AD-24), and accept Server Actions only from the local host and origin (AD-08, AD-28).
  - Test: a test checks the host flags, the runtime, and that a request with a foreign `Host` or `Origin` header is rejected; the `yarn build` route table marks every database page as dynamic (ƒ).
  - Acceptance: the dashboard cannot be reached from another device, never shows data frozen at build time, and builds without a database present.

- [ ] **17.4** Add a Playwright navigation test.
  - Test: every navigation link opens its page.
  - Acceptance: the test runs as part of `yarn test:e2e`.

**Manual verification:** Open the dashboard on David's PC. From a phone on the same network, try `http://PC-IP:3000` and confirm that it does not load.

**Status:** Not started.

### Chunk 18 — Latest articles

**Goal:** The home page lists the newest articles with their key facts.

**Difficulty:** Intermediate

**Dependencies:** 14, 17. Decision before completion: OD-06.

- [ ] **18.1** Write a paginated query for the latest articles, newest published first.
  - Test: a database test with seeded rows checks the ordering and the page boundaries.
  - Acceptance: the query uses the index from task 5.4.

- [ ] **18.2** Build the article card. It shows the title, source, date in MYT, summary, difficulty badge, technologies and read state.
  - Whether pending articles appear is controlled by one query clause and one card variant, per OD-06.
  - Articles from the `fake` provider show a "Test data" badge.
  - Test: component tests cover simplified, pending and fake-provider cards.
  - Acceptance: the OD-06 choice is applied before the chunk is marked complete.

- [ ] **18.3** `yarn db:seed` fills the development or test database through the `fake` provider, for development and end-to-end tests. It refuses the live database path (AD-23).
  - Test: seeding twice creates no duplicates, and seeding against the live path is refused.
  - Acceptance: seeded data is visibly labelled as test data.

**Manual verification:** Seed the database, open the home page and page through the results.

**Status:** Not started.

### Chunk 19 — Article details

**Goal:** One page per article, showing all eight items and a safe link to the original.

**Difficulty:** Intermediate

**Dependencies:** 18

- [ ] **19.1** `/articles/[id]` shows:
  - the original title;
  - the summary;
  - why it matters;
  - the technical explanation;
  - the key takeaways;
  - the technologies and roles;
  - the difficulty;
  - the original URL and source.

  An unknown ID returns a 404.

  - Test: a Playwright test on a seeded article checks each item, and an unknown ID shows the 404 page.
  - Acceptance: FR-DASH-05 holds, and FR-SIM-01…08 are displayed whenever present.

- [ ] **19.2** The original link:
  - accepts http(s) only;
  - opens in a new tab with `rel="noopener noreferrer"`.

  All article text is rendered as plain text.

  - Test: an article whose summary contains `<script>` shows it as text, and a `javascript:` URL is not rendered as a link.
  - Acceptance: `dangerouslySetInnerHTML` appears nowhere in the codebase.

- [ ] **19.3** Show an "AI-simplified" label with the provider name, plus views for pending and failed articles.
  - Test: a component test covers each state.
  - Acceptance: a pending or failed article still shows its title, source and original link.

**Manual verification:** Open several seeded articles and their original links.

**Status:** Not started.

---

## Phase 6 — Dashboard Features

### Chunk 20 — Search and difficulty filtering

**Goal:** Find articles by text, difficulty and source.

**Difficulty:** Intermediate

**Dependencies:** 18

- [ ] **20.1** Search the title, summary and technologies as text, using parameterized SQL `LIKE` (AD-12).
  - Test: matching ignores case, and input containing `%`, `_` or quotes is matched literally.
  - Acceptance: no SQL is built by joining strings.

- [ ] **20.2** Add difficulty and source filters that combine with search. Keep them in the URL's query parameters, and add a control that clears all filters.
  - Test: query-builder unit tests cover each combination.
  - Acceptance: reloading a filtered URL gives the same results.

- [ ] **20.3** Add an end-to-end test that combines search and filters.
  - Test: a Playwright flow on seeded data.
  - Acceptance: the test runs as part of `yarn test:e2e`.

**Manual verification:** Search for a known technology, then add a difficulty filter.

**Status:** Not started.

### Chunk 21 — Categories and technologies

**Goal:** Browse articles by category and by technology.

**Difficulty:** Intermediate

**Dependencies:** 18. Decision before completion: OD-08.

- [ ] **21.1** Browse and filter by category, using the taxonomy list.
  - Test: each category shows only its own articles.
  - Acceptance: the categories match the OD-08 decision before the chunk is marked complete.

- [ ] **21.2** Add a technologies index with article counts. Choosing a technology filters the list.
  - Test: the counts match the seeded data.
  - Acceptance: technology names appear as normalized in task 14.1.

- [ ] **21.3** Add an end-to-end test: from a category to an article, and from a technology to the filtered list.
  - Test: a Playwright flow.
  - Acceptance: the test runs as part of `yarn test:e2e`.

**Manual verification:** Browse two categories and two technologies.

**Status:** Not started.

### Chunk 22 — Bookmarks and read/unread

**Goal:** Bookmark articles and keep track of which ones have been read.

**Difficulty:** Intermediate

**Dependencies:** 19. Decision before completion: OD-14. Confirm before completion: A-03.

- [ ] **22.1** Add Server Actions that toggle the bookmark and read state through explicit controls. Whether opening an article also marks it read is OD-14. Until it is resolved, nothing changes read state except the toggle, and no write ever happens during page rendering or link prefetching.
  - Test: action tests update the right row and its timestamps; rendering or prefetching a details page changes nothing.
  - Acceptance: these actions are the dashboard's only database writes, and the OD-14 choice is applied before the chunk is marked complete.

- [ ] **22.2** Add a bookmarks page, an unread filter and an unread count.
  - Test: query tests cover the filter and the count.
  - Acceptance: FR-DASH-08 and FR-DASH-09 hold.

- [ ] **22.3** Add an end-to-end test: bookmark an article and mark it read, reload, and check that the state has persisted.
  - Test: a Playwright flow.
  - Acceptance: the test runs as part of `yarn test:e2e`.

**Manual verification:** Bookmark an article, mark it read and then unread, restart the dashboard, and confirm the state has persisted.

**Status:** Not started.

### Chunk 23 — Weekly archive

**Goal:** Browse articles week by week.

**Difficulty:** Intermediate

**Dependencies:** 7, 18. Confirm before completion: A-01.

- [ ] **23.1** Build an archive index of the MYT weeks present in the database, newest first, with article counts. It does not depend on OD-04.
  - Test: seeded articles on either side of a Monday 00:00 MYT boundary land in different weeks.
  - Acceptance: the week labels show MYT dates.

- [ ] **23.2** Add a page for each week that reuses the article list and filters.
  - Test: Playwright opens a week and sees only that week's articles.
  - Acceptance: FR-DASH-07 holds.

- [ ] **23.3** Test the week boundaries with the process timezone set to something other than MYT.
  - Test: run the test from task 23.1 in the `UTC` Vitest project (TZ set in the config, task 2.2).
  - Acceptance: the results are the same.

**Manual verification:** Open the archive and two of its weeks.

**Status:** Not started.

---

## Phase 7 — Collection Operations and Retention

### Chunk 24 — Run lock and overlap prevention

**Goal:** Only one collection run happens at a time, and a crash never leaves the system stuck.

**Difficulty:** Intermediate

**Dependencies:** 11

- [ ] **24.1** Take the `job_lock` row atomically, recording the PID, start time and heartbeat. A second run exits cleanly with "already running" and its own exit code.
  - Test: two processes are started together, and exactly one of them runs.
  - Acceptance: FR-AUTO-06 holds for manual and scheduled runs alike.

- [ ] **24.2** Update a heartbeat while the run is in progress. A lock is stale when its heartbeat is older than the configured time or its PID no longer exists. A stale lock is taken over, and its run is marked `failed` with the reason "interrupted". A lock held by a `deployment` is never taken over this way (AD-30).
  - Test: a lock with an old heartbeat is taken over, and its run is marked as interrupted; a deployment lock is respected.
  - Acceptance: a crash can never block the next Monday's run.

- [ ] **24.3** Release the lock on success, on failure, on an unhandled error, and on the signals Windows lets a Node.js process catch (SIGINT, SIGBREAK). A hard kill — Task Scheduler's End, its time limit, or Task Manager — can't be caught on Windows, so it is handled by the stale takeover in 24.2.
  - Test: each catchable exit path leaves no lock behind; after a simulated hard kill, the next run takes the stale lock over.
  - Acceptance: an unhandled error still releases the lock, and no exit, caught or not, blocks the next run.

- [ ] **24.4** Make the concurrency tests reliable.
  - Test: run the two-process test and the stale-takeover test 10 times in a row.
  - Acceptance: every one of the 10 repetitions passes.

**Manual verification:** Start `yarn news:sync` in two terminals at the same time. One of them refuses to run.

**Status:** Not started.

### Chunk 25 — Manual collection commands

**Goal:** Useful manual runs from the terminal, recorded separately from scheduled ones.

**Difficulty:** Intermediate

**Dependencies:** 15, 24

**Spec must resolve:** N-16 (25.1 refers to `incomplete (final)`, defined in 30.1: define the week-state values here, or limit `--week` to what exists and extend it in Chunk 30).

- [ ] **25.1** Add these options to `news:sync`:
  - `--week YYYY-MM-DD`, where the date is an MYT Monday;
  - `--source KEY`;
  - `--retry-only`;
  - `--dry-run`;
  - `--scheduled`, used only by the Task Scheduler wrapper.

  Each run records its trigger as `manual` or `scheduled`. `--week` can retry any week, including one marked `incomplete (final)`; once retention exists (Chunk 27), it refuses a week entirely older than the retention cutoff defined by OD-04.

  - Test: argument parsing, including invalid dates and unknown source keys; `--week` on an `incomplete (final)` week re-collects it.
  - Acceptance: FR-COL-04 holds, including the options.

- [ ] **25.2** Print a readable summary for each source and for the whole run.
  - Test: a snapshot of the summary for a fixture run.
  - Acceptance: each failure names its source and the reason.

- [ ] **25.3** Make sure `--dry-run` writes nothing.
  - Test: the database row counts are identical before and after a dry run.
  - Acceptance: a dry run still prints what it would have stored.

**Manual verification:** Run each option once from a terminal.

**Status:** Not started.

### Chunk 26 — Collection status and logs

**Goal:** The dashboard shows how collection is going: the last run, the next run and any failures.

**Difficulty:** Intermediate

**Dependencies:** 17, 25

**Spec must resolve:** N-09 (which statuses count as success for the overdue warning, given that `partial`, `no_sources` and `retention_inactive` are normal; and a separate trigger value for test-task runs); N-16 (where the task status shown in 26.1 comes from before 29.2 records it, and the `incomplete (final)` state used in 26.2, which is defined in 30.1); L-k (an "already running" refusal record must not hide the run that is actually in progress).

- [ ] **26.1** Build a status page that shows:
  - the last run: its time in MYT, trigger, status and counts;
  - the next scheduled run: Monday 08:00 MYT, computed per AD-10, labelled "schedule not set up" until a task status has been recorded (29.2) and "schedule not verified" when no scheduled run has happened in 8 days;
  - an overdue warning when the latest expected run has no success;
  - any run whose lock heartbeat went stale, shown as "interrupted".
  - Test: page tests cover a latest run that succeeded, was partial, failed, ended as `no_sources`, `retention_inactive` or `retention_cleanup_failed`, is missing, or was interrupted, and each schedule label.
  - Acceptance: FR-DASH-10, FR-DASH-11 and FR-DASH-12 hold, and the page never shows a confident next run time that nothing backs up.

- [ ] **26.2** Show the history of all run records present, with each source's results, coverage and errors, and every week that is incomplete or `incomplete (final)`, with its reasons.
  - Test: seeded runs appear in order, with their source errors and coverage; an incomplete week is never shown as complete.
  - Acceptance: FR-DASH-13 holds.

- [ ] **26.3** List failed articles, with the reason, the number of attempts, the next retry, and whether the failure is permanent.
  - Test: seeded failures are displayed correctly.
  - Acceptance: each failed article links to its details page.

- [ ] **26.4** Write one log file per run in `data/logs/`, and store its path on the run record. Logs hold error codes and safe messages only, never article content or raw provider output (AD-29).
  - Test: a fixture run creates its log file and records the path; the sentinel-string check from 14.3 finds no article content in it.
  - Acceptance: the status page shows the log path.

**Manual verification:** After a manual run, compare the status page with the console summary.

**Status:** Not started.

### Chunk 27 — Two-month retention and cleanup ⛔

**Goal:** Articles older than two months, and everything attached to them, are deleted safely and automatically.

**Difficulty:** Intermediate

**Dependencies:** 22, 24, 26. ⛔ Blocked until OD-04 and OD-05 (bookmark deletion) are resolved, because deletion cannot be undone. Decision before completion: OD-18.

**Spec must resolve:** N-14 (the manifest stores only the oldest timestamp per table, which can't express OD-05's "keep bookmarks" option; a backup count limit before Chunk 27 exists; the short rollback window that backup expiry causes, to be explained to David); N-16 (the backup manifest format, defined with Chunk 29 in ARCHITECTURE "Live checkout and deployment").

- [ ] **27.1** `cleanupExpired(now)` deletes, in **one database transaction**, articles older than the OD-04 cutoff (cascading to related rows, with the OD-05 bookmark-deletion rule) and run records older than the same cutoff (Proposed, AD-31: run records use the article cutoff), using the governed-table list from 5.5.
  - Test:
    - articles and run records just inside the cutoff stay, and those just outside it are deleted;
    - bookmarked articles are handled per OD-05;
    - related rows are removed.
  - Acceptance: FR-DATA-04 and FR-DATA-05 hold for every governed table.

- [ ] **27.2** After the transaction commits, delete the expired log files, sweep for orphaned log files, and apply the backup expiry rule from AD-30: every deployment backup and failed-deployment folder is deleted once the oldest retained record inside it would have expired (from its manifest, or by read-only inspection). File deletion can't be rolled back, so failures are retried and then reported.
  - Test: old log files are removed and recent ones stay; a backup whose oldest article or run record has passed the cutoff is deleted, even if the backup file is new; a backup without a manifest is inspected read-only; a locked or unverifiable backup makes `backup_cleanup` `failed` or `unverifiable`.
  - Acceptance: no orphaned log files remain, no backup keeps expired data, and a failed file deletion is never reported as successful retention.

- [ ] **27.3** Run cleanup while the lock is held: in the live checkout at the **start** of every `news:sync`, before any collection; in development at the **end** of every `news:sync`, after collection and retries. Also run it on demand as `yarn news:cleanup`. Record the counts and the `backup_cleanup` result on the run; any file-cleanup failure makes the run at least `partial`. Also add the retention configuration and live guard check (AD-32):
  - `retention.rule`, empty until OD-04 and OD-05 are resolved;
  - `retention.active`, `false` by default;
  - in the live checkout, a run refuses to collect if cleanup fails, recording `retention_cleanup_failed`. What counts as a cleanup failure follows OD-18.

  Setting `retention.active: true` is a separate commit that David approves after this chunk is `Complete.`, deployed with `live:update` (go-ahead).

  - Test: an integration run reports its cleanup counts; a forced file-deletion failure is reported, not hidden; with `retention.active: false` a live-mode run records `retention_inactive` and collects nothing; with a forced cleanup failure a live-mode run records `retention_cleanup_failed` and collects nothing.
  - Acceptance: cleanup never runs without the lock; in the live checkout it never runs after collection, and in development it runs at the end of the run.

- [ ] **27.4** Add safety tests.
  - Test: a second cleanup run changes nothing; an error partway through the database step rolls back every row deletion; an error in the file step leaves the database correct and reports the remaining files.
  - Acceptance: the tests run as part of `yarn test`.

- [ ] **27.5** Make the dashboard's queries hide articles and runs past the cutoff even if cleanup hasn't run yet. Only if OD-16 is approved, show an "expires soon" hint on bookmarked articles near the cutoff. OD-16 never blocks this chunk: if it is still unresolved when everything else here is complete, the hint is left out and added later as a follow-up task.
  - Test: an expired row present in the database is never shown; the hint appears only when OD-16 is approved.
  - Acceptance: FR-DATA-04 holds for what David sees, whether or not the schedule ran.

**Manual verification:** On a copy of the development database with seeded old data and an old synthetic backup, run `yarn news:cleanup` and compare the counts and files before and after.

**Status:** Blocked — awaiting OD-04, OD-05.

### Chunk 28 — Dashboard-triggered collection (optional) ⛔

**Goal:** Optionally, a "Run collection now" button that starts the collector as a separate process.

**Difficulty:** Advanced

**Dependencies:** 24, 26. ⛔ Blocked until OD-07 is resolved. Skipped if David declines.

- [ ] **28.1** A Server Action starts `yarn news:sync` as a detached process and returns immediately. It refuses while the lock is held.
  - Test: the action refuses when a lock row exists, and the started process keeps running after the dashboard restarts.
  - Acceptance: collection still never runs inside Next.js.

- [ ] **28.2** The status page shows that a run is in progress, and refreshes until it finishes.
  - Test: a page test with a `running` run record.
  - Acceptance: the button is disabled while a run is in progress.

- [ ] **28.3** Add an end-to-end test of the button, using fixture feeds.
  - Test: a Playwright flow.
  - Acceptance: the test runs as part of `yarn test:e2e`.

**Manual verification:** Press the button, close the browser, and confirm that the run finishes.

**Status:** Blocked — awaiting OD-07.

---

## Phase 8 — Background Automation

The scheduling proof rule applies to this whole phase. Before every task marked **Go-ahead at execution time**, stop and ask David for explicit approval. That covers changing Windows settings, registering or modifying scheduled tasks, and running tests that interrupt the PC or the network.

### Chunk 29 — Windows Task Scheduler registration

**Goal:** Run collection from an approved live checkout, register `DevPulse-Weekly-News-Collection` to run `yarn news:sync` every Monday at 08:00 Malaysia time, and prove on real Windows that it fires once, at the right time, against the live database only.

**Difficulty:** Advanced

**Dependencies:** 25. Decision before completion: OD-10, OD-12 and OD-13, all needed before task 29.4; OD-18.

**Spec must resolve:**

- **N-03:** every deployment step must be able to run under the guards it holds.
- **F2, jointly with Chunk 4:** the handoff design — in-process, or a subprocess of the new commit with its own authorisation channel.
- **N-04:**
  - run the deployment from outside the live tree, so the install isn't blocked by files the running process has loaded;
  - build the dashboard during deploy and rollback.
- **N-08:** how a refused run is recorded when the database can't be opened.
- **N-10:** the network wait must be clearly shorter than the task time limit; also verify whether ending `powershell.exe` stops the child `node.exe`.
- **N-13:** a recovery path for a crashed or stuck deployment, including the "earlier backup-cleanup failure" rule.
- **N-14:** opening a failed-deployment database read-only when its `-wal` and `-shm` files are still present.
- **N-16:** the live dashboard comes from Chunk 17, which this chunk doesn't list as a dependency.
- **N-17:** the wrapper calls the committed Yarn release by absolute path, not the Corepack shim.
- **N-20:** the live tree stays clean after install, build and a run.
- **F15:** live checks need code that isn't on `main` yet; choose between a partial merge with a go-ahead, or a test-only deployment of an approved branch commit.
- **L-g:** use different ports for the development and live dashboards.
- **L-h:** test `SQLITE_BUSY` in both directions.

- [ ] **29.1** **Go-ahead at execution time.** Stop and ask David for explicit approval. Then create the live checkout and the `yarn live:update <commit>` procedure (AD-23, AD-30; ARCHITECTURE, "Live checkout and deployment" and "Mandatory requirements for later specs"):
  - a detached worktree of an approved `main` commit, outside the development folder, with its own `data/devpulse.db` and `.env.local`;
  - the collector's live retention guard (AD-32) ships no later than this task, with `retention.active: false`, so no live-checkout run can collect;
  - `live:update` refuses unless David approved the commit, it is on `main`, `yarn verify` passed at it, and the live tree is clean;
  - it takes the deployment lock, creates the maintenance marker, checks the live dashboard is stopped, and acquires a SQLite `locking_mode = EXCLUSIVE` connection (a checkpoint result of `busy = 0` alone never counts as exclusive access);
  - it applies retention first (once Chunk 27 exists), checkpoints, writes a verified backup with a manifest, checks out, installs with `--immutable`, migrates, builds, runs a smoke check, and logs the deployment;
  - on failure it moves the failed database and its `-wal` and `-shm` files aside, restores the backup, returns to the previous commit and verifies integrity, schema version, row counts and a smoke check before reporting success; if that fails, it keeps the marker and the lock and asks David.
  - Test: with synthetic data, a successful update, a forced migration failure with verified rollback, a refusal while a second process holds the database open (it must get `SQLITE_BUSY`), and a refusal for a commit not on `main`.
  - Acceptance: the live checkout runs the approved commit, and `data/live-deploys.log` records it.

- [ ] **29.2** **Go-ahead at execution time** for the wrapper test in the live checkout. Write the wrapper `scripts/windows/run-news-sync.ps1` and the scripts `yarn task:register`, `task:unregister` and `task:status`.
  - The wrapper runs only in the live checkout. It calls `node` by absolute path and checks its version (AD-18), refuses when the tree is dirty, HEAD differs from the last deployed commit, HEAD is not reachable from `main`, the database path isn't the live one, or the schema isn't current, then runs `yarn news:sync --scheduled`, appends the output to `data/logs/` and ends with `exit $LASTEXITCODE`. The collector's retention guard (AD-32) sits after the lock and run-record creation, before sources and fetching; while retention is inactive the run records `retention_inactive` and collects nothing.
  - The task definition: a weekly Monday trigger at `08:00:00+08:00`, synchronized across time zones; IgnoreNew; StartWhenAvailable; restart on failure (best effort); an execution time limit of 2 hours (Proposed); the run mode as a parameter (OD-10); and the action `powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File <absolute path>`, which bypasses the policy for that process only and changes no Windows setting.
  - `task:status` records whether the task exists and its next run time in the database, for the status page (26.1).
  - Test: a Vitest test checks the key fields of the generated task definition (this is not proof of scheduling); the wrapper, run from a fresh PowerShell outside the project folder under the account the task will use, gives a run record with trigger `scheduled`, a log file and the correct exit code; each guard refuses with its own reason.
  - Acceptance: the scripts change nothing until they are run, and `task:register` asks for confirmation first.

- [ ] **29.3** **Go-ahead at execution time.** Stop and ask David for explicit approval. Then, for each candidate run mode in OD-10, register a temporary `DevPulse-Schedule-Test` task with a one-time trigger a few minutes ahead, let it fire, record whether it ran, whether a network probe that collects nothing succeeded (a request to a fixed host chosen in the Chunk 29 spec, needing David's go-ahead as an outbound request), and whether any window appeared, and delete it. Retention doesn't need to be active for this; the run record shows `retention_inactive`.
  - Test: one recorded result per mode, with the `schtasks` output, the probe result and the run record.
  - Acceptance: David has real results from this PC to decide OD-10, and every test task has been deleted.

- [ ] **29.4** **Go-ahead at execution time.** Needs OD-10, OD-12 and OD-13 resolved. Stop and ask David for explicit approval. Then register the real task in the chosen mode and inspect it, and check its timezone handling:
  1. `schtasks /Query /TN "DevPulse-Weekly-News-Collection" /XML` shows the `+08:00` start boundary, the Monday trigger, IgnoreNew, StartWhenAvailable, the time limit and the action line;
  2. `schtasks /Query /TN "DevPulse-Weekly-News-Collection" /V /FO LIST` shows the next run time;
  3. temporarily change the Windows timezone, for example to UTC, read the next run time again, and restore the original timezone.

  - Test: the next run time is the coming Monday at 08:00 MYT in the PC's local time, and Monday 00:00 UTC while the timezone is UTC.
  - Acceptance: the timezone is restored, and every output is pasted into the chunk's verification note.

- [ ] **29.5** **Go-ahead at execution time.** Stop and ask David for explicit approval. Then:
  1. register a temporary `DevPulse-Schedule-Test` task with the real task's settings and a one-time `+08:00` trigger about 3 minutes ahead, and let it fire with no one touching the PC;
  2. while that instance is still running, run `schtasks /Run` on it again, to check that IgnoreNew refuses a second instance;
  3. check the collector's own lock with a manual run in the **development** folder against its development database: while one manual run holds the lock, a second refuses with "already running";
  4. delete the test task.

  - Test: the test task fires on its own and creates a run record (`retention_inactive` while retention is inactive) and a log in the live checkout; Task Scheduler refuses the second instance; the development-folder lock check records "already running".
  - Acceptance: the test task has been deleted, and the evidence is recorded.

**Manual verification:** Every check above happens on real Windows and is recorded with its date and real output. If a real Monday 08:00 MYT run happens during this chunk, record it as well; otherwise task 36.3 confirms it. Unit tests alone never complete this chunk.

**Status:** Not started.

### Chunk 30 — Missed-run recovery

**Goal:** When the PC misses Monday 08:00, DevPulse collects the missed week as soon as it can, and real Windows checks prove it.

**Difficulty:** Advanced

**Dependencies:** 29. Decision before completion: OD-03 (needed before tasks 30.3–30.5), OD-09, OD-11, OD-19. Chunk 27 Complete needed before tasks 30.3–30.5 (AD-32). Confirm before completion: A-01.

**Spec must resolve:** N-10 (the network wait must be clearly shorter than the task's time limit, allowing for the run itself); N-22 (where catch-up starts: OD-19 names the date retention became active, or the first week with enabled sources, as candidates); F15 (live checks need code that isn't on `main` yet).

Tasks 30.1 and 30.2 can proceed at once. Tasks 30.3–30.5 wait for real sources (OD-03) and active retention (Chunk 27).

- [ ] **30.1** Work out the due weeks: every week that is not complete (ARCHITECTURE, "Source coverage"), counting back from the latest expected run up to the automatic catch-up limit (4 weeks, AD-21, a Proposed technical policy). Process them oldest first in the existing weekly runs; there is no new trigger. A week past the limit becomes `incomplete (final)` and is never shown as complete, but `--week` can still retry it. A run with no enabled sources (`no_sources`) never completes a week. Apply OD-11's resolution for weeks already complete.
  - Test: unit tests for 0, 1 and 3 missed weeks, a `partial` week, a `possibly_incomplete` week, a `no_sources` run, and a gap longer than the limit. These prove the date logic only.
  - Acceptance: re-running never duplicates articles (Chunk 10), and no week is marked complete unless every enabled source was complete for it.

- [ ] **30.2** When the network is unreachable, the collector waits with bounded backoff (Proposed: up to 2 hours, AD-26) before failing with the reason `offline` and a non-zero exit code. Task Scheduler's restart-on-failure is kept as a best-effort extra only.
  - Test: unit tests with the network mocked as unreachable, then reachable after a delay, and unreachable throughout.
  - Acceptance: the run record shows the reason, and the wait never exceeds the bound or the task's time limit.

- [ ] **30.3** **Go-ahead at execution time.** Stop and ask David for explicit approval before each test, and before enabling Task Scheduler's "All Tasks History" if it is needed (a Windows setting). Using the test task in the live checkout:
  1. put the PC to sleep across the trigger time, then wake it;
  2. shut the PC down across the trigger time, then start it again;
  3. put the PC to sleep while a run is in progress, then wake it.

  - Test: after waking and after starting up, the task runs (StartWhenAvailable) and the due week is collected; after sleeping mid-run, the run either completes or is recorded as interrupted and recovered by the next run.
  - Acceptance: the observed times, the Task Scheduler history and the run records are recorded.

- [ ] **30.4** **Go-ahead at execution time.** Stop and ask David for explicit approval. Then disconnect the network across the trigger time, and reconnect it within the wait bound; separately, keep it disconnected beyond the bound.
  - Test: within the bound, the run waits and then succeeds; beyond it, the failure is recorded with the reason `offline`, and whether restart-on-failure fired is observed and recorded.
  - Acceptance: every run record is recorded with its real output, and the observed restart behaviour is written into ARCHITECTURE (R-16).

- [ ] **30.5** Only if OD-09 approves it, add the chosen extra trigger: a logon trigger, or a daily trigger that does nothing unless a week is due. **Go-ahead at execution time** applies to registering it and to the log-off/log-on check.
  - Test: with a week due, a run happens; with nothing due, nothing happens.
  - Acceptance: if OD-09 approves no extra trigger, the task is skipped and a note is added.

**Manual verification:** Every real check above is recorded with its date and output. Any scenario that does not recover is recorded as a known limitation and reported to David, not hidden. Unit tests alone never complete this chunk.

**Status:** Not started.

---

## Phase 9 — AI Provider Integration

Both chunks in this phase are ⛔ until OD-01 is resolved with an approved provider. Chunk 31 also needs OD-02 to be resolved. A deferral recorded in Chunk 16 keeps them blocked; a decline makes both `Skipped (OD-01)`. Once OD-01 is approved, Chunk 31 may move earlier, because it depends only on Chunks 15 and 16. Chunk 32 also needs the status page from Chunk 26.

### Chunk 31 — Approved provider adapter ⛔

**Goal:** Real simplification through the provider David approved.

**Difficulty:** Advanced

**Dependencies:** 15, 16. ⛔ Blocked until OD-01 and OD-02 are resolved, because of cost and privacy.

- [ ] **31.1** Write an adapter that implements `SimplificationProvider`. The API key comes from `.env.local`, is validated with zod, and is never logged.
  - Test: a missing key fails at startup with a clear message, and the log output never contains the key.
  - Acceptance: selecting the provider needs only `SIMPLIFIER_PROVIDER` and the key.

- [ ] **31.2** Write a prompt that asks for simple English at a junior-developer level, returned as structured JSON matching `simplifiedArticleSchema`. The article content is passed inside a clearly delimited data block marked as untrusted, and the provider gets no tools.
  - Test: the built prompt places the article content only inside the delimited block; a mocked response that deviates from the schema (for example, one that obeyed an injected instruction) fails validation, and the article is marked `failed` with no content stored.
  - Acceptance: the prompt lives in one file, David reviews it, and nothing reaches the database unless it passes the schema.

- [ ] **31.3** Add contract tests against mocked responses built from synthetic fixtures (AD-29).
  - Test: valid output, malformed JSON, a refusal, HTTP 429 and a timeout.
  - Acceptance: `yarn test` makes no live calls, and no fixture contains real article text.

- [ ] **31.4** Only if OD-02 resolves to option (b) or (c): add the extra content handling it requires (fetching the original page transiently, or a temporary excerpt that is purged once the article is simplified), as a follow-up to Chunk 15 rather than a silent change to it.
  - Test: the chosen option works, and with (c) the temporary content is gone after simplification and after the attempt limit.
  - Acceptance: if OD-02 resolves to (a), this task is skipped with a note.

**Manual verification:** None until the live run in Chunk 32.

**Status:** Blocked — awaiting OD-01, OD-02.

### Chunk 32 — Usage limits and quality verification ⛔

**Goal:** Keep the provider's cost inside David's budget, and confirm that the simplified English is good enough. This chunk completes FR-SIM-01…08.

**Difficulty:** Advanced

**Dependencies:** 26, 31. ⛔ Blocked until OD-01 is resolved, because of cost. Decision before completion: OD-17 (needed before task 32.3).

- [ ] **32.1** Add limits:
  - the number of articles per run;
  - the input size;
  - a request timeout;
  - low concurrency;
  - backoff after an HTTP 429.

  When the budget cap is reached, stop simplifying, leave articles `pending` and record why. Revisit the retry limit (AD-19).

  - Test: unit tests for each limit, using a mocked provider.
  - Acceptance: no run can go past the configured cap.

- [ ] **32.2** Record usage for each run: the number of requests, plus tokens or cost where the provider reports them.
  - Test: a mocked run records its usage.
  - Acceptance: the status page shows usage for each run.

- [ ] **32.3** **Go-ahead at execution time.** Stop and ask David for explicit approval. Then:
  1. make a live run on at most 10 real articles, against the database that OD-17's resolution names (needs OD-17);
  2. David reviews the output for readability and accuracy;
  3. adjust the prompt.

  - Test: all 10 outputs pass the schema.
  - Acceptance: David's review is recorded in the chunk's verification note.

**Manual verification:** David reads at least 5 simplified articles side by side with the originals.

**Status:** Blocked — awaiting OD-01.

---

## Phase 10 — Reliability, Testing and Release Readiness

### Chunk 33 — Error handling and reliability hardening

**Goal:** Every known failure mode is handled, logged and visible, and none of them leaves DevPulse stuck.

**Difficulty:** Advanced

**Dependencies:** 26, 30

**Spec must resolve:** N-08 (runs refused before the database can be opened — maintenance marker, schema out of date, database locked, `data/` unwritable — are recorded in the wrapper output or the log, not in the refusing database; 33.2's "finished run record" requirement is corrected to match).

- [ ] **33.1** Review the failure modes against the error-handling strategy in ARCHITECTURE:
  - the database is busy or locked;
  - `data/` cannot be written to;
  - the config is invalid;
  - the process crashes mid-run;
  - a promise rejection is not handled;
  - the maintenance marker exists, or the schema is not current.

  Each one is logged with an error code (never article content) and marks the run as `failed` or `deployment_in_progress`.

  - Test: a checklist with one row per failure mode, stating how it is handled.
  - Acceptance: no failure mode is left unhandled.

- [ ] **33.2** Add a fault-injection test for each failure mode.
  - Test: one test per mode, run as part of `yarn test`.
  - Acceptance: every test ends with no lock left behind and a finished run record.

- [ ] **33.3** Make the dashboard resilient. If the database is missing or migrations are pending, it shows a clear message instead of crashing.
  - Test: a Playwright test with no database file.
  - Acceptance: the message tells David which command to run.

**Manual verification:** In the development folder, stop the dashboard, rename the development database file (and its `-wal` and `-shm` files), start the dashboard and check the message, then stop it again and restore the files.

**Status:** Not started.

### Chunk 34 — Test suite completion and E2E

**Goal:** Complete automated coverage: end-to-end flows for every dashboard feature, and a collector test that needs no internet.

**Difficulty:** Advanced

**Dependencies:** 20, 21, 22, 23, 26, 33. Confirm before completion: A-06.

- [ ] **34.1** Review test coverage against the requirement traceability table and fill the gaps. Measure P-01 with 5,000 seeded articles. Check P-02: telemetry is off, no font or telemetry hosts appear in the build, the sentinel-string test (14.3) covers every log and error path, and no fixture contains real article text.
  - Test: every FR, TR and NFR row names at least one test or verification step.
  - Acceptance: the P-01 and P-02 results are recorded, whether they are met or not.

- [ ] **34.2** Add Playwright flows over the seeded database:
  - latest articles → details → original link;
  - search with filters;
  - categories and technologies;
  - bookmark and read state persisting;
  - the archive;
  - the status page showing failures.
  - Test: each flow passes.
  - Acceptance: all of them run as part of `yarn test:e2e`.

- [ ] **34.3** Add an end-to-end test of the collector: the fixture feed server from 8.4, then `news:sync` with the `fake` provider on a temporary database, then the dashboard showing the results, including per-source coverage. A second run adds 0 rows.
  - Test: the test passes with networking limited to localhost.
  - Acceptance: it proves that the collector and the dashboard work together without the internet.

- [ ] **34.4** Extend `yarn verify` (created in 2.4) with the collector end-to-end test from 34.3, and confirm it covers the full suite.
  - Test: a deliberately failing collector end-to-end test makes `yarn verify` fail.
  - Acceptance: `yarn verify` passes on the clean repository and runs every test suite.

**Manual verification:** Run `yarn verify` in a fresh terminal and read the output.

**Status:** Not started.

### Chunk 35 — Documentation completion

**Goal:** Documentation that lets David set up, run, troubleshoot and maintain DevPulse.

**Difficulty:** Intermediate

**Dependencies:** 34

**Spec must resolve:** N-13 (OPERATIONS documents the recovery procedure for a crashed or stuck deployment).

- [ ] **35.1** Update the README with setup, scripts, usage and the current status.
  - Test: follow the setup section on a clean checkout.
  - Acceptance: no step is missing.

- [ ] **35.2** Write `docs/OPERATIONS.md`, covering:
  - registering and removing the scheduled task;
  - updating the live checkout with `yarn live:update`, and what to do if a rollback fails;
  - manual runs, including `--week` retries;
  - logs;
  - database backups and how their retention works;
  - troubleshooting;
  - adding a source;
  - changing the provider.
  - Test: each procedure has been carried out at least once on David's PC, or is marked as not yet done.
  - Acceptance: the troubleshooting section covers every error message the app can show.

- [ ] **35.3** Bring REQUIREMENTS and ARCHITECTURE in line with what was built, and complete the decision log.
  - Test: every AD and OD item has a final status.
  - Acceptance: no document describes behaviour that the code does not have.

**Manual verification:** David reads the README and OPERATIONS.

**Status:** Not started.

### Chunk 36 — Final integration and verification

**Goal:** Prove that DevPulse works end to end on David's PC, with real sources, the real schedule and, if one is approved, the real provider.

**Difficulty:** Advanced

**Dependencies:** 27, 30, 32, 35. Chunk 32 also counts as satisfied when it is `Skipped (OD-01)` because David declined a provider. Decision before completion: OD-03, needed before task 36.2.

- [ ] **36.1** Set DevPulse up from a fresh clone, using only the README.
  - Test: `yarn verify` passes on the fresh clone.
  - Acceptance: no undocumented step was needed.

- [ ] **36.2** **Go-ahead at execution time.** Needs OD-03 resolved and retention active in the live checkout (AD-32). Stop and ask David for explicit approval, because this run uses real sources and possibly a paid provider. Deploy the final build to the live checkout with `yarn live:update` (separate go-ahead), then run a real collection there and review the results in the dashboard.
  - Test: the run record shows `succeeded`, or `partial` with per-source coverage reasons.
  - Acceptance: the articles appear with real simplification if a provider is approved, or as pending otherwise.

- [ ] **36.3** **Go-ahead at execution time.** Stop and ask David for explicit approval before the sleep test. Then, with the final build in the live checkout on real Windows:
  - observe at least one real Monday 08:00 MYT scheduled run;
  - repeat the sleep-across-trigger scenario from task 30.3.
  - Test: run records and Task Scheduler history exist for both.
  - Acceptance: the outputs and dates are recorded.

- [ ] **36.4** Finish with these steps:
  1. run retention against seeded old data, on a copy of the development database;
  2. only if OD-01 was approved, confirm real simplification with the approved provider; if it was declined, record FR-SIM-02…07 as unmet by decision;
  3. run `yarn verify`;
  4. finalize the roadmap.

  - Test: the cleanup counts match what was expected, and `yarn verify` passes.
  - Acceptance: the progress summary shows the final state. If OD-01 is deferred rather than decided, this chunk cannot be completed.

**Manual verification:** David uses DevPulse for one real week. If David declines a provider, this chunk runs with `none`, FR-SIM-01…08 are recorded as unmet by decision, and DevPulse is not feature-complete.

**Status:** Not started.

---

## Decisions blocking ⛔ chunks

The details of each decision are in [REQUIREMENTS.md](REQUIREMENTS.md). Record each answer in the decision log. A ⛔ chunk may start, and a "before completion" chunk's Status may be set to `Complete.`, only once its decision is resolved under the Decision status rule in `.claude/skills/chunk-workflow/SKILL.md`. A recommendation, a Proposed entry or a Deferred entry does not count.

| Decision | Gate | Chunks | Needed by |
| --- | --- | --- | --- |
| OD-01 AI provider, model, budget, content permission | ⛔ | 31, 32 (prepared in 16) | Phase 9 |
| OD-02 Content used for simplification and retries | ⛔ | 31 (prepared in 16) | Phase 9 |
| OD-03 Sources and public APIs | ⛔ / before completion | ⛔ 12; before completion of 30 (needed before tasks 30.3–30.5) and 36 (needed before task 36.2); also the first real-source run in Chunk 11 | Phase 3 |
| OD-04 Meaning of "two months" | ⛔ | 27 | Phase 7 |
| OD-05 Bookmark deletion at expiry | ⛔ | 27; also live collection (AD-32) | Phase 7 |
| OD-06 Show articles not yet simplified | Before completion | 18 | Phase 5 |
| OD-07 Dashboard "Run collection now" button | ⛔ | 28 (optional) | Phase 7 |
| OD-08 Categories, roles, category assignment | Before completion | 13, 21 | Phase 4 |
| OD-09 Extra triggers for missed runs | Before completion | 30 | Phase 8 |
| OD-10 Task run mode, password, wake | Before completion (needed before task 29.4; informed by 29.3) | 29 | Phase 8 |
| OD-11 Late or back-dated articles | Before completion | 9, 30 | Phase 3 |
| OD-12 Collection frequency | Before completion (needed before task 29.4) | 29 | Phase 8 |
| OD-13 PowerShell wrapper | Before completion (needed before task 29.4) | 29 | Phase 8 |
| OD-14 Opening an article marks it read | Before completion | 22 | Phase 6 |
| OD-15 External AI code review | Governs every chunk's review step | All (until resolved: self-review) | Before the first chunk review |
| OD-16 "Expires soon" hint | Only the conditional hint in 27.5 | 27.5 (never blocks 27, retention or collection) | Phase 7 |
| OD-17 Real-source checks before retention exists | Before completion (needed before the check) | 11 (real-source check), 32 (task 32.3) | Phase 3 |
| OD-18 What "cleanup must succeed" covers | Before completion | 27, 29 | Phase 7 |
| OD-19 Where catch-up starts | Before completion | 30 | Phase 8 |
| BL-01 Planning baseline approval | Roadmap start | 1 | Before Chunk 1 |

| Assumption | Gate | Chunks |
| --- | --- | --- |
| A-01 Previous calendar week | Confirm before completion | 7, 9, 23, 30 |
| A-02 What counts as a duplicate | Confirm before completion | 10 |
| A-03 Single user | Confirm before completion | 5, 22 |
| A-04 Dashboard on localhost, started when needed | Confirm before completion | 17 |
| A-05 English-language sources | Confirm before completion | 6 |
| A-06 Weekly volume | Confirm before completion | 16, 34 |

Approving the planning documents (BL-01) approves only the planning baseline, and lets Chunk 1 start. It does **not** confirm assumptions A-01…A-06, approve any Proposed item (AD-NN, P-NN) or resolve any open decision. Assumptions stay assumptions until David explicitly confirms each one in the decision log. Proposed items and open decisions follow the Decision status rule in `.claude/skills/chunk-workflow/SKILL.md`.

## Carried review findings

These findings come from the independent review of r3 (an AI subagent on the same provider as the development assistant). Each is carried to the chunk(s) whose spec must resolve it, on that chunk's `**Spec must resolve:**` line. A chunk can't be `Complete.` until each of its items is resolved and verified. An item can only be dropped through a decision-log row of Type `Carried finding`.

| Finding | Owning chunk(s) | What the spec must decide or verify |
| --- | --- | --- |
| N-03 | 29 | Every deployment step can run under the guards it holds |
| F2 (with N-03, N-12) | 4, 29 | The handoff design: in-process, or a subprocess of the new commit with its own authorisation channel |
| N-04 | 29 | Deploy from outside the live tree; build the dashboard during deploy and rollback |
| N-06 | 5 | Coverage stored per source per week; week-state rule; coverage across runs; "enabled" at run time or now |
| N-07 | 9 | Reach-back is a heuristic; outlier dates ignored; edge-case tests |
| N-08 | 11, 29, 33 | How a run refused before the database opens is recorded |
| N-09 | 26 | Which statuses count as success for the overdue warning; a separate trigger for test tasks |
| N-10 | 29, 30 | Network wait clearly shorter than the time limit; whether the child process is killed too |
| N-12 | 4 | The maintenance-marker exception (ARCHITECTURE, "Mandatory requirements for later specs") |
| N-13 | 29, 35 | Recovery from a crashed or stuck deployment, and its documented procedure |
| N-14 | 27, 29 | Manifest vs OD-05 "keep bookmarks"; backup cap before Chunk 27; short rollback window; read-only open of failed-deployment databases |
| N-16 | 5, 6, 11, 14, 16, 25, 26, 27, 29 | Forward references, each listed on its chunk's line |
| N-17 | 1, 29 | Yarn without the Corepack shim, in bootstrap and in the wrapper |
| N-20 | 1, 29 | Ignore set and files rewritten by install, build and dev; clean live tree |
| N-22 | 30 | Where catch-up starts (with OD-19) |
| F15 | 29, 30 | Live checks need code that isn't on `main` yet |
| L-g | 29 | Different ports for the development and live dashboards |
| L-h | 29 | `SQLITE_BUSY` tested in both directions |
| L-k | 26 | A refusal record must not hide the run in progress |

## Coverage matrix

| # | Coverage item | Chunks |
| --- | --- | --- |
| 1 | Project initialization | 1 |
| 2 | Development environment and dependencies | 1, 2, 4 |
| 3 | Application structure | 3 |
| 4 | SQLite and Drizzle ORM | 4 |
| 5 | Database schema and migrations | 5 |
| 6 | News source configuration | 6 |
| 7 | RSS/Atom fetching | 8 |
| 8 | Article extraction | 9 |
| 9 | Article validation | 9 |
| 10 | Duplicate prevention | 10 |
| 11 | Article processing pipeline | 11, 14 |
| 12 | Simplification provider architecture | 13 |
| 13 | External AI provider selection and integration (approval required) | 16, 31, 32 |
| 14 | Simplification validation | 13, 14 |
| 15 | Article storage | 11, 14 |
| 16 | Failed processing and retry | 15 |
| 17 | Dashboard layout | 17 |
| 18 | Latest articles | 18 |
| 19 | Article details | 19 |
| 20 | Search and filters | 20 |
| 21 | Categories and technologies | 21 |
| 22 | Difficulty filtering | 20 |
| 23 | Bookmarks and read/unread status | 22 |
| 24 | Weekly archive | 23 |
| 25 | Manual collection | 11, 25, 28 (optional) |
| 26 | Collection status and logs | 26 |
| 27 | Windows Task Scheduler | 29 |
| 28 | Weekly collection and timezone handling | 7, 29 |
| 29 | Missed-run recovery | 30 |
| 30 | Two-month retention and cleanup | 27 |
| 31 | Automated tests | 2, every chunk, 34 |
| 32 | End-to-end tests | 2, 34 |
| 33 | Error handling and reliability | 8, 14, 24, 33 |
| 34 | Documentation | every chunk, 35 |
| 35 | Final integration and verification | 36 |

Permitted public APIs are covered by Chunk 12.

## Requirement traceability

| Requirement | Chunks |
| --- | --- |
| FR-COL-01 | 7, 29, 36 |
| FR-COL-02 | 7, 9, 30 |
| FR-COL-03 | 3, 11, 29 |
| FR-COL-04 | 11, 25, 28 (optional) |
| FR-COL-05 | 6, 8, 12 |
| FR-COL-06 | 8, 11, 33 |
| FR-COL-07 | 10 |
| FR-SIM-01 | 9, 19 |
| FR-SIM-02 | 13, 14, 31, 32 |
| FR-SIM-03 | 13, 14, 31, 32 |
| FR-SIM-04 | 13, 14, 31, 32 |
| FR-SIM-05 | 13, 14, 31, 32 |
| FR-SIM-06 | 13, 14, 21, 31, 32 |
| FR-SIM-07 | 13, 14, 20, 31, 32 |
| FR-SIM-08 | 9, 19 |
| FR-SIM-09 | 14 |
| FR-SIM-10 | 14, 15 |
| FR-SIM-11 | 16, 31 |
| FR-DATA-01 | 4, 5 |
| FR-DATA-02 | 5, 11, 14 |
| FR-DATA-03 | 5, 9, 15 |
| FR-DATA-04 | 27 |
| FR-DATA-05 | 27 |
| FR-DATA-06 | 5, 10 |
| FR-DATA-07 | 11, 14, 27 |
| FR-DASH-01 | 18 |
| FR-DASH-02 | 20 |
| FR-DASH-03 | 21 |
| FR-DASH-04 | 20 |
| FR-DASH-05 | 19 |
| FR-DASH-06 | 19 |
| FR-DASH-07 | 23 |
| FR-DASH-08 | 22 |
| FR-DASH-09 | 22 |
| FR-DASH-10 | 26 |
| FR-DASH-11 | 26 |
| FR-DASH-12 | 7, 26 |
| FR-DASH-13 | 26 |
| FR-AUTO-01 | 29 |
| FR-AUTO-02 | 29 |
| FR-AUTO-03 | 7, 29 |
| FR-AUTO-04 | 29 |
| FR-AUTO-05 | 3, 29 |
| FR-AUTO-06 | 24, 29 |
| FR-AUTO-07 | 30 |
| FR-AUTO-08 | 11, 26 |
| FR-AUTO-09 | 24, 30, 33 |
| TR-01 | 1 |
| TR-02 | 1, 2 |
| TR-03 | 1, 3 |
| TR-04 | 3 |
| TR-05 | 4 |
| TR-06 | 4, 5 |
| TR-07 | 3, 11 |
| TR-08 | 6, 8, 12 |
| TR-09 | 29, 30 |
| TR-10 | 2 |
| TR-11 | 2, 34 |
| TR-12 | 1 |
| TR-13 | 2, every chunk |
| TR-14 | every chunk (CLAUDE.md approval rules) |
| NFR-01 | 4, 17, every chunk |
| NFR-02 | 16, 32, every chunk |
| NFR-03 | 16, 31 |
| NFR-04 | every chunk |
| NFR-05 | 13, every chunk |
| NFR-06 | every chunk |
| NFR-07 | every chunk (decision log) |
| NFR-08 | 29, 30, 36 |
| NFR-09 | 29, 30 |

## Change log

| Date | Change |
| --- | --- |
| 2026-11-03 | Roadmap created from planning plan r2 (`docs/superpowers/plans/2026-11-03-devpulse-planning-docs.md`). |
| 2026-11-03 | Approval wording clarified: approving the planning documents approves only the baseline and lets Chunk 1 start, and gates now require a *resolved* decision under the Decision status rule. No requirements, assumptions, decisions or scope changed. |
| 2026-11-03 | Revision r3, from the accepted independent review (record: `docs/superpowers/plans/2026-11-03-devpulse-planning-r3.md`): BL-01 baseline gate; Chunk 1 rewritten for the existing folder; dependency fixes (9, 10, 13, 16, 17, 27, 32, 36); new tasks 8.4, 27.5 and 31.4; Chunk 29 reshaped around a live checkout; source coverage and `no_sources`; in-run retries and a connectivity wait; privacy and content-leak rules; Windows-realistic lock, file and scheduling criteria; "Confirm before completion" assumption gates; new Pending decisions OD-11…OD-15 and wider OD-09 options. The weekly schedule, the retention period and the product scope are unchanged, and no decision is recorded as made. |
| 2026-11-03 | Revision r4, from the independent review of r3 (record: `docs/superpowers/plans/2026-11-03-devpulse-planning-r4.md`). Both reviews were AI subagents on the same provider as the development assistant. Changes: Chunk 1 runs its baseline commit before any baseline edit, scaffolds outside the repository with privacy first, and pins the toolchain after `package.json` exists; `yarn verify` moves to 2.4; live collection waits for verified retention (AD-32, `retention_inactive`, `retention_cleanup_failed`); Chunk 30's OD-03 and Chunk 27 conditions cover tasks 30.3–30.5; go-aheads for 6.3 and 29.2; `**Spec must resolve:**` lines and the "Carried review findings" section; new Pending decisions OD-16…OD-19; wording and label fixes. Task count unchanged at 130; the ⛔ set is unchanged. No decision is recorded as made. |
| 2026-11-04 | Chunk 1 executed: repository and baseline commit, Next.js 16.4.4 scaffold, Node.js 24.13.0 and Yarn 4.12.0 pinned, install, telemetry off through `.env.yarn`, `127.0.0.1` binding. Execution decisions D1–D6 and F1–F5 are recorded in the Chunk 1 plan's execution record. Self-review, not independent (OD-15 Pending). |
| 2026-11-06 | Chunk 2 executed on the branch `chunk-02-quality-tooling` (not merged): Prettier, markdownlint, Vitest and Playwright, with the scripts `typecheck`, `lint:md`, `format`, `format:check`, `test`, `test:e2e`, `check` and `verify` (commits 7ec2ca1, 6c75c0a, a60c907, 53ab420 and 6d412cb). Task 2.1 reworded: the acceptance check is `yarn format:check` (AD-36) and `typecheck` is `next typegen && tsc --noEmit` (AD-39). One formatting-only commit (b6b64ac, AD-40) touched the Chunk 1 file `scripts/check-node.mjs`, and markdownlint formatting-only fixes were made to the planning-r2 plan (f1bac66, AD-38, AD-43). The five devDependencies are `prettier`, `markdownlint-cli2`, `vitest`, `@playwright/test` and `vite`, pinned exactly (AD-41). Playwright runs in the installed Google Chrome instead of a downloaded browser (AD-42). A permanent UTC test was added to Task 2.2 at David's request (a60c907). Decisions AD-36…AD-43 are in the decision log. The status stays `In progress.` until David's manual verification is recorded. Self-review, not independent (OD-15 Pending). |
| 2026-11-06 | Chunk 2 completed. David's manual verification (nine commands, all passed, run in Git Bash and cmd.exe on his Windows 11 PC) is recorded in the Chunk 2 note. The Definition of done is met: tasks 2.1 to 2.4 are done and committed, the tests, the type check and the acceptance criteria pass, the manual verification is recorded, the documentation is updated, and Chunk 2 has no decision or confirmation before completion and no `**Spec must resolve:**` item. The known limitations are preserved in the note. The README's outdated "no remote" statement is corrected (the remote `origin` exists), and the D-7 review status is updated in the Chunk 2 spec and plan. The branch `chunk-02-quality-tooling` is not merged. Self-review, not independent (OD-15 Pending). |
| 2026-11-06 | Documentation-only correction of outdated remote statements, since the remote `origin` exists: AD-20 in `docs/ARCHITECTURE.md` (its status stays Proposed) and the "Commits and merges" rule in "How to use it". No push or other remote operation is authorized by this correction; future pushes, merges and remote changes still need David's explicit approval. |
