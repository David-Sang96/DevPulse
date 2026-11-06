---
name: chunk-workflow
description: End-to-end workflow for developing exactly one DevPulse roadmap chunk. It picks the chunk, checks gates and dependencies, writes the spec and plan, stops for David's approval, then implements, verifies, reviews and updates the roadmap. Use when asked to start, plan, continue or finish a chunk, by number ("chunk 7") or by name ("timezone utilities").
argument-hint: "<chunk number or chunk name>"
---

# Chunk workflow

Develop **one** roadmap chunk, from selection to commit. The input is `$ARGUMENTS`: a chunk number (`7`, `chunk 7`) or part of a chunk title (`timezone`).

`CLAUDE.md` is the rulebook. This skill gives the order of work and the points where you stop. It does not repeat the rules, so follow `CLAUDE.md` sections by name wherever they are referenced below.

## Non-negotiables

- **One chunk only.** Never pull in tasks from another chunk, even small or "obvious" ones. Note them for later instead.
- **Approval comes before code.** Stop at Step 4 and wait for David's explicit approval. Silence, "looks fine?" or approval given for an earlier chunk do not count.
- **Labels are binding.** An Assumption (A-NN) or a Proposed item (AD-NN, P-NN) is not an approved decision. Only a Decision log row that counts as Resolved under the **Decision status rule** (Step 2) turns any of them into an approved decision.
- **No invention.** If the roadmap, requirements or decision log don't answer a product question, ask David. Never fill the gap yourself.
- **Never claim done without evidence.** That means real command output and recorded manual checks, per the roadmap's Definition of done.

## Step 1 — Select the chunk

1. Read `docs/IMPLEMENTATION_ROADMAP.md`. Match `$ARGUMENTS` against the `### Chunk N — Title` headings.
   - If nothing matches, or more than one heading matches, list the candidates and ask David which chunk is meant. Do not guess.
2. Read the whole chunk section: Goal, Difficulty, Dependencies, the tasks with their Test and Acceptance lines, Manual verification, and Status.
3. Read the roadmap's Legend, Gates, "How to use it" and Definition of done sections.

## Step 2 — Check gates, dependencies and the current state

Run every check below before writing anything. If any row in the stop table applies, **stop and report**. Do not create a spec for a chunk that cannot start.

| Check | How | If it fails |
| --- | --- | --- |
| Chunk status | The chunk's `**Status:**` line, which uses exactly one of the values in the roadmap legend | `Complete.`: report that it is already complete and stop. `In progress.`: resume at the first incomplete step and say where. `Skipped (OD-NN).`: stop and report. |
| ⛔ gate | The heading contains ⛔. Check every OD named on the chunk's **Dependencies line** with the **Decision status rule** (below). | Proceed only if every OD is **Resolved**. If any OD is Unresolved, stop: name it, give its options and recommendation from `docs/REQUIREMENTS.md`, and ask David to decide. If any OD is **Declined**, stop and report that the chunk is skipped. |
| Dependencies | Only the **leading list of chunk numbers** on the Dependencies line counts. Every chunk in it is **satisfied**: its Status is `Complete.`, or `Skipped (OD-NN).` with that OD Resolved as declined | Stop. List each unsatisfied dependency and its status. Suggest running this workflow on the earliest one. Never work around a missing dependency. |
| Task-level chunk condition | The Dependencies line says "Chunk NN Complete needed before task(s) N.M" | The chunk may start. Stop before the named tasks until chunk NN is `Complete.`. |
| Spec must resolve | The chunk's `**Spec must resolve:**` line, if any, and the roadmap's "Carried review findings" | The chunk may start. The spec (Step 3) must contain one section per listed item, saying how it is resolved or how it will be verified on the real PC. The chunk can't be `Complete.` until each is resolved and its verification recorded. Only a decision-log row of Type `Carried finding` can drop an item. |
| Decision before completion | The Dependencies line names an OD after "Decision before completion" | Implementation may start, but only for work that does not depend on the outcome. Keep the Proposed default in one place, flag the OD in the spec, and never mark the chunk complete until the OD is **Resolved**. If the line says a task needs it earlier (for example "needed before task 29.4"), stop before that task until the OD is Resolved. |
| Confirm before completion | The Dependencies line names an assumption after "Confirm before completion" | Implementation may start, building on the assumption as written. Flag it in the spec, and never mark the chunk complete until the assumption is confirmed in the decision log (Decision status rule). If David rejects it, stop and ask how to proceed. |
| Roadmap start | Chunk 1 only. **While no baseline commit exists:** BL-01 is Resolved in the decision log, and the six baseline files still match the hashes in `docs/BASELINE.md`. **After the baseline commit:** `git diff <baseline-commit> -- <six files>` shows only the changes Chunk 1 allows (task 1.5). | Stop and ask. A hash mismatch before the baseline commit means BL-01 must be re-approved. |
| Go-ahead tasks | Tasks or manual checks marked **Go-ahead at execution time**, plus every merge into `main`, every live update and switching retention to active | Plan them, but do them only after a separate, explicit approval at execution time (Step 5). |

