# Chunk 1 — Repository and toolchain initialization: implementation plan

> **Execution:** inline in this session, task by task, by the assistant itself. While OD-15 is unresolved, no implementer or reviewer subagents are dispatched (chunk-workflow skill, Steps 3 and 6). Steps use checkbox (`- [ ]`) syntax. Nothing here runs until David approves this plan and its spec.

**Goal:** A local git repository whose first commit is the approved planning baseline, a pinned and private Node.js 24.13.0 and Yarn 4.12.0 toolchain, and a Next.js app scaffolded into the existing folder without touching the baseline files.

**Architecture:** Task 1.1 creates `main` with the baseline commit, and all later work happens on `chunk-01-toolchain`. The app is scaffolded in a temporary folder outside the repository and copied in without overwriting anything. Yarn runs from a committed release file. Next.js telemetry is disabled per project through `.env.yarn`, and the dev and production servers listen on `127.0.0.1` only.

**Tech stack:** Git 2.53 (Git Bash), Node.js 24.13.0 (nvm-windows), Yarn 4.12.0 (`yarnPath`), `create-next-app` (the latest stable version, looked up at G-1a), Next.js App Router, TypeScript, Tailwind CSS v4, ESLint.

**Spec:** [2026-11-03-chunk-01-toolchain-design.md](../specs/2026-11-03-chunk-01-toolchain-design.md). Read it first. David's decisions on Q1–Q3 are recorded in its section 4.

## Global constraints

- Node.js **24.13.0** exactly, in `engines.node` and `.nvmrc`.
- Yarn **4.12.0** (Q1, approved by David): `.yarn/releases/yarn-4.12.0.cjs`, `"packageManager": "yarn@4.12.0"`.
- `.yarnrc.yml`: `yarnPath: .yarn/releases/yarn-4.12.0.cjs`, `nodeLinker: node-modules`, `enableTelemetry: false`.
- `dev` and `start` scripts pass `--hostname 127.0.0.1`.
- **Bootstrap environment** for tasks 1.2–1.4 (Git Bash):

  ```bash
  BOOT="env COREPACK_ENABLE_AUTO_PIN=0 YARN_ENABLE_TELEMETRY=0 NEXT_TELEMETRY_DISABLED=1 npm_config_update_notifier=false"
  ```

- **Clean environment** for every check that must behave like David's own shell:

  ```bash
  CLEAN="env -u COREPACK_ENABLE_AUTO_PIN -u NEXT_TELEMETRY_DISABLED -u YARN_ENABLE_TELEMETRY"
  ```

- **Guard block and execution procedure (fail-fast).** Every Git Bash invocation in Tasks 1–6, whether a code block or an inline command in a step, is **one** shell invocation, started from the project root. Its parts come in this order:
  1. this guard block;
  2. the Bootstrap and Clean environment lines above;
  3. the guard assertion line below;
  4. the step's own commands.

  Code blocks and inline commands below show only part 4; they never run on their own. The assistant's shell doesn't keep variables between commands, so the whole procedure runs each time. The guard creates nothing: `$TMP` is only derived here, and is created later by the steps that need it. Commands David runs in a terminal of David's own (Task 5, Step 4) and the read-only PowerShell queries (Task 5, Steps 2–3) aren't Git Bash invocations.

  ```bash
  REPO="$(pwd -P)" || exit 1
  for f in README.md CLAUDE.md docs/REQUIREMENTS.md docs/ARCHITECTURE.md docs/IMPLEMENTATION_ROADMAP.md .claude/skills/chunk-workflow/SKILL.md docs/BASELINE.md; do
    [ -f "$REPO/$f" ] || { echo "STOP: $REPO is not the DevPulse root (no $f)" >&2; exit 1; }
  done
  if [ -e "$REPO/.git" ]; then
    TOP="$(git -C "$REPO" rev-parse --show-toplevel)" || exit 1
    TOP="$(cd "$TOP" && pwd -P)" || exit 1
    [ "$TOP" = "$REPO" ] || { echo "STOP: not at the git top level ($TOP)" >&2; exit 1; }
  fi
  [ -n "${LOCALAPPDATA:-}" ] || { echo "STOP: LOCALAPPDATA is not set" >&2; exit 1; }
  LAD="$(cygpath -u "$LOCALAPPDATA")" || exit 1
  [ -d "$LAD" ] || { echo "STOP: LOCALAPPDATA is not an existing directory: $LAD" >&2; exit 1; }
  LAD="$(cd "$LAD" && pwd -P)" || exit 1
  TMP="$LAD/Temp/devpulse-chunk01"
  command -v node >/dev/null || { echo "STOP: node is not on PATH" >&2; exit 1; }
  REPO_W="$(cygpath -w "$REPO")" || exit 1
  GUARD_JS='
  const fs = require("fs"), path = require("path");
  const repoIn = process.argv[1];
  const lad = process.env.LOCALAPPDATA;
  const tmpIn = lad ? path.join(lad, "Temp", "devpulse-chunk01") : "";
  const stop = (m) => { console.error("STOP: " + m); process.exit(1); };
  if (!repoIn || !tmpIn) stop("missing path argument");
  let repo;
  try { repo = fs.realpathSync.native(repoIn); } catch { stop("cannot resolve the repository: " + repoIn); }
  let probe = path.resolve(tmpIn); const tail = [];
  for (;;) {
    let entry = false, target = false;
    try { fs.lstatSync(probe); entry = true; } catch {}
    try { fs.statSync(probe); target = true; } catch {}
    if (target) break;
    if (entry) stop("broken link on the TMP path: " + probe);
    const up = path.dirname(probe);
    if (up === probe) stop("no existing folder above " + tmpIn);
    tail.unshift(path.basename(probe)); probe = up;
  }
  let phys;
  try { phys = path.join(fs.realpathSync.native(probe), ...tail); } catch { stop("cannot resolve " + probe); }
  const norm = (p) => path.resolve(p).toLowerCase().replace(/[\\/]+$/, "") + "\\";
  if (norm(phys).startsWith(norm(repo))) stop("TMP is physically inside the repository: " + phys + " (repository: " + repo + ")");
  '
  node -e "$GUARD_JS" "$REPO_W" || exit 1
  unset DEVPULSE_GUARD_OK; DEVPULSE_GUARD_OK=1
  ```

  **Guard assertion line.** This is the first line of every `bash` code block in Tasks 1–6:

  ```bash
  case "$(declare -p DEVPULSE_GUARD_OK 2>/dev/null)" in 'declare -- DEVPULSE_GUARD_OK="1"') ;; *) echo "STOP: the guard block did not run in this shell; use the execution procedure" >&2; exit 1;; esac
  ```

  The guard sets `DEVPULSE_GUARD_OK` as its last line, only after every check has passed. `unset` first drops any inherited, exported copy. The assertion passes only for a shell-local variable set in this very shell: an unset variable fails, and so does an inherited exported one, which `declare -p` shows as `declare -x`. A block run without the guard, or in another shell, stops at its first line.

  **Why nothing can continue after a failure:**
  - Every shell check ends in `exit 1`, which ends the shell running the block, so no later command in that block runs.
  - Every command substitution is followed by `|| exit 1`, so a failed `pwd`, `git`, `cygpath` or `cd` stops it too.
  - The Node check exits 1 on every failure, and its call ends in `|| exit 1`.
  - The inside-the-repository test compares **physical** paths: `fs.realpathSync.native` (the Windows final-path API) on the repository, and on the nearest existing folder of the `TMP` path.
    - Node builds the `TMP` path itself, from `LOCALAPPDATA`, because Git Bash's `cygpath` follows links while converting a path, and that would hide a broken link.
    - It walks up the path with `lstat` and `stat` only, so nothing is created, and a broken link stops it.
    - The missing tail is added back afterwards; it doesn't exist yet, so it can't be a link.
    - This covers junctions, symbolic links, 8.3 short names and Git Bash aliases such as `/tmp/…`.
    - The comparison ignores case and uses a trailing `\`, so the repository itself and anything inside it stop the guard, while a sibling folder such as `DevPulse2` passes.

  Expected: no output, and exit status 0. On any `STOP` line: stop and report to David. Every later command uses `"$REPO"` and `"$TMP"`, quoted, never a user name or a hard-coded path.

- Never overwrite a tracked file. Never copy `.git/`. Never use `next/font/google`.
- No remote, no push, no merge into `main` after the baseline commit, no Windows setting, no scheduled task.
- **Network:** only at go-aheads G-1a, G-1b.1, G-1b.2, G-2 and G-3, each asked of David separately, at that moment.
- **Telemetry boundary (Q3):** every supported Next.js invocation goes through Yarn (`yarn dev`, `yarn build`, `yarn start`, `yarn next …`), where `.env.yarn` disables telemetry. Direct invocations such as `npx next` or `node …/next` aren't covered and aren't supported. The only direct invocation in this plan is the control check in Task 4, Step 5.
- Every commit ends with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Stop and ask** if any expected output differs from the "Expected" line.

## Review focus

1. **A fresh shell of David's without `COREPACK_ENABLE_AUTO_PIN=0`** must not rewrite `package.json`. Tested in Task 4, Step 12.
2. **`check-node.mjs` run from another directory** must still read the repository's `package.json`. Tested in Task 3, case (e).
3. **A missing or non-exact `engines.node`** must fail clearly, never pass. Tested in Task 3, cases (c) and (d).
4. **CRLF creeping in under the system `core.autocrlf=true`** must never happen. Carriage-return counts are checked after the commit and after the branch switch in Task 1.
5. **The bare CLI (`yarn next …`) without any telemetry variable in the shell** must report telemetry disabled. Tested in Task 4, Steps 3–5.

## File structure

| File | Task | Responsibility |
| --- | --- | --- |
| `.gitattributes`, `.editorconfig` | 1 | LF everywhere |
| `.gitignore` | 1, merged in 2, extended in 4 | Ignore set (spec 6.2) |
| `docs/BASELINE.md` | 1 | Records the baseline commit hash |
| Roadmap, README.md, CLAUDE.md | 1 (allowed lines only), 6 | Status |
| Scaffold files (`package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `src/app/*`, `public/*`; exact list recorded) | 2 | The Next.js app |
| `.nvmrc`, `scripts/check-node.mjs` | 3 | Node.js pin and its check |
| `.yarn/releases/yarn-4.12.0.cjs`, `.yarnrc.yml` | 3 | Yarn pin |
| `yarn.lock`, `.env.yarn` | 4 | Locked dependencies; per-project telemetry switch |

