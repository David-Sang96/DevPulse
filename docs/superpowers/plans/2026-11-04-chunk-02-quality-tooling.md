# Chunk 2 — Quality tooling and test runners: implementation plan

> **Execution:** inline in this session, task by task, by the assistant itself. While OD-15 is unresolved, no implementer or reviewer subagents are dispatched (chunk-workflow skill, Steps 3 and 6). Steps use checkbox (`- [ ]`) syntax. David approved this plan and its spec on 2026-11-04, after the Step 4 self-review revisions. Each go-ahead (G-2a, G-2b, G-2c) still needs his separate approval when it comes up. G-2a ran on 2026-11-04. The plan was then revised to add `vite` (spec D-6, AD-41), and again to run the E2E tests in the installed Google Chrome (spec D-7, AD-42). David reviewed and approved the D-7 revision: his decision of 2026-11-04 is recorded as AD-42, and the revision was committed as `f9ffdaa` on 2026-11-06 at his request.

**Goal:** `yarn typecheck`, `lint`, `lint:md`, `format`, `format:check`, `test`, `test:e2e`, `check` and `verify` all work and pass on the clean repository.

**Architecture:** Each tool is configured by one small file at the repository root and called from a `package.json` script. Unit tests sit next to their code (`src/**/*.test.ts`). Time-zone tests (`*.tz.test.ts`) run in a Vitest project that sets `TZ` in the config. E2E tests (`tests/e2e/*.spec.ts`) run against a production build on `127.0.0.1:3100`. `yarn check` and `yarn verify` chain the scripts with `&&`.

**Tech stack:** Node.js 24.13.0, Yarn 4.12.0, Next.js 16.4.4, TypeScript 5.9.3, ESLint 9, and these five new devDependencies, at the exact versions found at G-2a (spec D-6, AD-41): `prettier@3.9.10`, `markdownlint-cli2@0.24.0`, `vitest@5.1.0`, `@playwright/test@1.64.1` and `vite@8.3.5`.

**Spec:** [2026-11-04-chunk-02-quality-tooling-design.md](../specs/2026-11-04-chunk-02-quality-tooling-design.md). Read it first. David's decisions D-1…D-6 and his answers to Q1–Q3 (all approved) are in its section 4; Q4 is closed.

## Global constraints

- **Branch:** `chunk-02-quality-tooling`, made from `main` at `23f9134`, which contains the restored CLAUDE.md sections. No remote changes, no push, no merge.
- **Downloads:** only at G-2a and G-2b (spec section 5), each with David's go-ahead at that moment. Chunk 2 uses the installed Google Chrome (D-7), so no browser download is planned. G-2c is only a fallback, with a fresh go-ahead.
- **Versions:** each of the five new devDependencies is pinned exactly (`--exact`), at the version in spec D-6 (AD-41).
- **Ports:** E2E uses `127.0.0.1:3100` only (`E2E_PORT = 3100`). `yarn dev` keeps port 3000.
- **Telemetry:** every Next.js call goes through `yarn` (AD-35).
- **Exit codes:** every "exits 0" or "exits ≠0" below is read from the real process exit code (`$LASTEXITCODE` in PowerShell, `$?` in Git Bash), never inferred from the output.
- **Probe files** (deliberate errors) are created, run and deleted inside one step, and never staged. After each one is deleted, `git status --porcelain` shows no probe file.
- **Line endings:** every new file is LF (`.gitattributes`). Check after writing with `git diff --check` and a carriage-return count of 0.
- **`security-guidance` plugin (spec N9):** before each commit, check that `.claude/settings.local.json` still has it `false`. After each commit, check that `~/.claude/security/log.txt` has no "Commit review: detected" line at that time. If a review fires, stop and report (OD-15).

## Review focus

1. **`yarn check` answered by Yarn 1** (a built-in name). Expected: our script runs. Pinned by Task 4, Step 4, which asserts the `check-node.mjs` line appears.
2. **Port 3100 already in use**, or a stale server. Expected: Playwright fails loudly and never tests a different app. Pinned by `reuseExistingServer: false` and the exact-title assertion (Task 3).
3. **`TZ` from the config not reaching the test.** Expected: the `tz-kuala-lumpur` project sees `Asia/Kuala_Lumpur` in PowerShell without any shell variable. Pinned by `src/vitest-time-zone.tz.test.ts` (Task 2).
4. **Prettier touching docs or personal files** (`*.md`, `.claude/settings.local.json`, the Yarn release). Expected: `yarn format` never changes them. Pinned by Task 1, Step 7 (`yarn format` followed by `git status --porcelain`).
5. **A unit run picking up E2E specs, or the reverse.** Expected: `yarn test` runs only `*.test.ts`. Pinned by Task 3, Step 6 (the test output lists no `tests/e2e` file).