### Decision status rule

Read the status from the **Decision log** table at the end of `docs/REQUIREMENTS.md`, never from anywhere else. The "Open product decisions" table, the OD subsections, the recommendations, the ARCHITECTURE decision register and the roadmap all *describe* decisions; none of them *records* one.

Each Decision log row has a **Type**: `Baseline` (BL-NN), `Product decision` (OD-NN), `Assumption` (A-NN), `Technical` (AD-NN, P-NN) or `Carried finding` (N-NN, F-NN, L-x). A row only ever affects the ID it names: approving the baseline confirms no assumption and resolves no decision, and the reverse is also true.

A baseline approval, OD, assumption or Proposed item is **Resolved** only when the Decision log has a row for that exact ID where:

- **Decided by** is David, and **Source** says where David gave it (a date plus a quote or message reference);
- **Choice** states a concrete outcome that David approved: a named option, a value, or "confirmed";
- the row is not superseded. If an ID has several rows, the latest dated row wins.

Anything else is **Unresolved**. In particular:

- there is no Decision log row for the ID;
- the status is Pending, Open, Proposed, Unresolved or Deferred;
- the Choice only repeats a recommendation, or says "recommended", "proposed", "tentative" or "to be confirmed";
- the row is not attributed to David;
- the row is unclear. In that case, ask David; do not interpret it.

A row whose Choice is **Declined** (for example OD-07 declined, or OD-01 declined for "no provider") is Resolved. However, it means the gated chunk is skipped, or that its requirement stays unmet by decision. Report that, and do not implement.

David approving the planning baseline (BL-01, covering the six baseline files including this skill) does **not** resolve any assumption, Proposed item or OD. Each one needs its own Decision log row. BL-01 only lifts the roadmap-start gate for Chunk 1, and it is recorded with the procedure in `docs/REQUIREMENTS.md` ("Baseline approval procedure").

Validation examples, using OD-04 (⛔ for Chunk 27) and OD-06 (decision before completion for Chunk 18):

| Decision log state | Status | ⛔ Chunk 27 | Chunk 18 |
| --- | --- | --- | --- |
| No row; the Open product decisions table says `Pending` | Unresolved (open) | Stop and ask David | May start; can't be `Complete.` |
| Row: Choice "Proposed: 2 calendar months from published date", Decided by Claude | Unresolved (proposed, not David) | Stop and ask David | May start; can't be `Complete.` |
| Row: Choice "Recommendation accepted?" or "2 calendar months (to be confirmed)" | Unresolved (unclear or tentative) | Stop and ask David | May start; can't be `Complete.` |
| Row: Choice "Deferred until after Chunk 26", Decided by David | Unresolved (deferred) | Stop and report the deferral | May start; can't be `Complete.` |
| Row: Choice "Approved: 2 calendar months from published date, MYT", Decided by David | Resolved | Proceed | May be `Complete.` once everything else in the Definition of done passes |
| Two rows: "Approved: 60 days" (2026-11-10), then "Deferred" (2026-11-20) | Unresolved (latest row wins) | Stop and report | May start; can't be `Complete.` |
| Row for OD-07: Choice "Declined", Decided by David | Resolved (declined) | Chunk 28 is skipped; stop and report | — |

Then gather context, reading only the parts that apply:

- **`docs/REQUIREMENTS.md`:** every requirement ID that the roadmap's Requirement traceability table maps to this chunk. Also the open decisions (ODs) and assumptions the chunk touches, and the decision log.
- **`docs/ARCHITECTURE.md`:** the components, data model, decisions (AD-NN) and risks (R-NN) the chunk touches.
- **Existing implementation:** the files and tests that earlier chunks produced. Check for drift between the code and the docs, and report any as a finding. Do not silently "fix" it.
- **Earlier specs and plans:** anything relevant in `docs/superpowers/specs/` and `docs/superpowers/plans/`. Superseded plans and historical records (marked as such) are history, not instructions.

