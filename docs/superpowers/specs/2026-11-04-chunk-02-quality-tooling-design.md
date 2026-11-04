# Chunk 2 — Quality tooling and test runners: design

**Status:** Approved by David on 2026-11-04 (chunk-workflow Step 4), after the Step 4 self-review revisions (H1, H2, M1–M3). Revised the same day after G-2a to add `vite` as a fifth devDependency (D-6, AD-41). The revision awaits David's review before G-2b.

**Roadmap:** [Chunk 2](../../IMPLEMENTATION_ROADMAP.md#chunk-2--quality-tooling-and-test-runners). **Plan:** [2026-11-04-chunk-02-quality-tooling.md](../plans/2026-11-04-chunk-02-quality-tooling.md).

## 1. Goal and scope

**Goal (roadmap):** "The lint, format, type-check, unit-test and end-to-end-test commands that every later chunk uses."

**In scope:** exactly tasks 2.1–2.4.

**Out of scope** (later chunks or not planned):

- the config module, `yarn news:sync`, the ESLint rule banning `next` imports from `scripts/` and `src/lib/`, shadcn/ui and the folder-layout update (Chunk 3);
- SQLite, Drizzle and the temporary-database test helper (Chunk 4);
- any change to the app's UI, metadata or page title (the title changes in Chunk 17);
- Playwright against a seeded database (no database exists yet; Chunk 18 adds seeding);
- a test that blocks outbound requests during E2E runs (Chunk 34);
- adding a format check to `yarn check` (the roadmap's 2.4 order doesn't include one);
- any CI, remote, push or merge.

## 2. Requirements covered

From the roadmap's Requirement traceability table:

| Requirement | Chunks | What Chunk 2 delivers |
| --- | --- | --- |
| TR-02 TypeScript | 1, 2 | `yarn typecheck` (`tsc --noEmit`), run by `yarn check` |
| TR-10 Vitest | 2 | Vitest with the `@/*` alias and TZ-setting projects, run by `yarn test` |
| TR-11 Playwright | 2, 34 | Playwright (Chromium only) with a home-page smoke test, run by `yarn test:e2e` |
| TR-13 TypeScript checks pass before a chunk is marked complete | 2, every chunk | `yarn check` puts typecheck in every later chunk's verification |

Also relied on: NFR-04 (no unnecessary architecture or abstractions) and NFR-06 (no unrelated features). Coverage matrix items 2 (development environment and dependencies), 31 (automated tests) and 32 (end-to-end tests).

## 3. Task behaviour and acceptance criteria

Acceptance criteria are quoted from the roadmap. The one change of wording is in 2.1 and is explained there.

### 2.1 Prettier, `typecheck` and `lint:md`

- **Scripts:** `format` = `prettier --write .`; `format:check` = `prettier --check .`; `typecheck` = `next typegen && tsc --noEmit` (D-4); `lint:md` = `markdownlint-cli2`. `lint` stays `eslint`.
- **Why `typecheck` runs `next typegen` first (D-4).** `src/app/layout.tsx` uses the `LayoutProps` type, which is declared only in the generated `.next/types/routes.d.ts`. Plain `tsc --noEmit` passes only when an earlier build or `yarn dev` has left those files behind. On a clean checkout it fails. Next.js 16.4.4's `next typegen` generates the route types without a build. It runs through `yarn`, so `.env.yarn` keeps telemetry off (AD-35). The roadmap's "`typecheck` (`tsc --noEmit`)" wording is updated to match in Step 7.
- **Prettier scope.** Prettier formats code and config only. `.prettierignore` excludes `*.md` (markdownlint governs docs, and Prettier would rewrap the tables in the baseline docs), `.yarn/`, `yarn.lock`, `public/` and `.claude/`. `.claude/` holds David's personal `settings.local.json`, which only the global git ignore hides, and Prettier doesn't read that. Prettier 3 also skips whatever `.gitignore` lists. Prettier runs on its defaults, with no `.prettierrc`; `.editorconfig` already sets LF.
- **Existing code that fails `yarn format:check` (D-5).** It gets one formatting-only commit, `style: apply Prettier defaults`. That commit may touch Chunk 1 files, and is recorded in the change log. The known case is `scripts/check-node.mjs`, whose lines 5 and 10 are 90 and 87 columns, over Prettier's 80. Behaviour must not change: `node scripts/check-node.mjs` prints the same line before and after.
- **markdownlint scope.** `.markdownlint-cli2.jsonc` turns off MD013 (line length), because long lines are the house style. It sets `globs: ["**/*.md"]` (without globs the tool lints nothing) and `gitignore: true` and ignores `node_modules/**`, `.next/**` and `.yarn/**`. Every tracked Markdown file is linted, including the six baseline files and `docs/superpowers/`.
- **Existing violations (David's answer, 2026-11-04).** Formatting-only violations in existing docs are fixed without changing any wording, in their own commit. Stop and ask David before any fix that changes wording, and before turning off any rule other than MD013.
- **Why the acceptance wording changes.** Prettier's CLI writes files when `--write` and `--check` are combined (`src/cli/format.js`: with `--write`, a file that differs is written back even under `--check`). With `format` = `prettier --write .`, the roadmap's `yarn format --check` would rewrite files instead of only checking them. David chose separate `format` and `format:check` scripts, so the acceptance check is `yarn format:check`. The roadmap's 2.1 wording is updated to match in Step 7, and the change log records it.
- **Test (roadmap):** "a deliberate type error makes `yarn typecheck` fail, and a deliberate markdown error makes `yarn lint:md` fail; removing them makes both pass."
- **Acceptance (roadmap, reworded as above):** "`yarn lint`, `yarn lint:md`, `yarn format --check` [→ `yarn format:check`] and `yarn typecheck` all exit with code 0 on the clean repository."

### 2.2 Vitest

- **Config:** `vitest.config.mts`, Node environment, with the `@` alias resolved to `./src` through `fileURLToPath(new URL("./src", import.meta.url))`. That avoids adding `vite-tsconfig-paths`.
- **Projects (the roadmap's "Timezone-specific test runs are defined as Vitest projects that set `TZ` in the config"):**

  | Project | Includes | `TZ` |
  | --- | --- | --- |
  | `unit` | `src/**/*.test.ts`, except `**/*.tz.test.ts` (added to `configDefaults.exclude`, so Vitest's default excludes stay) | `UTC`, so ordinary tests don't depend on the PC's time zone |
  | `tz-kuala-lumpur` | `src/**/*.tz.test.ts` | `Asia/Kuala_Lumpur` |

  Chunk 7 adds further zones if its tests need them; each is one more project entry.
- **Naming:** unit tests sit next to their code as `*.test.ts`. `*.spec.ts` is reserved for Playwright under `tests/e2e/`, so the two runners never pick up each other's files. This matches the documented `tests/ fixtures/, e2e/` layout and adds no folder to it.
- **Sample test:** `src/app/layout.test.ts` imports `metadata` from `@/app/layout`, which proves the alias, and checks that `metadata.title` is a non-empty string. It doesn't pin the scaffold's title text.
- **Time-zone test (an addition to the roadmap's one sample test).** `src/vitest-time-zone.tz.test.ts` checks that the `tz-kuala-lumpur` project really runs with `Asia/Kuala_Lumpur` (resolved zone name and a UTC offset of −480 minutes). Two reasons to commit it rather than delete it:
  - it is the only test that proves the TZ mechanism the roadmap asks for;
  - without it the `tz-kuala-lumpur` project would be empty, which needs `passWithNoTests`, and that flag would also hide broken include patterns.
- **Script:** `test` = `vitest run` (never watch mode).
- **PowerShell and cmd.** The roadmap requires the time-zone projects to "work in PowerShell and cmd". `yarn test` is run once in each (`cmd /c yarn test` for cmd), and both must exit 0 with both projects passing.
- **Test (roadmap):** "the sample test fails when its assertion is inverted and passes when it is restored."
- **Acceptance (roadmap):** "`yarn test` exits with code 0."

### 2.3 Playwright

- **Config:** `playwright.config.ts`:
  - `testDir: "tests/e2e"`, one project (Chromium), `reporter: "list"`;
  - `use.baseURL` = `http://127.0.0.1:3100`, built from the named constant `E2E_PORT = 3100`;
  - `webServer.command` = `yarn build && yarn start --port 3100`, with `url` set to the same address and `reuseExistingServer: false`.
- **Why a production server on port 3100.** It never clashes with David's `yarn dev` on port 3000. It never reuses an unknown server: an Expo dev server was seen on this PC during Chunk 1. If the port is busy, Playwright fails loudly instead of testing the wrong app. Running through `yarn` keeps `.env.yarn`, so Next.js telemetry stays off (AD-35), and `yarn start` keeps `--hostname 127.0.0.1`.
- **Smoke test:** `tests/e2e/home.spec.ts` opens `/` and checks the exact title `Create Next App`. This is David's answer (2026-11-04): the app is unchanged in Chunk 2, and an exact title also catches a different app answering. Chunk 17 changes the title and updates this test.
- **ESLint:** `eslint.config.mjs` adds `playwright-report/**` and `test-results/**` to its global ignores. Both folders are already gitignored.
- **Script:** `test:e2e` = `playwright test`.
- **Test (roadmap):** "the smoke test opens the home page and checks the page title."
- **Acceptance (roadmap):** "`yarn test:e2e` exits with code 0 locally."

### 2.4 `yarn check` and `yarn verify`

- `check` = `node scripts/check-node.mjs && yarn typecheck && yarn lint && yarn lint:md && yarn test`. Yarn's portable shell runs `&&` the same way in PowerShell and cmd, so no `npm-run-all` is needed.
- `verify` = `yarn check && yarn test:e2e`.
- **Test (roadmap):** "a lint error makes `yarn check` fail, and a failing end-to-end test makes `yarn verify` fail."
- **Acceptance (roadmap):** "`yarn check` and `yarn verify` exit with code 0 on the clean repository."

## 4. Decisions

### Approved

- **AD-33**, Yarn 4.12.0 (decision log, 2026-11-03). `yarn check` relies on Yarn 4 answering, not Yarn 1 (see risk N2).
- **AD-35**, `.env.yarn` telemetry switch (decision log, 2026-11-03). The Playwright web server starts through `yarn` so that it applies.
- **AD-36**, format scripts: `format` and `format:check` (decision log, 2026-11-04; D-1).
- **AD-37**, the E2E smoke test checks the exact title `Create Next App` (decision log, 2026-11-04; D-2).
- **AD-38**, markdownlint with MD013 off and formatting-only fixes (decision log, 2026-11-04; D-3).
- **AD-39**, `typecheck` = `next typegen && tsc --noEmit` (decision log, 2026-11-04; D-4).
- **AD-40**, one formatting-only commit for existing code that fails `yarn format:check` (decision log, 2026-11-04; D-5).
- **AD-41**, the five devDependencies and their exact versions (decision log, 2026-11-04; D-6).

BL-01 and AD-34 don't affect this chunk.

### Proposed (relied on by this chunk)

- **AD-13:** tests use fixtures and mocked fetch, never the live network. The smoke test talks only to `127.0.0.1`.
- **AD-15:** specs and plans live under `docs/superpowers/`.
- **AD-17:** `markdownlint-cli2` as a supporting library (the roadmap names it under AD-17).
- **AD-18:** exact Node.js version, checked by `scripts/check-node.mjs`, now the first step of `yarn check`.
- **AD-28 / P-02:** telemetry off and `127.0.0.1` only.

### Assumptions

None. No assumption (A-01…A-06) is a gate for Chunk 2.

### David's decisions on this spec's questions

David answered these in the Claude Code session of 2026-11-04 (plan-mode questions, "E2E title", "Format cmd" and "MD lint"). They resolve no OD and confirm no assumption.

- **D-1, format commands:** `format` = `prettier --write .` and `format:check` = `prettier --check .`. The 2.1 acceptance check is `yarn format:check`.
- **D-2, E2E title:** check the exact current title `Create Next App`, with no app change.
- **D-3, existing markdownlint violations:** MD013 off. Fix formatting-only violations without changing wording, in their own commit. Ask before changing wording or turning off another rule.

David answered these in the Step 4 self-review questions of 2026-11-04 ("Typecheck" and "Format Ch1"):

- **D-4, `typecheck` script:** `next typegen && tsc --noEmit`.
- **D-5, existing code that fails `yarn format:check`:** one formatting-only commit, which may touch Chunk 1 files, with no behaviour change. It is recorded in the change log.

D-1…D-5 are recorded as AD-36…AD-40 (Q3).

David approved this one after G-2a on 2026-11-04 ("David approves adding `vite@8.3.5` as the fifth devDependency"):

- **D-6, devDependencies and exact versions:**
  - the five devDependencies are `prettier@3.9.10`, `markdownlint-cli2@0.24.0`, `vitest@5.1.0`, `@playwright/test@1.64.1` and `vite@8.3.5`, each pinned exactly and installed in one approved step (G-2b);
  - **why `vite` is needed:** Vitest 5 declares `vite` as a non-optional peer dependency (`peerDependenciesMeta.vite.optional: false`, accepted range `^6.4.0 || ^7.0.0 || ^8.0.0`). Vitest uses Vite to transform and run test files, so the peer must be installed. `vite@8.3.5` is MIT-licensed and needs Node.js `^20.19.0 || >=22.12.0`, which 24.13.0 meets;
  - recorded as AD-41.

### Open questions for David

David answered Q1–Q3 on 2026-11-04, when he approved this spec and the plan: all three are **approved**.

- **Q1, new devDependencies.** May Chunk 2 add these four? All are free and open source:
  - `prettier` (named in roadmap 2.1);
  - `markdownlint-cli2` (roadmap 2.1, AD-17);
  - `vitest` (locked stack, TR-10);
  - `@playwright/test` (locked stack, TR-11).

  Nothing else is added: no `eslint-config-prettier` (the Next.js ESLint configs have no formatting rules), no `vite-tsconfig-paths`, no `npm-run-all`. Recommendation: approve.

  **Updated after G-2a (D-6):** a fifth devDependency, `vite`, is added because Vitest 5 declares it as a non-optional peer dependency. David approved it on 2026-11-04. The list is now five packages.
- **Q2, version rule.** Use the latest stable version of each, looked up at execution time from registry metadata only (G-2a) and pinned exactly (`--exact`), like `next` and `react`. Recommendation: approve. The exact versions are recorded in the verification note. G-2a (2026-11-04) found these latest stable versions: `prettier` 3.9.10, `markdownlint-cli2` 0.24.0, `vitest` 5.1.0, `@playwright/test` 1.64.1 and `vite` 8.3.5 (D-6).
- **Q3, recording D-1…D-5.** Chunk 1 recorded David's spec decisions as new decision-register entries with one decision-log row each (AD-33…AD-35). Should D-1…D-5 be recorded the same way, as **AD-36…AD-40**, on `chunk-02-quality-tooling` right after the branch is created? Recommendation: yes, because CLAUDE.md says David's decisions go in the decision log.
- **Q4, untracked third-party files: closed.** `.agents/skills/code-review/` and `skills-lock.json` appeared untracked on 2026-11-04. David removed them the same day, and both were checked as absent. Nothing is left to decide, and the number is kept so that references stay stable.

## 5. Blockers, risks and decisions before completion

**Blockers:**

- Dependencies are satisfied (Chunk 1 is `Complete.`). There is no ⛔ gate, no "Decision before completion" and no "Confirm before completion".
- This spec, the plan and Q1–Q3 were approved on 2026-11-04. Implementation now waits only for the go-aheads below.
- The Chunk 2 branch starts from `main` at `23f9134`, which already contains the restored CLAUDE.md sections (merged with David's approval on 2026-11-04).

**Go-aheads at execution time.** CLAUDE.md says tooling downloads are "governed by their own go-aheads", so each one asks David first:

| ID | Task | What goes over the network |
| --- | --- | --- |
| G-2a | 2.1 | Registry metadata only: `npm view <package> version` for the four packages, plus each one's README to check for telemetry. Nothing is downloaded or run. **Done 2026-11-04.** It also found Vitest's `vite` peer dependency, and `vite` was then looked up the same way (D-6). |
| G-2b | 2.1 | `yarn add --dev --exact` of the five exact versions in D-6 (AD-41), in one step (downloads the packages and their dependencies) |
| G-2c | 2.3 | Only if the installed Playwright needs a Chromium build that isn't already in `%LOCALAPPDATA%\ms-playwright` (today: `chromium-1223` and `chromium-1228`, with headless shells): `yarn playwright install chromium` |

**Risks:**

- **R-18** (content leaks through review). The review stays a self-review, not independent, while OD-15 is Pending. No reviewer subagents and no other AI review tool.
- **N1, existing docs break markdownlint.** Handled by D-3.
- **N2, `yarn check` name collision.** `check` is a Yarn 1 built-in, and Yarn 1.22.22 is second on PATH. Mitigation: Task 4 checks that `yarn check` prints `check-node.mjs`'s "matches" line. If Yarn 1 answers, stop and ask.
- **N3, importing `layout.tsx` in Vitest.** It imports CSS and is a TSX file. Vitest returns empty CSS by default and transforms TSX. If the import still fails, stop and propose a pure-TypeScript sample; don't improvise.
- **N4, `test.env` not reaching `TZ` in time.** Node resets its time-zone cache when `process.env.TZ` is assigned, and the time-zone test proves it. If it fails, fall back to a per-project setup file that sets `TZ`, which still lives in the config, and record it.
- **N5, port 3100 busy.** `reuseExistingServer: false` makes Playwright fail loudly. Check the port before the first run.
- **N6, `next build` while `yarn dev` runs.** Next.js 16 keeps dev output in `.next/dev`, apart from the build. Verify once, with David's dev server stopped first if it is running.
- **N7, Playwright browser revision.** A missing revision needs G-2c.
- **N8, untracked third-party files: resolved** (Q4 closed; David removed them on 2026-11-04).
- **N9, automatic AI review by the `security-guidance` plugin.** Its Stop diff review and its commit and push reviewer send code to an external model, which OD-15 forbids while it is Pending. Its local pattern warnings send nothing.
  - **David's decision (2026-11-04):** the plugin is off for DevPulse through `.claude/settings.local.json`, and the user-level setting stays on.
  - **When it applies:** plugins load when a session starts, so the setting covers only sessions started after it.
  - **The live checkout** has no such file and needs its own disable before any Claude Code session runs there (Chunk 29).
  - **Mitigation:** before each Chunk 2 commit, check that the setting is still `false`. After each commit, check that the plugin log has no "Commit review: detected" line at that time. If a review fires, stop and report.
- **N10, ESLint warnings don't fail `yarn lint`.** In the resolved config (`eslint --print-config`), `no-debugger` isn't set and `@typescript-eslint/no-unused-vars` is a warning (1). A lint probe must use an error-level rule, such as `@typescript-eslint/no-explicit-any` (2), which CLAUDE.md also forbids.
- **N11, a leftover `next start` on port 3100 after an E2E run on Windows.** After each run, check that nothing still listens on port 3100. A leftover process would make the next run fail loudly (`reuseExistingServer: false`); it would never silently be reused.

**Decision before completion:** none.

## 6. Spec must resolve

None. Chunk 2 has no `**Spec must resolve:**` line, and no carried finding names it.

## 7. Manual verification plan

In a fresh terminal of David's own (PowerShell), run each of these once and read the output:

- `yarn typecheck`
- `yarn lint`
- `yarn lint:md`
- `yarn format:check`
- `yarn test`
- `cmd /c yarn test` (the roadmap's "PowerShell and cmd")
- `yarn test:e2e`
- `yarn check`
- `yarn verify`

Record the date, each command, its exit code and a short excerpt in the italic note under Manual verification. Also record what was *not* checked, for example cmd.exe if only PowerShell was used.