---

### Task 0: Branch, commit the spec and plan, record decisions

**Files:**

- Modify: `docs/REQUIREMENTS.md` (Decision log), `docs/ARCHITECTURE.md` (Decision register): only if David answers yes to spec Q3.
- Modify: `docs/IMPLEMENTATION_ROADMAP.md`: Chunk 2 Status and the progress summary.

- [ ] **Step 1:** Confirm that `main` contains the restored CLAUDE.md sections (`git log --oneline -3 main`) and that the working tree holds only this chunk's spec and plan. Then run `git switch -c chunk-02-quality-tooling` from `main`.
- [ ] **Step 2:** Commit the spec and plan: `docs: add Chunk 2 spec and plan`.
- [ ] **Step 3 (Q3 approved):** add decision-register entries AD-36 (D-1), AD-37 (D-2), AD-38 (D-3), AD-39 (D-4) and AD-40 (D-5), each marked "Proposed; David's decision is in the decision log (Chunk 2 spec, D-n)". Add one decision-log row each, with Type `Technical` and Decided by David.
  - Source for D-1…D-3: "Claude Code session of 2026-11-04, plan-mode answers ('Format cmd', 'E2E title', 'MD lint')".
  - Source for D-4 and D-5: "Claude Code session of 2026-11-04, Step 4 self-review answers ('Typecheck', 'Format Ch1')".

  Commit: `docs: record David's Chunk 2 spec decisions (AD-36…AD-40)`.
- [ ] **Step 4:** Set Chunk 2's Status to `In progress.` and the progress summary to In-progress chunks 1, with today's date. Commit: `docs: start Chunk 2`.

### Task 1: Prettier, `typecheck` and `lint:md` (roadmap 2.1)

**Files:**

- Modify: `package.json` (devDependencies; scripts `typecheck`, `lint:md`, `format`, `format:check`)
- Create: `.prettierignore`, `.markdownlint-cli2.jsonc`

**Interfaces:**

- Produces: the scripts `typecheck`, `lint:md`, `format` and `format:check`, which Task 4 chains.

- [ ] **Step 1: Baseline.** Run `yarn lint` and `yarn tsc --noEmit`. Both exit 0. Record the output.
- [x] **Step 2: G-2a (go-ahead), done 2026-11-04.** With `npm_config_update_notifier=false` set for the command (as in Chunk 1), run `npm view <pkg> version` and read each README for telemetry, for `prettier`, `markdownlint-cli2`, `vitest` and `@playwright/test`. Show David the four exact versions. Stop until David approves them.
  - **Result:** all latest stable, with no telemetry mentioned in any README:
    - `prettier` 3.9.10 (MIT, Node `>=14`);
    - `markdownlint-cli2` 0.24.0 (MIT, Node `>=22`);
    - `vitest` 5.1.0 (MIT, Node `^22.12.0 || ^24.0.0 || >=26.0.0`);
    - `@playwright/test` 1.64.1 (Apache-2.0, Node `>=20`).
  - **The lookup found** that Vitest 5 declares `vite` as a non-optional peer dependency. David approved `vite@8.3.5` (MIT, Node `^20.19.0 || >=22.12.0`) as a fifth devDependency (spec D-6, AD-41).
- [ ] **Step 3: G-2b (go-ahead).** Run `yarn add --dev --exact prettier@3.9.10 markdownlint-cli2@0.24.0 vitest@5.1.0 @playwright/test@1.64.1 vite@8.3.5`.
  - Then `git status --porcelain` shows only `package.json` and `yarn.lock` changed.
  - `package.json` lists the five versions without `^` or `~`.
  - `yarn explain peer-requirements` lists `vitest`'s `vite` requirement; `yarn explain peer-requirements <its hash>` reports it satisfied.
  - All five devDependencies come from this one approved install, so `vitest`, `vite` and `@playwright/test` land in the 2.1 commit even though Tasks 2 and 3 use them.