## Step 3 — Write the spec and the plan

Create any missing directories. Steps 1–4 write nothing to the six baseline files (`CLAUDE.md`, `README.md`, `docs/REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_ROADMAP.md` and this skill); the spec and plan go under `docs/superpowers/` only.

**Spec:** `docs/superpowers/specs/YYYY-MM-DD-chunk-NN-<slug>-design.md`. It records *what* and *why*:

1. The chunk's goal and scope: in scope means exactly this chunk's tasks; anything else is listed as out of scope.
2. The requirement IDs covered, copied from the traceability table.
3. Each task's behaviour, with its acceptance criteria quoted from the roadmap.
4. Decisions, split under four labels:
   - **Approved:** only Decision log rows that count as Resolved;
   - **Proposed:** AD/P items this chunk relies on;
   - **Assumptions:** A-NN;
   - **Open questions for David.**
5. Blockers, risks (R-NN plus any new ones) and any decision before completion.
6. One section per `**Spec must resolve:**` item: how it is resolved, or how it will be verified on the real PC.
7. The manual verification plan, including any real Windows checks needed under the scheduling proof rule in `CLAUDE.md`.

**Plan:** `docs/superpowers/plans/YYYY-MM-DD-chunk-NN-<slug>.md`. It records *how*. If the `superpowers:writing-plans` skill is available, use it, but ignore its "REQUIRED SUB-SKILL: subagent-driven-development" header. Execute the plan inline in this session, and never dispatch implementer or reviewer subagents while OD-15 is unresolved.

1. The files to create or modify, with their interfaces: exact names and types.
2. Test-first steps for every task: the failing test, how to run it, the implementation, how to run it again.
3. The verification commands and the output that counts as a pass.
4. Each go-ahead task, marked as needing approval at execution time.
5. The commit points.

Neither document may add requirements, change product behaviour, or decide an open OD.

## Step 4 — Approval gate (STOP)

Present the following to David, then **end your turn**:

- the paths of the spec and the plan;
- a short summary of each;
- the open questions and assumptions that need David's answer;
- each `**Spec must resolve:**` item and how the spec resolves it.

Ask for explicit approval of both documents. If David asks for changes, revise them and present them again. Implementation starts only after a clear "approved" for **this** chunk's spec and plan.

## Step 5 — Implement (after approval only)

1. **Git.**
   - If `.git` is missing and this is not Chunk 1, stop and ask.
   - **Chunk 1 order:** run task 1.1 **first**, before writing anything to the six baseline files:
     1. check that BL-01 is resolved and the hashes match;
     2. `git init -b main`;
     3. make the baseline commit;
     4. create `chunk-01-toolchain`.

     Only then continue with item 3 below, on that branch.
   - Every other chunk works on the branch `chunk-NN-slug`, made from `main`.
   - Never add a remote and never push (see `CLAUDE.md`, "Stop and ask David before").
2. **Databases and the live checkout.** Work only against the development database or temporary test databases. Never run development code, seeding or the `fake` provider against the live checkout's database, and never run `yarn live:update` without David's go-ahead for that specific commit. In the live checkout nothing is collected until retention is active (AD-32): runs record `retention_inactive`, and a failed cleanup records `retention_cleanup_failed`. Never switch `retention.active` on without David's go-ahead.
3. Set the chunk's Status to `In progress.` and update the progress summary. For Chunk 1, this happens only after task 1.1, on `chunk-01-toolchain`.
4. Follow the approved plan task by task, writing tests first (`CLAUDE.md`, "Testing rules"). Stay inside the plan. Fixtures are synthetic, and logs and errors never contain article content (`CLAUDE.md`, "Security and data handling").
   - If the plan turns out to be wrong, or you need a product decision, stop and ask. Never improvise scope.
   - If the work would change a chunk that is already complete, don't reopen it silently: stop, and propose a follow-up task in the chunk that the triggering decision gates.
5. Before each **Go-ahead at execution time** task, stop and ask David for explicit approval at that moment. This applies to Windows settings, scheduled tasks, tests that interrupt the PC or network, live paid calls, real-source runs, merges into `main` and live updates.