---

### Task 1: Pre-flight and baseline commit (roadmap 1.1)

**Files:** create `.gitattributes`, `.editorconfig`, `.gitignore`; modify `docs/BASELINE.md`; modify the allowed status lines (Step 11); add three register rows to `docs/ARCHITECTURE.md` and three decision-log rows to `docs/REQUIREMENTS.md` (Step 12).

**Interfaces:** produces the `<baseline-commit>` hash, used in Task 5. Produces the branch `chunk-01-toolchain`.

- [ ] **Step 1: Pre-flight check.** For each row of the "Baseline fingerprint" table in `docs/BASELINE.md`, the file's SHA-256 must equal the recorded hash, and the decision log must hold the BL-01 row. These checks run at the start of Step 2's block, in the same shell as `git init`, so nothing can change between the check and the initialization. Expected: six matches.

  **Any mismatch** (David's approved policy, Option A):
  - stop immediately, and don't initialize git;
  - report each mismatched file with its expected and actual SHA-256;
  - investigate why the mismatch occurred, without changing any file, and report the findings to David;
  - don't request BL-01 re-approval just because of a mismatch. BL-01 stays approved; a mismatch doesn't reopen or revoke it;
  - if the investigation shows the approved baseline genuinely needs to change, get David's explicit approval before proceeding.

  `docs/REQUIREMENTS.md`, the chunk-workflow skill and `docs/BASELINE.md` say a mismatch before the baseline commit means re-approval. Those documents are unchanged; this plan applies David's Option A decision.

  If `$REPO/.git` already exists: stop and ask David. Task 1 never reuses, repairs or reinitializes a repository.
- [ ] **Step 2: Initialize.** Every check runs in the same shell as `git init`, in this order:
  1. the baseline fingerprints;
  2. the BL-01 row;
  3. no `.git`;
  4. not inside another git repository.

  Only then does `git init` run, followed by a check that the remote list is empty. A failed check can't fall through to `git init`. The global guard is unchanged, so later tasks still accept the repository this step creates.

  ```bash
  case "$(declare -p DEVPULSE_GUARD_OK 2>/dev/null)" in 'declare -- DEVPULSE_GUARD_OK="1"') ;; *) echo "STOP: the guard block did not run in this shell; use the execution procedure" >&2; exit 1;; esac
  node -e '
  const fs = require("fs"), path = require("path"), crypto = require("crypto");
  const repo = process.argv[1];
  const stop = (m) => { console.error("STOP: " + m + "; git was not initialized; perform read-only investigation and report findings to David before proceeding"); process.exit(1); };
  const SIX = ["README.md", "CLAUDE.md", "docs/REQUIREMENTS.md", "docs/ARCHITECTURE.md", "docs/IMPLEMENTATION_ROADMAP.md", ".claude/skills/chunk-workflow/SKILL.md"];
  let B;
  try { B = fs.readFileSync(path.join(repo, "docs/BASELINE.md"), "utf8").split("\n"); } catch { stop("docs/BASELINE.md is unreadable"); }
  const a = B.findIndex((l) => l === "## Baseline fingerprint");
  const b = B.findIndex((l, i) => i > a && l.startsWith("## "));
  if (a < 0 || b < 0) stop("docs/BASELINE.md has no Baseline fingerprint section");
  const rows = B.slice(a, b).map((l) => l.match(/^\| \x60([^\x60]+)\x60 \| \x60([0-9a-f]{64})\x60 \|/)).filter(Boolean);
  if (rows.length !== 6 || rows.some((m, i) => m[1] !== SIX[i])) stop("the Baseline fingerprint table does not list exactly the six baseline files");
  let bad = 0;
  for (const [, f, h] of rows) {
    let got;
    try { got = crypto.createHash("sha256").update(fs.readFileSync(path.join(repo, f))).digest("hex"); } catch { got = "unreadable"; }
    if (got === h) console.log("OK " + f);
    else { bad++; console.error("MISMATCH " + f + ": expected " + h + ", actual " + got); }
  }
  if (bad) stop(bad + " baseline file(s) differ from docs/BASELINE.md");
  let Q;
  try { Q = fs.readFileSync(path.join(repo, "docs/REQUIREMENTS.md"), "utf8").split("\n"); } catch { stop("docs/REQUIREMENTS.md is unreadable"); }
  const bl = Q.filter((l) => l.startsWith("| 2026-11-03 | Baseline | BL-01 |"));
  if (bl.length !== 1 || !bl[0].includes("| Planning baseline approved | David |")) stop("the decision log does not hold exactly one BL-01 row approved by David");
  console.log("BASELINE AND BL-01 OK");
  ' "$REPO_W" || exit 1
  [ ! -e "$REPO/.git" ] || { echo "STOP: $REPO/.git already exists; Task 1 never reuses, repairs or reinitializes a repository; ask David" >&2; exit 1; }
  if git -C "$REPO" rev-parse --git-dir >/dev/null 2>&1; then echo "STOP: $REPO is inside another git repository; ask David" >&2; exit 1; fi
  git init -b main "$REPO" || exit 1
  REMOTE_OUTPUT="$(git -C "$REPO" remote -v)" || exit 1
  [ -z "$REMOTE_OUTPUT" ] || { echo "STOP: git remote -v is not empty" >&2; exit 1; }
  ```

  Expected: six `OK <file>` lines, then `BASELINE AND BL-01 OK`, then git's initialization message, and no `STOP`.
- [ ] **Step 3: Write the line-ending files**, before any `git add`.

  `.gitattributes`:

  ```text
  * text=auto eol=lf
  ```

  `.editorconfig`:

  ```text
  root = true

  [*]
  end_of_line = lf
  ```

- [ ] **Step 4: Write the failing ignore test, and run it before `.gitignore` exists.** The test runs in an isolated repository, `$IT`, inside `$TMP`; the guard has proved `$TMP` is physically outside the project. It never creates, overwrites or deletes a project file.

  ```bash
  case "$(declare -p DEVPULSE_GUARD_OK 2>/dev/null)" in 'declare -- DEVPULSE_GUARD_OK="1"') ;; *) echo "STOP: the guard block did not run in this shell; use the execution procedure" >&2; exit 1;; esac
  IT="$TMP/ignore-test"
  [ ! -e "$IT" ] || { echo "STOP: $IT already exists; ask David" >&2; exit 1; }
  mkdir -p "$TMP" || exit 1
  mkdir "$IT" || exit 1
  cleanup_it() { rc=$?; trap - EXIT
    if [ "$rc" -ne 0 ]; then
      if [ "$IT" = "$TMP/ignore-test" ] && [ -d "$IT" ] && [ ! -L "$IT" ]; then rm -rf -- "$IT"; fi
      if [ -e "$IT" ] || [ -L "$IT" ]; then echo "STOP: could not remove $IT" >&2; fi
    fi
    exit "$rc"; }
  trap cleanup_it EXIT
  git init -q "$IT" || exit 1
  : > "$IT/.git/devpulse-ignore-test" || exit 1
  mkdir "$IT/data" && echo x > "$IT/data/dummy.txt" && echo SECRET=x > "$IT/.env.local" && echo EXAMPLE=x > "$IT/.env.example" || exit 1
  git -C "$IT" status --porcelain --untracked-files=all || exit 1
  ```

  Expected (fails as intended): `?? .env.example`, `?? .env.local` and `?? data/dummy.txt`.

  **Failure-safe cleanup:**
  - `mkdir "$IT"` (without `-p`) fails if anything is already there, so `$IT` is always a folder this test created.
  - The `EXIT` trap is set only after it succeeds. If any later command fails, the trap removes exactly `$IT`.
  - The trap re-checks that the path is exactly `$TMP/ignore-test`, a real folder and not a link, before deleting. It always exits with the step's original non-zero status, and prints STOP if `$IT` couldn't be removed.
  - `$TMP`, and anything that existed before, is never deleted.
  - On success, `$IT` stays for Step 6, marked by `.git/devpulse-ignore-test`.
  - If Task 1 stops between Steps 4 and 6, report the leftover `$IT` to David. Only Step 6's marker-checked cleanup removes it.
- [ ] **Step 5: Write `.gitignore`.**

  ```text
  node_modules/
  .next/
  data/
  .env*
  !.env.example
  /test-results/
  /playwright-report/
  /blob-report/
  /playwright/.cache/
  .yarn/*
  !.yarn/releases
  !.yarn/patches
  !.yarn/plugins
  !.yarn/sdks
  !.yarn/versions
  .pnp.*
  ```

- [ ] **Step 6: Re-run the ignore test with the new `.gitignore`, then remove `$IT`.**

  ```bash
  case "$(declare -p DEVPULSE_GUARD_OK 2>/dev/null)" in 'declare -- DEVPULSE_GUARD_OK="1"') ;; *) echo "STOP: the guard block did not run in this shell; use the execution procedure" >&2; exit 1;; esac
  IT="$TMP/ignore-test"
  [ -d "$IT" ] && [ ! -L "$IT" ] && [ -f "$IT/.git/devpulse-ignore-test" ] || { echo "STOP: $IT is not the folder Step 4 created; ask David" >&2; exit 1; }
  cleanup_it() { rc=$?; trap - EXIT
    if [ "$IT" = "$TMP/ignore-test" ] && [ -d "$IT" ] && [ ! -L "$IT" ] && [ -f "$IT/.git/devpulse-ignore-test" ]; then rm -rf -- "$IT"; fi
    if [ -e "$IT" ] || [ -L "$IT" ]; then echo "STOP: could not remove $IT" >&2; [ "$rc" -ne 0 ] || rc=1; fi
    exit "$rc"; }
  trap cleanup_it EXIT
  cp "$REPO/.gitignore" "$IT/.gitignore" || exit 1
  git -C "$IT" status --porcelain --untracked-files=all || exit 1
  ```

  Expected: exactly `?? .env.example` and `?? .gitignore`. The copied rules file is itself untracked, and `data/dummy.txt` and `.env.local` are hidden.

  **Cleanup:**
  - The marker check comes first, so nothing is deleted unless `$IT` is the folder Step 4 created.
  - After the check, the `EXIT` trap removes exactly `$IT`, whether the step succeeds or fails.
  - The trap re-checks the exact path, that it is a real folder and not a link, and the marker, before deleting.
  - It keeps the step's exit status when cleanup succeeds. If `$IT` can't be removed, it prints STOP and exits non-zero, even when the step itself succeeded.
  - `$TMP` is kept.
- [ ] **Step 7: Stage exactly the baseline commit's contents.**

  ```bash
  case "$(declare -p DEVPULSE_GUARD_OK 2>/dev/null)" in 'declare -- DEVPULSE_GUARD_OK="1"') ;; *) echo "STOP: the guard block did not run in this shell; use the execution procedure" >&2; exit 1;; esac
  git add README.md CLAUDE.md docs/ .claude/skills/ .gitattributes .editorconfig .gitignore
  git status --porcelain
  ```

  Expected: exactly 15 lines starting with `A`:
  - the six baseline files and `docs/BASELINE.md`;
  - the five files under `docs/superpowers/` (the r2, r3 and r4 records, the spec, this plan);
  - the three repository settings files.

  No other line.
- [ ] **Step 8: Commit.**

  ```bash
  case "$(declare -p DEVPULSE_GUARD_OK 2>/dev/null)" in 'declare -- DEVPULSE_GUARD_OK="1"') ;; *) echo "STOP: the guard block did not run in this shell; use the execution procedure" >&2; exit 1;; esac
  git commit -m "chore: baseline commit of the approved planning documents (BL-01)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  ```

- [ ] **Step 9: Verify the commit.**
  1. `for f in <six files>; do git cat-file blob HEAD:$f | sha256sum; done` equals the fingerprint table.
  2. Every working file has 0 carriage returns.
  3. `git log --oneline` shows exactly one commit.
  4. `git remote -v` prints nothing.
- [ ] **Step 10: Branch, and record the commit.**
  1. Run `git switch -c chunk-01-toolchain`, then re-check that the six working files have 0 carriage returns.
  2. In `docs/BASELINE.md`, replace the text under "Baseline commit" with: the full hash, "on `main`", the date, and "every committed baseline blob matched its recorded hash".
  3. Commit with `docs: record the baseline commit hash (task 1.1)`.
- [ ] **Step 11: Set Chunk 1 to In progress** (skill Step 5.3). Change only these lines:
  - Roadmap Chunk 1 `**Status:**` becomes `In progress.`.
  - Roadmap progress summary: `In-progress chunks` becomes `1`; `Last updated` becomes the execution date.
  - Roadmap "Roadmap start" bullet: the whole line becomes exactly `- **Roadmap start:** BL-01 approved by David on 2026-11-03 (see the [REQUIREMENTS decision log](REQUIREMENTS.md#decision-log)); Chunk 1 is in progress.`
  - README.md, "Development status": the sentence "They are waiting for David's baseline approval (BL-01)." becomes "David approved them as the planning baseline (BL-01) on 2026-11-03."
  - CLAUDE.md: "Chunk 1 starts only after David's baseline approval, BL-01." becomes "David approved the planning baseline (BL-01) on 2026-11-03, and Chunk 1 is in progress."

  Commit with `docs: start Chunk 1`.
- [ ] **Step 12: Record David's Q1–Q3 decisions** (CLAUDE.md, "Documentation rules": decisions go in the decision log). This runs before Task 2, because G-1a depends on Q2. Add exactly these rows and change nothing else.
  1. In `docs/ARCHITECTURE.md`, add these three rows to the decision register, directly after the AD-32 row:

     ```text
     | AD-33 | Yarn release 4.12.0: the committed `.yarn/releases/yarn-4.12.0.cjs` and the `packageManager` value (a detail of AD-18) | Corepack's default Yarn on this PC, already in its cache, so the shim needs no download | The newest Yarn 4 at execution time | Proposed; David's decision is in the decision log (Chunk 1 spec, Q1) | Any other Yarn version |
     | AD-34 | Next.js scaffold version: the latest stable `create-next-app`, looked up at execution time from registry metadata only (G-1a), downloaded and run only after a separate approval (G-1b) | The roadmap names no Next.js version | A version fixed without a registry lookup | Proposed; David's decision is in the decision log (Chunk 1 spec, Q2) | Any other version rule |
     | AD-35 | Per-project Next.js telemetry switch: a committed `.env.yarn` containing only `NEXT_TELEMETRY_DISABLED=1`, which Yarn injects into `yarn dev`, `yarn build`, `yarn start` and `yarn next …`; direct invocations outside Yarn, such as `npx next` or `node …/next`, are not covered and are not supported (a detail of AD-28) | A per-project setting; `next telemetry disable` writes a per-user setting | `next telemetry disable` | Proposed; David's decision is in the decision log (Chunk 1 spec, Q3) | Telemetry must also be off outside Yarn |
     ```

  2. In `docs/REQUIREMENTS.md`, add these three rows to the decision log, directly after the BL-01 row, which stays byte-identical:

     ```text
     | 2026-11-03 | Technical | AD-33 | Yarn release version (Chunk 1 spec, Q1) | Approved: Yarn 4.12.0 | David | Message in the Claude Code session of 2026-11-03, "DevPulse — Final Chunk 1 Spec and Plan Corrections": "Q1: David approved Yarn 4.12.0." | Affects only AD-33. |
     | 2026-11-03 | Technical | AD-34 | Next.js scaffold version (Chunk 1 spec, Q2) | Approved: the latest stable `create-next-app` version, looked up at execution time from registry metadata only (G-1a), and downloaded and run only after a separate approval (G-1b) | David | Message in the Claude Code session of 2026-11-03, "DevPulse — Final Chunk 1 Spec and Plan Corrections": "Q2: David approved using the latest stable create-next-app version, looked up at execution time, subject to separate approval before downloading and running it." | Affects only AD-34. The exact version is recorded in Chunk 1's verification note. |
     | 2026-11-03 | Technical | AD-35 | Per-project Next.js telemetry switch (Chunk 1 spec, Q3) | Approved: commit `.env.yarn` containing only `NEXT_TELEMETRY_DISABLED=1`; it covers `yarn dev`, `yarn build`, `yarn start` and `yarn next …`; direct invocations outside Yarn are not covered and are not supported | David | Message in the Claude Code session of 2026-11-03, "DevPulse — Final Chunk 1 Spec and Plan Corrections": "Q3: David approved committing `.env.yarn` containing only `NEXT_TELEMETRY_DISABLED=1`, subject to the invocation boundary below." | Affects only AD-35. If task 1.4's check fails, the evidence goes to David; no other method is used. |
     ```

  3. Check: `git diff --stat` lists only those two files, with 3 insertions each and no deletions. `git diff` shows only these six rows.
  4. Commit with `docs: record David's Chunk 1 technical decisions (AD-33 to AD-35)`.

### Task 2: Scaffold outside the repository (roadmap 1.2)

**Files:** create the scaffold files (recorded list); modify `.gitignore` (hand merge).

**Interfaces:** consumes `.gitignore` from Task 1. Produces `package.json` (`"name": "devpulse"`) and `tsconfig.json` (`"strict": true`, `paths` `@/*`), used in Task 3.

- [ ] **Step 1: Go-ahead G-1a, registry metadata only.** Stop and ask David for permission to look up the registry metadata. Then:
  1. run `$BOOT npm view create-next-app version`; the result becomes `<v>` (spec Q2);
  2. run `$BOOT npm view create-next-app@<v> readme` and extract its documented options.

  Show David the exact version `<v>`, and whether these options are documented: `--ts`, `--tailwind`, `--eslint`, `--app`, `--src-dir`, `--import-alias`, `--use-npm`, `--skip-install`, `--disable-git`, `--yes`. Nothing is downloaded or run in this step.
- [ ] **Step 2: Go-ahead G-1b.1, CLI verification.** Stop and ask David for permission to download and run exactly `create-next-app@<v>` with `--help` only.
  - Only after explicit approval, run `mkdir -p "$TMP" && cd "$TMP" && $BOOT npx --yes create-next-app@<v> --help`.
  - Record the output, and confirm that each of the ten options listed in Step 1 appears in it. If one is missing: stop and ask.
  - Nothing is scaffolded in this step.
  - Report the output and the verification results to David, then stop: scaffolding needs G-1b.2.
- [ ] **Step 3: Go-ahead G-1b.2, scaffold.** Stop and ask David for a separate explicit approval, after David has reviewed G-1b.1's results. Only after that approval, run the block below.
  - The scaffold is created only inside `$TMP` (`%LOCALAPPDATA%\Temp\devpulse-chunk01`), with the approved flags, including `--skip-install`, `--disable-git` and `--no-agent-feedback` (David's decision after G-1b.1). `--reset-preferences` is not used.
  - No dependency is installed, and the repository isn't touched in this step.

  ```bash
  case "$(declare -p DEVPULSE_GUARD_OK 2>/dev/null)" in 'declare -- DEVPULSE_GUARD_OK="1"') ;; *) echo "STOP: the guard block did not run in this shell; use the execution procedure" >&2; exit 1;; esac
  cd "$TMP" && $BOOT npx --yes create-next-app@<v> devpulse --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --skip-install --disable-git --no-agent-feedback --yes
  ```

  Then record `find "$TMP/devpulse" -type f | sort` (the emitted-file list) and confirm that `$TMP/devpulse/.git` doesn't exist.
- [ ] **Step 4: Run the failing privacy test on the raw scaffold.** Run `grep -rIl "next/font/google" "$TMP/devpulse/src"`. Expected (fails as intended): `src/app/layout.tsx`.
- [ ] **Step 5: Clean up the scaffold**, in `$TMP/devpulse`:
  - remove the `next/font/google` import and its font variables from `src/app/layout.tsx`;
  - remove the `--font-geist-*` references from `src/app/globals.css`, so Tailwind v4's default system stacks apply;
  - delete `README.md` and any `AGENTS.md`, `CLAUDE.md` or `.yarnrc.yml`;
  - set `"name": "devpulse"` in `package.json`.
- [ ] **Step 6: Check the cleaned scaffold.**
  - Step 4's grep prints nothing.
  - `package.json` name is `devpulse`.
  - `tsconfig.json` has `"strict": true` and `"@/*"` in `paths`.
  - `tailwindcss` is version 4 in `devDependencies`, and `globals.css` contains `@import "tailwindcss"`.
- [ ] **Step 7: Merge into the repository.** Copy each file that doesn't already exist in the repository (`cp -n`, never `.git/`). Merge `.gitignore` by hand: Task 1's lines first, then the scaffold's other lines, with no duplicates.
- [ ] **Step 8: Check the merge.** Run `git status --porcelain`. Expected: only `??` additions, plus `.gitignore` shown as modified (`M`). `git diff --stat` lists only `.gitignore`.
- [ ] **Step 9: Commit** with `feat: scaffold the Next.js app (task 1.2)`. The commit body holds the emitted-file list, and the trailer.

### Task 3: Pin the toolchain (roadmap 1.3)

**Files:** create `.nvmrc`, `scripts/check-node.mjs`, `.yarn/releases/yarn-4.12.0.cjs` and `.yarnrc.yml`; modify `package.json` (`engines`, `packageManager`).

**Interfaces:**

- `scripts/check-node.mjs`, a CLI with no exports:
  - it reads `engines.node` from `new URL("../package.json", import.meta.url)`;
  - exit 0 when `process.versions.node === engines.node`;
  - otherwise exit 1, with the message on stderr.
- Messages, which are spec-fixed copy:
  - pass: `Node.js 24.13.0 matches package.json engines.node.`
  - wrong version: `DevPulse needs Node.js <expected> (package.json engines.node), but this is <actual>. Switch with: nvm use <expected>`
  - missing or non-exact: `package.json engines.node must be an exact version such as 24.13.0.`

Steps:

- [ ] **Step 1: Create the fixtures and write the failing tests.** Create `$TMP/check-node-wrong/`, `$TMP/check-node-range/` and `$TMP/check-node-missing/`; stop if any of them already exists. Each gets an empty `scripts/` folder and only a `package.json`:
  - `check-node-wrong`: `{"engines":{"node":"0.0.0"}}`;
  - `check-node-range`: `{"engines":{"node":">=24"}}`;
  - `check-node-missing`: `{}`.

  The script itself is copied in only in Step 4, after it exists. The tests:
  - **(a)** In the repository, `node "$REPO/scripts/check-node.mjs"` exits 0 and prints the pass message.
  - **(b)** `node "$TMP/check-node-wrong/scripts/check-node.mjs"` exits 1, and stderr contains `needs Node.js 0.0.0` and `this is 24.13.0`.
  - **(c)** `node "$TMP/check-node-range/scripts/check-node.mjs"` exits 1 with the "exact version" message.
  - **(d)** `node "$TMP/check-node-missing/scripts/check-node.mjs"` exits 1 with the "exact version" message.
  - **(e)** `(cd "$TMP/check-node-wrong" && node "$REPO/scripts/check-node.mjs")` exits 0 and prints the pass message. It runs from a folder whose own `package.json` says 0.0.0, so a pass proves the script reads the repository's `package.json`, next to the script, and not the current folder's.
- [ ] **Step 2: Run them before implementing.** Expected: all five fail with Node's "Cannot find module". (a) and (e) find no repository script yet, and (b)–(d) find no fixture copy yet. A failure for any other reason: stop and ask.
- [ ] **Step 3: Pin Node.js.** Set `"engines": { "node": "24.13.0" }` in `package.json`, write `.nvmrc` containing `24.13.0`, and implement `scripts/check-node.mjs`.
- [ ] **Step 4: Copy the implemented script into the fixtures, then run (a)–(e) again.** Copy `$REPO/scripts/check-node.mjs` into each fixture's `scripts/` folder, then run all five tests. Expected: all pass.
- [ ] **Step 5: Go-ahead G-2.** Stop and ask David. Then:

  ```bash
  case "$(declare -p DEVPULSE_GUARD_OK 2>/dev/null)" in 'declare -- DEVPULSE_GUARD_OK="1"') ;; *) echo "STOP: the guard block did not run in this shell; use the execution procedure" >&2; exit 1;; esac
  mkdir -p "$TMP/yarn-dist" && cd "$TMP/yarn-dist" && $BOOT npm pack @yarnpkg/cli-dist@4.12.0 && tar -xzf yarnpkg-cli-dist-4.12.0.tgz
  ```

  Expected: `package/bin/yarn.js` exists. If not: stop and ask.
- [ ] **Step 6: Commit the release file, then write `.yarnrc.yml` before any `yarn` command.**
  1. Copy `package/bin/yarn.js` to `.yarn/releases/yarn-4.12.0.cjs`.
  2. Record its SHA-256, next to Corepack's cached `%LOCALAPPDATA%\node\corepack\v1\yarn\4.12.0\yarn.js` (informational).
  3. Write `.yarnrc.yml`:

     ```yaml
     yarnPath: .yarn/releases/yarn-4.12.0.cjs
     nodeLinker: node-modules
     enableTelemetry: false
     ```

  4. Add `"packageManager": "yarn@4.12.0"` to `package.json`.
- [ ] **Step 7: Verify the pin.**
  - `node .yarn/releases/yarn-4.12.0.cjs -v` prints `4.12.0`.
  - `$CLEAN yarn -v` prints `4.12.0`.
  - `COREPACK_ENABLE_NETWORK=0 yarn -v` prints `4.12.0`.
  - `yarn config get enableTelemetry` prints `false`.
  - Record `where yarn` and `corepack --version`.
  - In `git diff package.json`, only `engines` and `packageManager` change.
- [ ] **Step 8: Commit** with `build: pin Node.js 24.13.0 and Yarn 4.12.0 (task 1.3)`.

### Task 4: Install, privacy checks, first build (roadmap 1.4)

**Files:** create `yarn.lock` and `.env.yarn`; modify `.gitignore` (`!.env.yarn`) and `package.json` (`dev` and `start` scripts); `tsconfig.json` only if the build rewrites it.

**Interfaces:** consumes Task 3's toolchain. Produces `yarn dev` on `127.0.0.1:3000`, used in Task 5.

- [ ] **Step 1: Go-ahead G-3.** Stop and ask David. Then run `$BOOT yarn install`. Expected: success, and `yarn.lock` exists.
- [ ] **Step 2: Snapshot.** Record `git status --porcelain`, the first part of the N-20 file list.
- [ ] **Step 3: Run the failing telemetry test.** Run `$CLEAN yarn next telemetry status`. Expected (fails as intended): enabled.
- [ ] **Step 4: Add the switch.** Write `.env.yarn` containing exactly `NEXT_TELEMETRY_DISABLED=1`, and add `!.env.yarn` to `.gitignore` after `!.env.example`.
- [ ] **Step 5: Check the switch.**
  - `$CLEAN yarn next telemetry status` reports disabled.
  - The control, `$CLEAN node node_modules/next/dist/bin/next telemetry status`, reports enabled.

  If either differs: stop and bring the evidence to David (spec 6.3).
- [ ] **Step 6: Run the failing binding test.** `node -e "const s=require('./package.json').scripts; process.exit(/--hostname 127\.0\.0\.1/.test(s.dev)&&/--hostname 127\.0\.0\.1/.test(s.start)?0:1)"` exits 1. The server is never started before the binding is in place.
- [ ] **Step 7: Bind to loopback.** Add `--hostname 127.0.0.1` to the `dev` and `start` scripts, keeping any other flag the scaffold set. Re-run the Step 6 command. Expected: exit 0.
- [ ] **Step 8: Build.** Run `$CLEAN yarn build`. Expected: success.
- [ ] **Step 9: Search for font and telemetry hosts.**

  ```bash
  case "$(declare -p DEVPULSE_GUARD_OK 2>/dev/null)" in 'declare -- DEVPULSE_GUARD_OK="1"') ;; *) echo "STOP: the guard block did not run in this shell; use the execution procedure" >&2; exit 1;; esac
  grep -rIlE "fonts\.googleapis\.com|fonts\.gstatic\.com|telemetry\.nextjs\.org|next/font/google" src .next
  ```

  Expected: no output. Any match: stop and report the file to David.
- [ ] **Step 10: Classify what install and build changed.** Record `git status --porcelain` (the N-20 list). Every entry is either intended (`yarn.lock`, `.env.yarn`, `.gitignore`, `package.json`, a build rewrite of `tsconfig.json`) or generated output to ignore. Anything else: stop and ask.
- [ ] **Step 11: Commit** with `build: install, disable Next.js telemetry per project, bind to 127.0.0.1 (task 1.4)`.
- [ ] **Step 12: Check the tree stays clean**, in the clean environment:
  - run `yarn install`, `yarn build`, then `yarn dev` for about 20 seconds, stopped after one `curl http://127.0.0.1:3000`;
  - `yarn node -p "process.env.npm_execpath"` ends with `.yarn/releases/yarn-4.12.0.cjs`;
  - then `git status --porcelain` prints nothing.

### Task 5: Run, and check the baseline is untouched (roadmap 1.5)

**Files:** none.

**Interfaces:** consumes `<baseline-commit>` from Task 1.

- [ ] **Step 1: Serve the page.** Start `$CLEAN yarn dev` in the background, with its output captured to `$TMP/dev.log`. Then `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000` prints `200`, and `grep -i error "$TMP/dev.log"` prints nothing.
- [ ] **Step 2: Check the listening address.** In PowerShell, `Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object LocalAddress` shows only `127.0.0.1`.
- [ ] **Step 3: Record outbound connections.** Record the dev server's established connections to anything other than `127.0.0.1` or `::1`: the `node` process IDs come from `Get-CimInstance Win32_Process` command lines that contain `next`, then `Get-NetTCPConnection -OwningProcess <ids> -State Established`. Any external address is reported to David before the chunk can be `Complete.` (spec 5).
- [ ] **Step 4: David's checks.** Ask David to:
  - open `http://127.0.0.1:3000` and check the browser console for errors;
  - in a new terminal of David's own, run `where yarn`, `node -v`, `yarn -v`, `yarn config get enableTelemetry` and `yarn next telemetry status`.

  Record the replies. Then stop the dev server.
- [ ] **Step 5: Check the baseline diff.** Run `git diff <baseline-commit> -- README.md CLAUDE.md docs/REQUIREMENTS.md docs/ARCHITECTURE.md docs/IMPLEMENTATION_ROADMAP.md .claude/skills/chunk-workflow/SKILL.md`. Expected: only these changes, and nothing else:
  - the six status lines changed in Task 1, Step 11: four in the roadmap, one in README.md, one in CLAUDE.md;
  - the three AD-33–AD-35 register rows added to `docs/ARCHITECTURE.md` in Task 1, Step 12;
  - the three AD-33–AD-35 decision-log rows added to `docs/REQUIREMENTS.md` in Task 1, Step 12.

  The BL-01 row and every other existing line must be unchanged. "Last updated" may stay at 2026-11-03 on a same-day run, so the roadmap can show three changed lines rather than four.

  **How it is checked.** The checker below rebuilds each of the six files from the baseline commit plus exactly the allowed edits, and requires the working file to be byte-identical. Separately, it checks that ARCHITECTURE.md and REQUIREMENTS.md gained exactly three lines each as insertions only, that the BL-01 row is byte-identical, and that SKILL.md is unchanged. It reads the six Step 12 rows from this plan, the single source. It stops unless Task 1, Step 12 holds exactly two complete text blocks, with rows AD-33, AD-34 and AD-35 in order. The extraction command stops unless the plan holds exactly one checker block, after this step's heading. The next line stops unless the extracted checker's SHA-256 equals the recorded value. A copy of the plan altered in transit, for example by a Markdown exporter that adds backslash escapes, therefore stops instead of running a different checker. Any edit to the checker block must update that hash in the same change.

  ```bash
  case "$(declare -p DEVPULSE_GUARD_OK 2>/dev/null)" in 'declare -- DEVPULSE_GUARD_OK="1"') ;; *) echo "STOP: the guard block did not run in this shell; use the execution procedure" >&2; exit 1;; esac
  # <baseline-commit> is the hash recorded in docs/BASELINE.md
  BX="$TMP/baseline-export"; CK="$TMP/check-baseline-diff.mjs"
  [ ! -e "$BX" ] && [ ! -e "$CK" ] || { echo "STOP: $BX or $CK already exists; ask David" >&2; exit 1; }
  mkdir -p "$TMP" || exit 1
  mkdir "$BX" || exit 1
  cleanup_bx() { rc=$?; trap - EXIT
    if [ "$BX" = "$TMP/baseline-export" ] && [ -d "$BX" ] && [ ! -L "$BX" ]; then rm -rf -- "$BX"; fi
    if [ "$CK" = "$TMP/check-baseline-diff.mjs" ] && [ -f "$CK" ] && [ ! -L "$CK" ]; then rm -f -- "$CK"; fi
    if [ -e "$BX" ] || [ -L "$BX" ] || [ -e "$CK" ] || [ -L "$CK" ]; then echo "STOP: could not remove $BX or $CK" >&2; [ "$rc" -ne 0 ] || rc=1; fi
    exit "$rc"; }
  trap cleanup_bx EXIT
  PLAN_W="$(cygpath -w "$REPO/docs/superpowers/plans/2026-11-03-chunk-01-toolchain.md")" || exit 1
  for f in README.md CLAUDE.md docs/REQUIREMENTS.md docs/ARCHITECTURE.md docs/IMPLEMENTATION_ROADMAP.md .claude/skills/chunk-workflow/SKILL.md; do
    mkdir -p "$BX/$(dirname "$f")" && git -C "$REPO" show "<baseline-commit>:$f" > "$BX/$f" || exit 1
  done
  node -e 'const L=require("fs").readFileSync(process.argv[1],"utf8").split("\n");const H=L.flatMap((l,i)=>l.startsWith("- [ ] **Step 5: Check the baseline diff")?[i]:[]);const J=L.flatMap((l,i)=>l==="  \x60\x60\x60js"?[i]:[]);const e=J.length===1?L.indexOf("  \x60\x60\x60",J[0]+1):-1;if(H.length!==1||J.length!==1||J[0]<H[0]||e<0){console.error("STOP: the plan must hold exactly one checker block, after Task 5, Step 5");process.exit(1)}process.stdout.write(L.slice(J[0]+1,e).map(l=>l.replace(/^  /,"")).join("\n")+"\n")' "$PLAN_W" > "$CK" || exit 1
  [ "$(sha256sum < "$CK" | cut -d' ' -f1)" = "3e1f084d4a9b58b273324f91e9bbb2a7136138388cf716f58beb8bff050cf0b9" ] || { echo "STOP: the extracted checker's SHA-256 differs from the one recorded here; this copy of the plan may have been altered; ask David" >&2; exit 1; }
  node "$(cygpath -w "$CK")" "$(cygpath -w "$BX")" "$(cygpath -w "$REPO")" "$PLAN_W" || exit 1
  git -C "$REPO" diff "<baseline-commit>" -- README.md CLAUDE.md docs/REQUIREMENTS.md docs/ARCHITECTURE.md docs/IMPLEMENTATION_ROADMAP.md .claude/skills/chunk-workflow/SKILL.md
  ```

  Expected: one `OK <file>` line per file, then `BASELINE DIFF OK`. Any `FAIL` line, or a non-zero exit, means stop and report to David. The `git diff` output is shown for the record only; the checker decides. The trap removes only the export folder and the checker file, both proved absent before creation. It re-checks their exact paths and refuses links, keeps the step's exit status when cleanup succeeds, and exits non-zero with STOP if either can't be removed.

  `check-baseline-diff.mjs`:

  ```js
  // Chunk 1, task 1.5: baseline-diff allow-list check.
  // Usage: node check-baseline-diff.mjs <baseline-export-dir> <repo-dir> <plan-file>
  import fs from "node:fs";
  import path from "node:path";

  const [baseDir, repoDir, planFile] = process.argv.slice(2);
  if (!baseDir || !repoDir || !planFile) {
    console.error("usage: node check-baseline-diff.mjs <baseline-export-dir> <repo-dir> <plan-file>");
    process.exit(1);
  }
  let failures = 0;
  const fail = (msg) => { console.error("FAIL: " + msg); failures++; };

  const FILES = ["README.md", "CLAUDE.md", "docs/REQUIREMENTS.md", "docs/ARCHITECTURE.md",
    "docs/IMPLEMENTATION_ROADMAP.md", ".claude/skills/chunk-workflow/SKILL.md"];
  const ROADMAP_START = "- **Roadmap start:** BL-01 approved by David on 2026-11-03 (see the [REQUIREMENTS decision log](REQUIREMENTS.md#decision-log)); Chunk 1 is in progress.";
  const BL01_PREFIX = "| 2026-11-03 | Baseline | BL-01 |";

  // The six Task 1, Step 12 rows, read from the plan. Both anchors must be unique
  // line starts, in order; Step 12 must hold exactly two complete text blocks.
  const planLines = fs.readFileSync(planFile, "utf8").split("\n");
  const stopPlan = (msg) => { console.error("FAIL: plan: " + msg); process.exit(1); };
  const onlyLine = (test, label) => {
    const hits = planLines.flatMap((l, i) => (test(l) ? [i] : []));
    if (hits.length !== 1) stopPlan(`expected exactly one ${label}, found ${hits.length}`);
    return hits[0];
  };
  const s12 = onlyLine((l) => l.startsWith("- [ ] **Step 12: Record David's Q1–Q3 decisions**"), "Task 1, Step 12 heading");
  const t2 = onlyLine((l) => l.startsWith("### Task 2:"), "Task 2 heading");
  if (t2 < s12) stopPlan("Task 1, Step 12 is not before Task 2");
  const blocks = [];
  let open = null;
  for (const line of planLines.slice(s12 + 1, t2)) {
    const s = line.trim();
    if (open === null && s === "```text") open = [];
    else if (open !== null && s === "```") { blocks.push(open); open = null; }
    else if (open !== null) open.push(s);
  }
  const AD_IDS = ["AD-33", "AD-34", "AD-35"];
  const rowsOk = (rows, prefix) => rows.length === 3
    && rows.every((r, k) => r.startsWith(prefix(AD_IDS[k])) && r.endsWith(" |"));
  if (open !== null || blocks.length !== 2
    || !rowsOk(blocks[0], (id) => `| ${id} | `)
    || !rowsOk(blocks[1], (id) => `| 2026-11-03 | Technical | ${id} | `)) {
    stopPlan("Task 1, Step 12 must hold two complete text blocks: the AD-33, AD-34, AD-35 register rows, then their three decision-log rows");
  }
  const [adRows, logRows] = blocks;

  function replaceOnce(text, from, to, label) {
    const n = text.split(from).length - 1;
    if (n !== 1) { fail(`${label}: expected exactly one match, found ${n}`); return text; }
    return text.replace(from, () => to);
  }
  function lineOnce(lines, test, label) {
    const hits = lines.flatMap((l, i) => (test(l) ? [i] : []));
    if (hits.length !== 1) { fail(`${label}: expected exactly one line, found ${hits.length}`); return -1; }
    return hits[0];
  }
  function insertAfter(text, test, rows, label) {
    const lines = text.split("\n");
    const i = lineOnce(lines, test, label);
    if (i >= 0) lines.splice(i + 1, 0, ...rows);
    return lines.join("\n");
  }
  function roadmap(base, actual) {
    const a = base.indexOf("### Chunk 1 "), b = base.indexOf("### Chunk 2 ");
    if (a < 0 || b < a) { fail("roadmap: Chunk 1 section not found"); return base; }
    let t = base.slice(0, a)
      + replaceOnce(base.slice(a, b), "**Status:** Not started.", "**Status:** In progress.", "roadmap Chunk 1 Status")
      + base.slice(b);
    t = replaceOnce(t, "| In-progress chunks | 0 |", "| In-progress chunks | 1 |", "roadmap In-progress chunks");
    const lines = t.split("\n");
    const s = lineOnce(lines, (l) => l.startsWith("- **Roadmap start:**"), "roadmap Roadmap start");
    if (s >= 0) lines[s] = ROADMAP_START;
    const u = lineOnce(lines, (l) => l.startsWith("| Last updated |"), "roadmap Last updated");
    const m = actual.match(/^\| Last updated \| (\d{4}-\d{2}-\d{2}) \|$/m);
    if (u >= 0) {
      const valid = m && !Number.isNaN(Date.parse(m[1] + "T00:00:00Z"))
        && new Date(m[1] + "T00:00:00Z").toISOString().slice(0, 10) === m[1] && m[1] >= "2026-11-03";
      if (valid) lines[u] = `| Last updated | ${m[1]} |`;
      else fail(`roadmap: Last updated must be a valid date on or after 2026-11-03, found ${m ? m[1] : "no matching row"}`);
    }
    return lines.join("\n");
  }
  const BUILD = {
    "README.md": (b) => replaceOnce(b, "They are waiting for David's baseline approval (BL-01).",
      "David approved them as the planning baseline (BL-01) on 2026-11-03.", "README.md status sentence"),
    "CLAUDE.md": (b) => replaceOnce(b, "Chunk 1 starts only after David's baseline approval, BL-01.",
      "David approved the planning baseline (BL-01) on 2026-11-03, and Chunk 1 is in progress.", "CLAUDE.md status sentence"),
    "docs/REQUIREMENTS.md": (b) => insertAfter(b, (l) => l.startsWith(BL01_PREFIX), logRows, "REQUIREMENTS.md BL-01 row"),
    "docs/ARCHITECTURE.md": (b) => insertAfter(b, (l) => l.startsWith("| AD-32 |"), adRows, "ARCHITECTURE.md AD-32 row"),
    "docs/IMPLEMENTATION_ROADMAP.md": roadmap,
    ".claude/skills/chunk-workflow/SKILL.md": (b) => b,
  };
  function insertionsOnly(f, base, actual, n) {
    const b = base.split("\n"), a = actual.split("\n");
    if (a.length !== b.length + n) { fail(`${f}: expected ${n} added lines, found ${a.length - b.length}`); return; }
    let k = 0;
    for (const line of a) if (k < b.length && line === b[k]) k++;
    if (k !== b.length) fail(`${f}: an existing line was changed or removed`);
  }

  for (const f of FILES) {
    let base, actual;
    try {
      base = fs.readFileSync(path.join(baseDir, f), "utf8");
      actual = fs.readFileSync(path.join(repoDir, f), "utf8");
    } catch (e) { fail(`${f}: ${e.message}`); continue; }
    const before = failures;
    const expected = BUILD[f](base, actual);
    if (expected !== actual) {
      const e = expected.split("\n"), a = actual.split("\n");
      let k = 0;
      while (k < Math.max(e.length, a.length) && e[k] === a[k]) k++;
      fail(`${f}: not exactly the allowed edits; first difference at line ${k + 1}\n  expected: ${JSON.stringify(e[k])}\n  actual:   ${JSON.stringify(a[k])}`);
    }
    if (f === "docs/ARCHITECTURE.md" || f === "docs/REQUIREMENTS.md") insertionsOnly(f, base, actual, 3);
    if (f === "docs/REQUIREMENTS.md") {
      const bl = base.split("\n").filter((l) => l.startsWith(BL01_PREFIX));
      if (bl.length !== 1 || actual.split("\n").filter((l) => l === bl[0]).length !== 1) fail("REQUIREMENTS.md: the BL-01 row is not byte-identical");
    }
    if (f === ".claude/skills/chunk-workflow/SKILL.md" && base !== actual) fail(`${f}: must be unchanged`);
    if (failures === before) console.log("OK " + f);
  }
  if (failures) { console.error(`BASELINE DIFF FAILED (${failures})`); process.exit(1); }
  console.log("BASELINE DIFF OK");
  ```

- [ ] **Step 6: Check the branches.**
  - `git branch --show-current` prints `chunk-01-toolchain`.
  - `git log main --oneline` shows only the baseline commit.
  - `git remote -v` prints nothing.

### Task 6: Verify, self-review, and update the docs (skill Steps 6–7)

**Files:** modify the roadmap (Chunk 1 ticks, manual-verification note, Status, progress summary, change log), and README.md and CLAUDE.md where Chunk 1 made facts stale (status, available commands).

- [ ] **Step 1: Run the checks that exist.** These are `$CLEAN yarn tsc --noEmit`, and `yarn lint` if the scaffold defined it. Report that `yarn check`, `yarn test` and `yarn test:e2e` don't exist until Chunk 2. Run markdownlint on the changed Markdown through VS Code.
- [ ] **Step 2: Self-review.** Review the branch diff against the spec, this plan, TR-01, TR-02, TR-03, TR-12 and CLAUDE.md, labelled **self-review, not independent** (OD-15). Fix confirmed issues, then re-run the affected checks.
- [ ] **Step 3: Update the roadmap.**
  - Tick 1.1–1.5 with their commit hashes.
  - Add the italic manual-verification note: date, what was checked, what was not.
  - Record the N-17 and N-20 evidence.
  - Set `Complete.` only if the Definition of done is met, including both Spec-must-resolve items and no unreported outbound connection; otherwise leave it `In progress.`.
  - Update the progress summary and the change log.
- [ ] **Step 4: Update other docs.** In README.md and CLAUDE.md, update the status and the commands that now exist (`yarn dev`, `yarn build`). Commit with `docs: record Chunk 1 verification`.
- [ ] **Step 5: Stop.** Report to David using the skill's final-report format, and ask for the go-ahead to merge `chunk-01-toolchain` into `main`. Never merge or push without it.

## Execution record

A record of what has actually run. The task steps above stay unticked here; Task 6 records completion in the roadmap.

### 2026-11-03: Task 1 (roadmap 1.1), complete

- **Steps 1–2:** the six fingerprints and the BL-01 row passed, there was no existing or parent repository, then `git init -b main` ran. The remote list is empty. Everything ran in one guarded shell.
- **Steps 3–6:**
  - `.gitattributes`, `.editorconfig` and `.gitignore` were written verbatim from this plan.
  - The isolated ignore test first printed `?? .env.example`, `?? .env.local`, `?? data/dummy.txt` (failing, as intended).
  - With `.gitignore` it printed exactly `?? .env.example` and `?? .gitignore`.
  - `$IT` was removed, and `$TMP` was kept.
- **Steps 7–9:**
  - Exactly 15 files were staged, and the baseline commit `1121f49495a337bb74f9704bc1cfec073937fd5c` was made on `main`.
  - Every committed baseline blob matched its BL-01 fingerprint.
  - All 15 tracked files have 0 carriage returns. There is one commit and no remote.
- **Step 10:** `chunk-01-toolchain` was created, with 0 carriage returns after the switch. The commit hash was recorded in `docs/BASELINE.md` (`c21abe3`).
- **Steps 11–12:** Chunk 1 set to In progress (`be35148`, 5 changed lines). The AD-33–AD-35 register and decision-log rows were added (`881223d`, 3 insertions each, no deletions). Both steps were confirmed by David before they ran.

### 2026-11-03: Task 2, Step 1 (G-1a), complete; README verification skipped

- **Approval:** David approved G-1a, registry metadata only.
- **Commands run**, through the execution procedure:
  - `npm view create-next-app version` returned `16.4.4`.
  - `npm view create-next-app@16.4.4 readme` returned 0 bytes, so the versioned README was empty.
- **One extra request, outside the approval:** a third metadata-only query, `npm view create-next-app@16.4.4 dist-tags.latest time.modified`. It returned `latest = 16.4.4` and `modified = 2026-11-03T09:08:15.199Z`. It was reported to David; nothing was downloaded.
- **David's decision:**
  - skip the package-level README request, with no further network request;
  - keep `create-next-app` 16.4.4 (no older pin);
  - verify all ten options with G-1b's `--help` output.
- **Repository:** unchanged by G-1a; the status was clean before and after.
- **Next:** G-1b (Task 2, Step 2), which is **not approved yet**.

### 2026-11-03: G-1b split into two gates (David's decision)

- **G-1b.1 (Task 2, Step 2):** run `npx --yes create-next-app@16.4.4 --help` in `$TMP` only, verify the ten options, and report the output. Nothing is scaffolded.
- **G-1b.2 (Task 2, Step 3):** scaffold inside `%LOCALAPPDATA%\Temp\devpulse-chunk01` only, with the approved flags, including `--skip-install` and `--disable-git`. No install, and no repository change. It needs a separate explicit approval after David reviews G-1b.1.
- **Wording kept:** the AD-34 rows (Task 1, Step 12, already committed) still say "a separate approval (G-1b)". That stays accurate, because G-1b is now two separate approvals. The rows are kept byte-identical because Task 5's baseline check compares them with the committed rows.
- **Next:** G-1b.1, which is **not approved yet**.

### 2026-11-03: Task 2, Step 2 (G-1b.1), complete

- **Approval:** David approved G-1b.1, CLI verification only.
- **Command run**, through the execution procedure: `mkdir -p "$TMP" && cd "$TMP" && $BOOT npx --yes create-next-app@16.4.4 --help`.
- **Result:**
  - version 16.4.4; exit code 0;
  - all ten required options appear in the output: `--ts`, `--tailwind`, `--eslint`, `--app`, `--src-dir`, `--import-alias`, `--use-npm`, `--skip-install`, `--disable-git` and `--yes`;
  - the output also lists `--agents-md` (default), `--agent-feedback` and `--no-agent-feedback`, and says `--yes` uses saved preferences or defaults for options not given.
- **Effects:** nothing was scaffolded; `$TMP` was empty afterwards; the repository was clean before and after. The package was downloaded to the normal npm cache, outside the repository and `$TMP`.

### 2026-11-03: G-1b.2 command amended (David's decision)

- **Added:** `--no-agent-feedback`, explicitly, to the Task 2, Step 3 scaffold command.
- **Not added:** `--reset-preferences`. David doesn't approve clearing user-level preferences.
- **Kept:** `--yes` and every other approved flag, and the default `--agents-md` behaviour; Task 2, Step 5 removes any `AGENTS.md`.
- **Next:** G-1b.2 (Task 2, Step 3), which is **not approved yet**.