- [ ] **Step 4: Typecheck, failing first (D-4).**
  1. **Clean checkout, red.** Delete the ignored, regenerable `.next/` build cache. `yarn tsc --noEmit` → exits ≠0 and names `LayoutProps`.
  2. **Clean checkout, green.** Add `"typecheck": "next typegen && tsc --noEmit"`. `yarn typecheck` → exits 0.
  3. **Probe.** Create `src/typecheck-probe.ts` containing `export const probe: number = "not a number";`. `yarn typecheck` → exits ≠0 and names `typecheck-probe.ts`. Delete the probe, and `yarn typecheck` exits 0.
- [ ] **Step 5: markdownlint, failing first.** Without `globs`, `markdownlint-cli2` lints nothing, so the config comes before the probe. Create `.markdownlint-cli2.jsonc`:

  ```jsonc
  {
    // Long lines are the house style for DevPulse docs (spec 2.1, D-3).
    "config": { "MD013": false },
    "globs": ["**/*.md"],
    "gitignore": true,
    "ignores": ["node_modules/**", ".next/**", ".yarn/**"]
  }
  ```

  Add `"lint:md": "markdownlint-cli2"`. Create the probe `docs/lint-probe.md` containing `#No space after hash` → `yarn lint:md` exits ≠0, and the output names `docs/lint-probe.md` with MD018. Delete the probe.

  Run `yarn lint:md` again. If it exits ≠0, apply D-3: fix formatting-only violations without changing wording. **Stop and ask David** if any fix would change wording or needs another rule turned off. Rerun until it exits 0. If docs changed, commit them on their own: `docs: fix markdownlint formatting (no wording changes)`, with `git diff --word-diff` reviewed first to confirm no wording changed.
- [ ] **Step 6: Configure Prettier.** Create `.prettierignore` with these lines:

  ```text
  *.md
  .yarn/
  yarn.lock
  public/
  .claude/
  ```

  Add `"format": "prettier --write ."` and `"format:check": "prettier --check ."`. Run `yarn format:check`. If it exits ≠0 on existing code or config, apply D-5:
  1. Record `node scripts/check-node.mjs` output.
  2. Run `yarn format`, list the files it changed (Chunk 1 files such as `scripts/check-node.mjs` are expected), and review `git diff` as formatting-only.
  3. Rerun `node scripts/check-node.mjs` → the same output as before.
  4. Commit on its own: `style: apply Prettier defaults`.
- [ ] **Step 7: Prove the Prettier scope.** Run `yarn format`, then `git status --porcelain` → no change, and no `*.md` or `.claude/` file touched.
- [ ] **Step 8: Acceptance.** `yarn lint`, `yarn lint:md`, `yarn format:check` and `yarn typecheck` each exit 0. Record the output.
- [ ] **Step 9: Commit:** `git add package.json yarn.lock .prettierignore .markdownlint-cli2.jsonc`, then `chore: add Prettier, typecheck and markdownlint (Chunk 2, 2.1)`.

### Task 2: Vitest (roadmap 2.2)

**Files:**

- Create: `vitest.config.mts`, `src/app/layout.test.ts`, `src/vitest-time-zone.tz.test.ts`
- Modify: `package.json` (script `test`)

**Interfaces:**

- Consumes: `metadata: Metadata`, exported from `src/app/layout.tsx` (unchanged).
- Produces: the `test` script. The projects `unit` (`TZ=UTC`, `src/**/*.test.ts` except `*.tz.test.ts`) and `tz-kuala-lumpur` (`TZ=Asia/Kuala_Lumpur`, `src/**/*.tz.test.ts`). Later chunks put time-zone tests in `*.tz.test.ts` files.

- [ ] **Step 1: Write the sample test.** `src/app/layout.test.ts`:

  ```ts
  import { describe, expect, it } from "vitest";
  import { metadata } from "@/app/layout";

  describe("Vitest setup", () => {
    it("resolves the @/ alias to src/", () => {
      expect(typeof metadata.title).toBe("string");
      expect(metadata.title).not.toBe("");
    });
  });
  ```

- [ ] **Step 2: Write the time-zone test.** `src/vitest-time-zone.tz.test.ts`, named `"runs with the TZ set by its Vitest project"`:
  - `expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("Asia/Kuala_Lumpur")`;
  - `expect(new Date("2026-01-05T00:00:00Z").getTimezoneOffset()).toBe(-480)`.