## Step 6 — Verify, review, fix

1. **Checks.** Run whichever of these exist: `yarn check` (or `yarn typecheck`, `yarn lint`, `yarn lint:md` and `yarn test`), and `yarn test:e2e` when UI or flows changed. Before Chunk 2, run whatever checks exist and say which ones are missing. Read the real output; a check that fails is not done.
2. **Code review, as OD-15 allows.** Check OD-15 with the Decision status rule.
   - **Unresolved (the default):** do not run any separate AI review command, agent or subagent. That includes `/code-review`, reviewer subagents and any other AI review tool, and `CLAUDE.md`'s "Pre-PR code review" section stays inactive. Do a structured self-review of the diff against the spec, the plan, the requirement IDs and `CLAUDE.md`, and label it in the report as a **self-review, not independent**.
   - **Resolved:** use only the review option David chose, sending only what that option allows.
     - **`/code-review` in two sections.** This applies only when OD-15 is Resolved and David's option allows the `/code-review` skill named in `CLAUDE.md`'s "Pre-PR code review" section. Ask it for two separate sections instead of one blended list, and never merge or rerank findings across them:
       - **Standards:** the diff against the `CLAUDE.md` conventions and the `docs/ARCHITECTURE.md` decisions.
       - **Spec:** the diff against this chunk's spec and plan, and the requirement IDs it touches. Run it only if David's option allows docs to be sent. If it doesn't, cover this section by self-review and say so in the report.
       - Each section ends with its own worst-issue line. Triage (item 3) and `CLAUDE.md`'s severity rules (fix critical and high findings; disclose medium and low) apply to each section separately.
       - Never use `ultra`, `--comment`, `--post` or `--fix`.
   - Whatever the option, never let a reviewer read or receive `.env.local`, databases, backups, logs, anything in `data/`, or real article content.
3. **Triage.** Fix each confirmed issue test-first, then rerun the checks. For a finding you decline, record your reason. Review again after the fixes.
   - If issues remain after two review rounds, stop and report them to David.
4. **Acceptance.** Check every task's Acceptance line against real evidence.
   - Do the chunk's Manual verification and record the date, the commands and the real output.
   - Scheduling chunks need real Windows evidence (`CLAUDE.md`, "Scheduling proof rule").
   - Output from the `fake` provider is never evidence of real simplification (`CLAUDE.md`, "Simplification honesty").
5. **Decision and confirmation before completion.** If the chunk has either, re-check each OD and assumption with the **Decision status rule** (Step 2). If any is Unresolved, leave the chunk `In progress.`, mark the outstanding item, and ask David.
6. **Spec must resolve.** Record the resolution and verification evidence for each `**Spec must resolve:**` item.
7. **Chunk 1 only:** run the baseline diff check from task 1.5 now, before Step 7.

## Step 7 — Update the docs and commit

Only after Step 6 passes:

1. **Commit the implementation** locally on the chunk branch, with a clear message that names the chunk. Commits are part of the approved plan and happen only after verification.
   - Stage only this chunk's files.
   - Never use `--no-verify`, and never skip hooks.
2. **Update the roadmap** in a follow-up commit on the same branch:
   - tick each task with its commit hash, for example `- [x] **7.1** (abc1234)`;
   - add the italic Manual verification note saying what was checked, when, and what was *not* checked;
   - set the Status line. Use `Complete.` only when the Definition of done is met, including every decision and confirmation before completion and every `**Spec must resolve:**` item; otherwise leave it `In progress.`;
   - update the progress summary and the change log.
3. **Update other docs** where the chunk changed facts, following `CLAUDE.md`, "Documentation rules". For example, ARCHITECTURE's folder layout, or the README's status. Leave unrelated docs alone.
4. **Merging.** Merge into `main` only with David's explicit approval at that moment. Never push.
5. **Live checkout.** Never update the live checkout as part of a chunk unless the chunk's plan includes it and David gives the go-ahead for that specific commit (`yarn live:update`).

## Final report

End with:

1. The chunk and what was built.
2. Files created or modified.
3. Commands run, with their real output (summarized; failures in full).
4. What passed and what failed.
5. Review findings: fixed, and declined with reasons.
6. Acceptance criteria met, with the evidence for each.
7. What remains unverified, and any open decisions.
8. The roadmap status after this chunk.
