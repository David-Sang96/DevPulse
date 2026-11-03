# Chunk 1 — Repository and toolchain initialization: design

**Status:** Draft, waiting for David's approval (chunk-workflow Step 4). Nothing in this spec has been executed.

**Roadmap:** [Chunk 1](../../IMPLEMENTATION_ROADMAP.md#chunk-1--repository-and-toolchain-initialization). **Plan:** [2026-11-03-chunk-01-toolchain.md](../plans/2026-11-03-chunk-01-toolchain.md).

## 1. Goal and scope

**Goal (roadmap):** "A local git repository whose first commit is the approved planning baseline, a pinned and private Node.js and Yarn toolchain, and a Next.js app scaffolded into the existing folder without touching the baseline files."

**In scope:** exactly tasks 1.1–1.5.

**Out of scope** (later chunks): quality tooling, `yarn check`, `yarn verify`, Vitest and Playwright (Chunk 2); shadcn/ui and the application structure (Chunk 3); SQLite and Drizzle (Chunk 4); any `news:sync` code; any Windows setting or scheduled task; any remote or push.

## 2. Requirements covered

From the roadmap's Requirement traceability table:

| Requirement | Chunks | What Chunk 1 delivers |
| --- | --- | --- |
| TR-01 Next.js App Router | 1 | The scaffolded App Router app |
| TR-02 TypeScript | 1, 2 | TypeScript with `"strict": true` |
| TR-03 Tailwind CSS v4 | 1, 3 | Tailwind CSS v4, configured by the scaffold |
| TR-12 Yarn is the package manager | 1 | Yarn 4, committed as a release file |

Coverage matrix items 1 (project initialization) and 2 (development environment and dependencies, with Chunks 2 and 4).

## 3. Task behaviour and acceptance criteria

Acceptance criteria are quoted from the roadmap.

### 1.1 Pre-flight and baseline commit

Check BL-01 and the hashes; `git init -b main` with no remote; add `.gitattributes`, `.editorconfig` and `.gitignore`; make the baseline commit on `main`; check every committed baseline blob against its recorded hash; create `chunk-01-toolchain` and append the commit hash to `docs/BASELINE.md` there.

- **Test:** "before committing, the hashes match; after committing, every committed baseline blob matches its recorded hash; a dummy file in `data/` and a `.env.local` don't appear as untracked, while a `.env.example` does."
- **Acceptance:** "`git log` shows the baseline commit first, `git remote -v` prints nothing, and `docs/BASELINE.md` records the commit hash on `chunk-01-toolchain`."

**Contents of the first commit** (roadmap 1.1, and REQUIREMENTS "Baseline approval procedure"): the six baseline files, `docs/BASELINE.md`, `docs/superpowers/` (the r2, r3 and r4 records, this spec and its plan), `.claude/skills/`, `.gitattributes`, `.editorconfig` and `.gitignore`. Nothing else exists in the folder today.

**Line endings.** This PC's system git config has `core.autocrlf=true`. `.gitattributes` (`* text=auto eol=lf`) must exist before the first `git add`, so blobs and working files stay LF. The blob check proves it.

**Existing repository.** If the project already has a `.git`, or sits inside another git repository, Task 1 stops and asks David. It never reuses, repairs or reinitializes a repository.

**Ignore test.** The roadmap's ignore test runs in an isolated temporary repository (`$TMP/ignore-test`) with a copy of the project's `.gitignore`, so it never creates, overwrites or deletes a project file.

- The test folder is created only if nothing exists at that path.
- If any later command fails, exactly that folder is removed.
- `$TMP`, and anything that existed before, is never deleted.

### 1.2 Scaffold outside the repository, privacy first

Run `create-next-app` non-interactively in a temporary folder outside the repository, list every emitted file, remove `next/font/google`, drop the scaffold's README and any `AGENTS.md`, `CLAUDE.md` or `.yarnrc.yml`, then copy into the repository only files that don't already exist. No install and no build.

- **Test:** "the list of emitted files is recorded; no tracked file changed (`git status` shows only additions plus the hand-merged `.gitignore`); no `next/font/google` remains."
- **Acceptance:** "`package.json` is named `devpulse`, `tsconfig.json` has `"strict": true`, Tailwind v4 is configured, and the `@/*` alias is set."

**Fonts.** The scaffold's layout imports Geist through `next/font/google`, which fetches from Google at build time. The import and its CSS variables are removed, so Tailwind v4's default system font stacks apply. No font files are added.

**Package manager during the scaffold.** `create-next-app` is invoked with `npx`, so it never calls the `yarn` command (the Corepack shim). With `--skip-install`, no lockfile is produced. Yarn takes over in 1.3 and 1.4.

### 1.3 Pin the toolchain

Exact Node.js version in `engines` and `.nvmrc`; a plain-JavaScript `scripts/check-node.mjs`; Yarn 4 committed as a release file (`yarnPath`); `packageManager` as section 6.1 decides; `.yarnrc.yml` with `nodeLinker: node-modules` and `enableTelemetry: false`.

- **Test:** "the version check passes on the pinned version and fails with a clear message on any other; `node .yarn/releases/yarn-4.*.cjs -v` and `yarn -v`, in the repository in a fresh shell, report the committed release."
- **Acceptance:** "`yarn config get enableTelemetry` prints `false`, and no Corepack prompt or download happens."

**Versions (AD-18: "the Chunk 1 spec confirms the exact versions").**

| Tool | Version | Source |
| --- | --- | --- |
| Node.js | 24.13.0 | Installed on this PC through nvm-windows (`node -v`, 2026-11-03) |
| Yarn | 4.12.0, approved by David (Q1) | Corepack's last-known-good Yarn on this PC, already in its cache |
| Next.js, React, Tailwind CSS, ESLint, TypeScript | Whatever the latest stable `create-next-app` emits; that exact version is looked up at G-1a and run only after G-1b (Q2, approved by David) | Pinned by `yarn.lock` after 1.4 |

**`check-node.mjs` behaviour.** It reads `engines.node` from the `package.json` next to its own folder (not the current directory), and requires it to be an exact `x.y.z` version. It exits 0 and prints one line when `process.versions.node` equals that version. Otherwise it exits 1, with a message naming the expected and actual versions and the `nvm use <version>` command. A missing or non-exact `engines.node` is also exit 1, with its own message. It has no dependencies and no exports. Chunk 2 wires it into `yarn check`.

### 1.4 Install, then privacy checks, then the first build

`yarn install` with the committed release; Next.js telemetry disabled for every supported Next.js invocation, all of which go through Yarn, including the bare CLI `yarn next …` (section 6.3); dev and start bound to `127.0.0.1`; only then `yarn build`.

- **Test:** "`yarn next telemetry status` reports disabled; a search of the source and build output finds no `next/font/google` and no font or telemetry hosts; `git status --porcelain` is clean after install and build."
- **Acceptance:** "the dev server is not reachable from another device."

**Binding.** The `dev` and `start` scripts pass `--hostname 127.0.0.1`. Evidence: the listening socket on port 3000 has local address `127.0.0.1` only (`Get-NetTCPConnection`). A check from another device is offered to David as an optional manual check; it isn't needed, because a loopback-only socket can't accept connections from other devices.

**Clean tree.** See section 6.2: the first install and build may create or rewrite files. Those intended changes are committed in 1.4, and a second install-and-build cycle must then leave `git status --porcelain` empty.

### 1.5 Run, and check the baseline is untouched

- **Test:** "`yarn dev` serves the default page at `http://127.0.0.1:3000` with no console errors. Before the skill's Step 7, `git diff <baseline-commit> -- <six baseline files>` shows changes only to: Chunk 1's Status and progress-summary lines in the roadmap, and the "waiting for BL-01" status wording in README.md and CLAUDE.md."
- **Acceptance:** "everything after the baseline commit is on `chunk-01-toolchain`, ready for David's approval to merge."

**Allowed baseline edits before Step 7**, made when the chunk is set to `In progress.` (skill Step 5.3):

- roadmap: the Chunk 1 `**Status:**` line; the progress-summary rows "In-progress chunks" and "Last updated"; the "Roadmap start" bullet;
- README.md: the "waiting for David's baseline approval (BL-01)" sentence under "Development status";
- CLAUDE.md: the sentence "Chunk 1 starts only after David's baseline approval, BL-01."

**Decision records**, added right after that (plan Task 1, Step 12), as insertions only:

- ARCHITECTURE.md: three new decision-register rows, AD-33, AD-34 and AD-35, directly after AD-32;
- REQUIREMENTS.md: three new `Technical` decision-log rows for AD-33, AD-34 and AD-35, directly after the BL-01 row.

This widens the roadmap's 1.5 allow-list by exactly these six rows, as David required on 2026-11-03 ("DevPulse — Final Chunk 1 Review Corrections"). The BL-01 row and every other existing line stay unchanged. The six baseline hashes in `docs/BASELINE.md` describe the files before the baseline commit and aren't affected.

The allow-list is checked exactly (plan Task 5, Step 5). Each of the six files is rebuilt from the baseline commit plus only the allowed edits, and must match the working file byte for byte. ARCHITECTURE.md and REQUIREMENTS.md must also show three insertions each and no other change.

Everything else (task ticks, the manual-verification note, the change log, and README and CLAUDE facts that the scaffold makes stale) happens in Step 7, after this check.

## 4. Decisions

### Approved

- **BL-01**, planning baseline approved (decision log, 2026-11-03). It lifts only Chunk 1's start gate.

No other row exists in the decision log today. Once plan Task 1, Step 12 adds their rows, **AD-33, AD-34 and AD-35** (David's Q1–Q3 decisions, below) also count as Resolved. Nothing else below is approved.

### Proposed (relied on by this chunk)

- **AD-01:** one repository and package, two entry points.
- **AD-08 / P-02:** the dashboard is bound to `127.0.0.1`.
- **AD-15:** specs and plans live under `docs/superpowers/`.
- **AD-18:** exact Node.js version, checked by `check-node.mjs`; Yarn 4 as a committed release file; `nodeLinker: node-modules`; `enableTelemetry: false`.
- **AD-20:** local git only, with no remote.
- **AD-28 / P-02:** Yarn and Next.js telemetry off, local or system fonts, `127.0.0.1` only.

### Assumptions

None. No assumption (A-01…A-06) is a gate for Chunk 1.

### David's decisions on this spec's questions

David decided these in the message "DevPulse — Final Chunk 1 Spec and Plan Corrections" (2026-11-03). They resolve no OD and confirm no assumption.

**How they are recorded.** CLAUDE.md says David's decisions go in the decision log. A `Technical` row must name an existing Proposed item, and it approves the whole item it names. So each decision gets its own decision-register entry and one decision-log row: **AD-33 (Q1), AD-34 (Q2) and AD-35 (Q3)**. Rows on the existing items wouldn't be accurate:

- a row on AD-18 or AD-28 would approve all of that item, but David approved one detail of each;
- Q2 belongs to no existing item;
- two rows on one ID supersede each other.

The exact rows are fixed in plan Task 1, Step 12. They are added on `chunk-01-toolchain` right after the branch is created, so the baseline doesn't change before the baseline commit.

- **Q1 (AD-33), Yarn version: approved, Yarn 4.12.0.** Corepack already defaults to it on this PC and has it cached, so the shim never needs a download. No other version is used.
- **Q2 (AD-34), Next.js version: approved, the latest stable `create-next-app`, looked up at execution time.**
  - At G-1a, only the registry metadata is read, and David is shown the exact version and its relevant options.
  - Downloading and running that exact version needs the separate approval G-1b.
  - Its `--help` output must confirm every flag 1.2 needs; if any is missing, stop and ask.
- **Q3 (AD-35), `.env.yarn`: approved, committed with only `NEXT_TELEMETRY_DISABLED=1`, subject to the invocation boundary in section 6.3.** The roadmap's ignore rule `.env*` with `!.env.example` would hide it, so the ignore set adds `!.env.yarn`. The file never holds a secret; secrets stay in `.env.local`.

## 5. Blockers, risks and decisions before completion

**Blockers:** none. Chunk 1 has no dependencies, no ⛔ gate, no "Decision before completion" and no "Confirm before completion".

**Go-aheads at execution time.** None of Chunk 1's tasks is marked "Go-ahead at execution time" in the roadmap. However, CLAUDE.md says tooling downloads are "governed by their own go-aheads". So each download asks David first:

| ID | Task | What goes over the network |
| --- | --- | --- |
| G-1a | 1.2 | Registry metadata only: `npm view create-next-app version` (the latest stable version) and `npm view create-next-app@<exact> readme` (its documented options). Nothing is downloaded or run. David is shown the exact version and the relevant options. |
| G-1b | 1.2 | A separate approval to download and run that exact version: `npx --yes create-next-app@<exact>`, first with `--help`, then to scaffold |
| G-2 | 1.3 | `npm pack @yarnpkg/cli-dist@4.12.0` (downloads the Yarn release, integrity-checked by npm) |
| G-3 | 1.4 | `yarn install` (downloads the scaffold's dependencies from the npm registry) |

**Risks:**

- **R-07** (toolchain on Windows). Addressed by section 6.1 and the version pins.
- **New: CRLF in the baseline commit.** `core.autocrlf=true` would turn LF into CRLF on checkout if `.gitattributes` were missing. Mitigation: `.gitattributes` is written before `git add`, and the blob hashes and working-file carriage-return counts are checked after the commit.
- **New: Corepack auto-pin.** Without a `packageManager` field, Corepack may add one to `package.json` on the first `yarn` run in a shell that doesn't have `COREPACK_ENABLE_AUTO_PIN=0`. David's own shells don't have it (it isn't set at User or Machine level). Mitigation: section 6.1.
- **New: outbound requests from `next dev`.** The Next.js dev server may contact the npm registry, for example for a version check. This is unverified. Mitigation: 1.5 records the dev server's established outbound connections. Any connection to a host other than `127.0.0.1` is reported to David before the chunk is marked complete.
- **New: false positives in the host search.** Next.js framework chunks in `.next/` might contain font or telemetry host names as unused strings. If the 1.4 search finds a match, it is reported to David with its file, rather than passed or explained away.
- **New: the temporary folder resolving inside the repository**, through a junction, symbolic link or path alias. Mitigation: the plan's guard compares the physical paths (`fs.realpathSync.native`) of the repository and of the nearest existing folder on the temporary path, and stops if the temporary folder is inside the repository.
- **New: scaffold differences.** The scaffold's flags and emitted files depend on the exact version (Q2). The emitted-file list is recorded. An unexpected file that would overwrite a tracked one is never copied.

## 6. Spec must resolve

### 6.1 N-17, Chunk 1 part: Yarn without the Corepack shim

**Facts on this PC (read-only checks, 2026-11-03):**

- **`where yarn`:** first `C:\nvm4w\nodejs\yarn`, which is the Corepack shim (Corepack 0.34.5, bundled with Node.js 24.13.0). Second, `C:\Users\user\AppData\Roaming\npm\yarn`, a global Yarn Classic 1.22.22. In PowerShell, `yarn` resolves to `C:\nvm4w\nodejs\yarn.ps1`.
- **Corepack:** its last-known-good Yarn is 4.12.0; its cache holds Yarn 1.22.22, 4.9.2 and 4.12.0.
- **`COREPACK_ENABLE_AUTO_PIN=0`:** set in the assistant's shell, but not at User or Machine level.
- **PowerShell execution policy:** effectively RemoteSigned (CurrentUser), over LocalMachine AllSigned. Local, unsigned `.ps1` shims run.

**Resolutions:**

1. **Getting the Yarn release file.** At G-2, run `npm pack @yarnpkg/cli-dist@4.12.0` in a temporary folder outside the repository; npm checks the tarball's integrity against the registry. Copy its `package/bin/yarn.js` to `.yarn/releases/yarn-4.12.0.cjs`, and compare its SHA-256 with Corepack's cached `yarn.js` 4.12.0 (informational). If the tarball has no `package/bin/yarn.js`, stop and ask.
2. **`.yarnrc.yml` first.** It is written as soon as the release file exists, before any `yarn` command runs in the repository.
3. **`packageManager`: set it, to `yarn@4.12.0`, the same version as the committed release.** Why:
   - With the field present, Corepack has nothing to auto-pin, so `package.json` is never rewritten in David's shells.
   - Corepack runs its cached 4.12.0, which needs no download, and that Yarn hands over to `yarnPath`.
   - The committed file stays the release that actually runs. The Chunk 29 wrapper calls it by absolute path and doesn't use Corepack at all (N-17, Chunk 29 part).
4. **Environment for bootstrap commands** (1.2–1.4, set per command): `COREPACK_ENABLE_AUTO_PIN=0`, `YARN_ENABLE_TELEMETRY=0`, `NEXT_TELEMETRY_DISABLED=1` and `npm_config_update_notifier=false`. The telemetry check in 1.4 deliberately runs **without** `NEXT_TELEMETRY_DISABLED` (section 6.3).
5. **Verification on the real PC:**
   - in a fresh shell without the bootstrap variables, record `where yarn` and `corepack --version`;
   - `yarn -v` and `node .yarn/releases/yarn-4.12.0.cjs -v` both print `4.12.0`;
   - `yarn node -p "process.env.npm_execpath"` prints the path of `.yarn/releases/yarn-4.12.0.cjs`, which proves the committed release ran, not Corepack's copy;
   - with `COREPACK_ENABLE_NETWORK=0`, `yarn -v` still succeeds, which proves no download was needed;
   - afterwards, `git status --porcelain` is empty, so nothing was auto-pinned.

   David repeats `where yarn` and `yarn -v` in a new terminal of David's own, as part of the manual verification.

### 6.2 N-20, Chunk 1 part: ignore set and files rewritten by install, build and dev

1. **Ignore set**, written in 1.1 and merged by hand with the scaffold's `.gitignore` in 1.2:
   - `node_modules/`, `.next/`, `data/`;
   - `.env*` with `!.env.example` (and `!.env.yarn`, Q3);
   - Playwright output: `/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/`;
   - Yarn: `.yarn/*` with `!.yarn/releases`, `!.yarn/patches`, `!.yarn/plugins`, `!.yarn/sdks` and `!.yarn/versions`, plus `.pnp.*`;
   - the scaffold's own entries (for example `next-env.d.ts` and `*.tsbuildinfo`), recorded in the 1.2 file list.
2. **Files that install, build and dev create or rewrite.** Expected: `yarn.lock` and `.yarn/install-state.gz` from install; `.next/`, `next-env.d.ts`, and possibly edits to `tsconfig.json`, from build and dev.
   - The actual list is recorded in 1.4 by comparing `git status --porcelain` before and after.
   - Each one is either committed in 1.4 (`yarn.lock`, an intended `tsconfig.json` rewrite) or ignored (build output, generated type stubs, install state).
3. **Verification:** after the 1.4 commit, run `yarn install`, `yarn build` and a short `yarn dev` again. `git status --porcelain` must then print nothing.

### 6.3 Next.js telemetry method (task 1.4)

The roadmap asks the spec to pick and verify a reliable method, and prefers a per-project setting. `next telemetry disable` writes a per-user setting outside the project, so it isn't used.

**Fact:** David's per-user Next.js config (`%APPDATA%\nextjs-nodejs\Config\config.json`) has no `enabled: false`, so per-user telemetry is currently **on**. The per-project method must work alone.

**Approved method (Q3):** a committed `.env.yarn` containing only `NEXT_TELEMETRY_DISABLED=1`. Yarn 4 injects `.env.yarn` into every script and binary it runs (its `injectEnvironmentFiles` setting, default `.env.yarn?`).

**Invocation boundary.** `.env.yarn` is the project-level method for every supported Next.js invocation, and every supported invocation goes through Yarn:

- `yarn dev`;
- `yarn build`;
- `yarn start`;
- `yarn next …`, the bare Next.js CLI through Yarn.

Direct invocations outside Yarn, such as `npx next` or `node node_modules/next/dist/bin/next`, don't read `.env.yarn`, so it doesn't disable telemetry for them. They are not supported ways to run Next.js in this project.

**Verification:**

- run from a shell without `NEXT_TELEMETRY_DISABLED`;
- `yarn next telemetry status` reports disabled;
- the control, `node node_modules/next/dist/bin/next telemetry status` run outside Yarn, reports enabled, which proves `.env.yarn` is what disables it;
- running only the `status` command outside Yarn sends nothing.

**If the check fails,** the method is wrong: stop and bring the evidence to David. No other method is improvised.

The only direct invocation in this chunk is that control `telemetry status` check. CLAUDE.md's commands are all `yarn` commands.

## 7. Manual verification plan

From the roadmap: "Open the default page in a browser. In a fresh terminal, check the pinned versions and that telemetry is off."

1. **David opens the page:** `http://127.0.0.1:3000`, while `yarn dev` runs, and checks the browser console for errors.
2. **David checks a fresh terminal.** In a new terminal in the repository:
   - `node -v` prints `v24.13.0`;
   - `yarn -v` prints `4.12.0`;
   - `yarn config get enableTelemetry` prints `false`;
   - `yarn next telemetry status` reports disabled.
3. **The assistant records:** every command above, with its real output, the listening address on port 3000, and the dev server's outbound connections.

The italic note under Manual verification records the date, what was checked, and what was not.

Chunk 1 isn't a scheduling chunk, so the scheduling proof rule doesn't apply. No Windows setting is changed and no scheduled task is created.