- [ ] **Step 3: Run it, expecting failure.** Add `"test": "vitest run"` and run `yarn test` with no config → exits ≠0: the `@/` import fails to resolve, and/or the TZ assertion fails under the PC's own zone.
- [ ] **Step 4: Configure Vitest.** Create `vitest.config.mts` with `defineConfig` from `vitest/config`: `resolve.alias` `{ "@": fileURLToPath(new URL("./src", import.meta.url)) }`, `test.environment: "node"`, and `test.projects` with two inline entries, each with `extends: true`, giving `name`, `include`/`exclude` and `env: { TZ }` as in the Interfaces block. The `unit` project's exclude is `[...configDefaults.exclude, "**/*.tz.test.ts"]`. Use the named constants `UNIT_TEST_TIME_ZONE = "UTC"` and `MALAYSIA_TIME_ZONE = "Asia/Kuala_Lumpur"`. If the installed Vitest version names the projects option differently, follow its own docs and record that.
- [ ] **Step 5: Run it, expecting a pass.** `yarn test` exits 0, and the output lists both projects with one test each. If the TZ test fails while the alias test passes, apply spec risk N4 (a per-project setup file) and record it.
- [ ] **Step 6: Roadmap test.** Invert the assertion in `layout.test.ts` (`not.toBe("string")`) → `yarn test` exits ≠0. Restore it → exits 0. Record both.
- [ ] **Step 7: cmd.exe.** `cmd /c yarn test` exits 0, and both projects pass (roadmap: "work in PowerShell and cmd").
- [ ] **Step 7a:** `yarn typecheck` and `yarn lint` exit 0 (the new files are included).
- [ ] **Step 8: Commit:** `git add vitest.config.mts src/app/layout.test.ts src/vitest-time-zone.tz.test.ts package.json`, then `test: configure Vitest with TZ projects (Chunk 2, 2.2)`.

### Task 3: Playwright (roadmap 2.3)

**Files:**

- Create: `playwright.config.ts`, `tests/e2e/home.spec.ts`
- Modify: `package.json` (script `test:e2e`), `eslint.config.mjs` (global ignores)

**Interfaces:**

- Produces: the `test:e2e` script, and `baseURL` `http://127.0.0.1:3100` for later E2E specs.

- [ ] **Step 1: Browser check (D-7).** Run `(Get-Item 'C:\Program Files\Google\Chrome\Application\chrome.exe').VersionInfo.ProductVersion` → it prints a Chrome version. Record it (156.0.8078.80 when checked on 2026-11-04). Nothing is downloaded and no browser is installed. G-2c is only a fallback: if the first run in Step 5 can't launch Chrome, stop and ask David for a fresh go-ahead for `yarn playwright install chromium`.
- [ ] **Step 2: Port check.** `Get-NetTCPConnection -LocalPort 3100 -State Listen` → nothing.
- [ ] **Step 3: Write the failing test.** `tests/e2e/home.spec.ts`:

  ```ts
  import { expect, test } from "@playwright/test";

  test("home page shows the app title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Create Next App");
  });
  ```

  Create a minimal `playwright.config.ts` with only `testDir: "tests/e2e"` and the Chromium project (with `channel: "chrome"`, so the run uses the installed Chrome), with no `baseURL` and no `webServer`, so Playwright never picks up the Vitest files. Add `"test:e2e": "playwright test"` and run `yarn test:e2e` → exits ≠0 because `page.goto("/")` has no base URL to navigate to.
- [ ] **Step 4: Configure Playwright.** Complete `playwright.config.ts` with `defineConfig`:
  - ``E2E_PORT = 3100`` and ``E2E_BASE_URL = `http://127.0.0.1:${E2E_PORT}` ``;
  - `testDir: "tests/e2e"`, `reporter: "list"`, `use: { baseURL: E2E_BASE_URL }`;
  - `projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } }]`;
  - ``webServer: { command: `yarn build && yarn start --port ${E2E_PORT}`, url: E2E_BASE_URL, reuseExistingServer: false, timeout: 180_000 }``.

  Add `"playwright-report/**"` and `"test-results/**"` to `globalIgnores` in `eslint.config.mjs`.
- [ ] **Step 5: Run it, expecting a pass.** `yarn test:e2e` exits 0 with one passed test; record it next to the Chrome version from Step 1. Then change the expected title to `"Wrong title"` → exits ≠0. Restore it → exits 0. After each run, `Get-NetTCPConnection -LocalPort 3100 -State Listen` → nothing (spec N11: no leftover `next start`).
- [ ] **Step 6: Separation and cleanliness.** `yarn test` output names no `tests/e2e` file. `yarn typecheck` and `yarn lint` exit 0. `git status --porcelain` shows only this task's files (`test-results/` stays ignored).
- [ ] **Step 7: Commit:** `git add playwright.config.ts tests/e2e/home.spec.ts package.json eslint.config.mjs`, then `test: configure Playwright smoke test (Chunk 2, 2.3)`.

### Task 4: `yarn check` and `yarn verify` (roadmap 2.4)

**Files:**

- Modify: `package.json` (scripts `check`, `verify`)

**Interfaces:**

- Consumes: `scripts/check-node.mjs` and the scripts `typecheck`, `lint`, `lint:md`, `test` and `test:e2e`.
- Produces: `check` and `verify`, the verification commands for every later chunk.

- [ ] **Step 1: Write the failing check.** Add `"check": "node scripts/check-node.mjs && yarn typecheck && yarn lint && yarn lint:md && yarn test"` and `"verify": "yarn check && yarn test:e2e"`. Create the probe `src/lint-probe.ts` containing `export const probe: any = 1;`. It breaks `@typescript-eslint/no-explicit-any`, which is error level (2) in the resolved config (spec N10). `no-debugger` isn't set and `no-unused-vars` is only a warning, so neither would fail `yarn lint`.
- [ ] **Step 2: Run it, expecting failure.** `yarn check` exits ≠0 at the lint step. The output shows no markdownlint or Vitest run, which proves the order and the early stop. Delete the probe.
- [ ] **Step 3: `verify` failure.** Change the expected title in `home.spec.ts` to `"Wrong title"` → `yarn verify` exits ≠0 in the E2E step after `check` passes. Restore it.
- [ ] **Step 4: Acceptance and the Yarn 1 check.** `yarn check` exits 0, and its first line is `Node.js 24.13.0 matches package.json engines.node.`. That proves Yarn 4 ran our script, not Yarn 1's built-in (spec risk N2). `yarn verify` exits 0. Record both outputs.
- [ ] **Step 5: Commit:** `git add package.json`, then `chore: add yarn check and yarn verify (Chunk 2, 2.4)`.

### Task 5: Verify, self-review and update the docs (skill Steps 6–7)

**Files:**

- Modify: `docs/IMPLEMENTATION_ROADMAP.md`, `CLAUDE.md` (Commands; "Before saying any work is done" may then cite `yarn check`), `README.md` (status and commands)

- [ ] **Step 1: Full checks.** `yarn check`, `yarn verify`, `yarn format:check` and `yarn build` each exit 0. Then `git status --porcelain` → clean.
- [ ] **Step 2: Self-review, not independent (OD-15 Pending).** Compare `git diff main...HEAD` with the spec, this plan, TR-02/10/11/13, NFR-04/06 and CLAUDE.md: Clean code, Testing rules, and Security and data handling (telemetry, `127.0.0.1`, no outbound requests). Fix each confirmed issue test-first. Record any declined finding with its reason. Stop after two rounds if issues remain.
- [ ] **Step 3: Manual verification.** David runs the spec section 7 commands in a fresh PowerShell terminal. Record the date, the commands, the exit codes and excerpts.
- [ ] **Step 4: Roadmap.**
  - Tick 2.1–2.4 with their commit hashes.
  - Reword 2.1: the acceptance check becomes `yarn format:check` (D-1), and `typecheck` becomes `next typegen && tsc --noEmit` (D-4). Record both, and the D-5 formatting commit, in the change log.
  - Add the italic manual-verification note, including what was not checked.
  - Set Status to `Complete.` only if the Definition of done is fully met.
  - Update the progress summary and the change log.

  Commit: `docs: record Chunk 2 verification`.
- [ ] **Step 5: CLAUDE.md and README.**
  - Move the Chunk 2 commands (`check`, `verify`, `test`, `test:e2e`, `typecheck`, `lint:md`, `format`, `format:check`) to "Available now".
  - Drop "until Chunk 2 adds `yarn typecheck`".
  - Leave `news:sync` under Chunk 3.
  - Update the README status honestly.

  Run `yarn lint:md`, then commit: `docs: update commands after Chunk 2`.
- [ ] **Step 6: Stop.** Report to David. Merging into `main` needs David's separate approval. Never push.
