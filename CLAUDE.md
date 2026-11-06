# DevPulse — Claude Code instructions

## Project context

- DevPulse is a local-first developer news dashboard for David's personal Windows PC. Every Monday at 08:00 Malaysia time (`Asia/Kuala_Lumpur`) it collects last week's developer news, then rewrites each article in simple English for junior developers.
- Windows Task Scheduler runs the collection as the task `DevPulse-Weekly-News-Collection`, using the command `yarn news:sync`.
- It is not a chatbot, and no local AI model is built. David owns the project and makes all product decisions.
- Chunks 1 (repository and toolchain) and 2 (quality tooling) are complete; the app is still the Next.js scaffold, and no DevPulse feature exists yet. Read `docs/IMPLEMENTATION_ROADMAP.md` before doing any work. David approved the planning baseline (BL-01) on 2026-11-03, and Chunks 1 and 2 are complete. Requirements live in `docs/REQUIREMENTS.md` and the design in `docs/ARCHITECTURE.md`.

## Locked stack

- **Dashboard:** Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui.
- **Data:** SQLite with Drizzle ORM.
- **Collection:** a Node.js collection script run with `tsx`, using RSS/Atom feeds and permitted public APIs.
- **Scheduling:** Windows Task Scheduler.
- **Testing:** Vitest and Playwright.
- **Package manager:** Yarn.

Any change to this stack needs a clear technical reason and David's approval.

## Commands

**Available now:** `yarn dev` and `yarn start` (both bound to `127.0.0.1`), `yarn build`, `yarn lint`, `yarn typecheck`, `yarn lint:md`, `yarn format` and `yarn format:check`, `yarn test` and `yarn test:e2e`, `yarn check` (Node version check, typecheck, lint, `lint:md` and unit tests) and `yarn verify` (`check` plus `test:e2e`).

Planned, not available yet:

- **Chunk 3:** `yarn news:sync`.
- **Chunk 4:** `yarn db:generate` and `yarn db:migrate`.
- **Chunk 18:** `yarn db:seed`.
- **Chunk 27:** `yarn news:cleanup`.
- **Chunk 29:** `yarn live:update` and the `task:*` scripts.

## Architecture principles

These principles carry Proposed decisions (AD-NN in `docs/ARCHITECTURE.md`). They are the working design, changed only through a chunk spec or a Technical decision-log row. Approving the baseline (BL-01) doesn't make them approved product decisions. The exception is AD-32: it is David's r4 requirement, not an ordinary Proposed decision. No chunk spec or ordinary Technical row can change it; only David's explicit decision can.

- **Entry points:** there are two, the dashboard and the collector, and both share `src/lib`.
  - The collector never imports Next.js; a lint rule enforces this.
  - The dashboard never fetches news and never calls the AI provider.
- **Shared state:** SQLite is the only state the two share. Use WAL mode, short transactions and one connection per process.
- **Two folders, separate databases:** develop in this folder against `data/devpulse.dev.db` (tests use temporary databases). Real use and scheduled runs happen only in the separate live checkout, with its own `data/devpulse.db`, updated by `yarn live:update` after David's go-ahead. Never touch the live database from development code, seeding or the `fake` provider.
- **Live collection waits for retention (AD-32, David's r4 requirement):** in the live checkout, the collector records `retention_inactive` and collects nothing until retention is active: OD-04 and OD-05 resolved, Chunk 27 complete and verified, the approved rule deployed, and cleanup succeeding at the start of each run, before collection. In development, cleanup runs at the end of the run instead.
- **Time:** store UTC. Compute every Malaysia-time date in `src/lib/time/`, and never write week maths by hand.
- **Simplification:** goes only through `SimplificationProvider`. The default provider is `none`; output from `fake` is test data.
- **Abstractions:** don't add one until there is a second real use for it.

## Coding conventions

- TypeScript strict mode. No `any`.
- Validate with zod at every boundary: env, config, feed items and provider output.
- Use Server Components by default, and Server Actions for changes to data.
- Access the database only through Drizzle, with a transaction for any multi-row write.
- Name files in kebab-case, and keep modules small with a single responsibility.

### Clean code

Write code another developer can read and change easily:

- Use names that say what something is or does (`publishedAt`, not `d`).
- Keep functions small and doing one thing, at one level of detail, with few arguments.
- No hidden side effects: a function does only what its name says.
- Keep each piece of knowledge in one place; don't repeat logic.
- Use comments to explain *why*, not *what*.
- Use named constants, not magic numbers or strings.
- Handle errors clearly; never swallow them silently.
- Keep tests as readable as the code they test.
- Leave code a little cleaner than you found it, within the current chunk's scope.
- If a clean-code habit conflicts with "Abstractions" in Architecture principles, that rule wins.

## Testing rules

- Write the test first, and watch it fail before writing the code.
- Use Vitest, with a temporary SQLite database per test file (the helper from Chunk 4).
- Use fixtures and mocked fetch, or the local fixture feed server. Tests never touch the live network.
- Fixtures are synthetic. Never copy real article text into a fixture, test, log or commit.
- Set `TZ` for timezone tests in the Vitest config, never in the shell.
- Run Playwright against a seeded database.
- Before saying any work is done, run `yarn typecheck`, `yarn lint` and `yarn test`, and show their real output.

## Requirement labels

- `docs/REQUIREMENTS.md` labels every statement as Confirmed (brief), Assumption (A-NN), Proposed (AD-NN or P-NN) or Open decision (OD-NN).
- Never treat an Assumption or a Proposed item as confirmed. Only a decision-log row that passes the Decision status rule (in the chunk-workflow skill) counts, and each row affects only the ID it names: baseline approval (BL-01) confirms no assumption and resolves no decision.

## Simplification honesty

- The `none` and `fake` providers exist so that collection and tests can run without an external AI. They do not satisfy FR-SIM-01…08.
- Real article simplification is incomplete until David approves a provider (OD-01) and Chunk 32 verifies it.
- Never describe `fake` output as real simplification.

## Scheduling proof rule

- Unit tests prove date maths and the generated task definition only. They never count as proof that scheduling works.
- Chunks 29, 30 and 36 are complete only when real Windows checks have been recorded on David's PC, each with its date, the command run and its real output.

## Security and data handling

- Never store original article text, HTML or webpage copies. Hold article content in memory only; retries fetch it again.
- Logs, `last_error` and run records hold error codes and safe messages only, never article content or raw provider output.
- Keep telemetry off (Yarn and Next.js) and use local or system fonts. At run time, the app makes no outbound requests except to approved sources and an approved provider. Tooling downloads (packages, browsers) and source checks are governed by their own go-aheads.
- Never send `.env.local`, databases, backups, logs or anything in `data/` to any external service. External AI code review follows OD-15 (option (a), resolved 2026-11-06): only `/code-review` as described in "Pre-PR code review", and none of these files is ever sent to it.
- Render article text only as plain text. Never use `dangerouslySetInnerHTML`.
- Render links only for `http`/`https` URLs, with `rel="noopener noreferrer"`.
- Keep secrets only in `.env.local`. Never log them, commit them or store them in the database.
- Treat feed content as untrusted data in prompts. Accept provider output only after it passes schema validation.
- Every outbound request needs a timeout, a size cap and a DevPulse User-Agent, and must respect the source's terms.
- The dashboard binds to `127.0.0.1` only, in development and production.

## Stop and ask David before

Ask each time, and get explicit approval:

- changing the stack or adding a notable dependency;
- anything paid: services, APIs, hosting or subscriptions;
- choosing an AI provider, or sending article content outside the PC;
- adding, enabling or removing a news source;
- changing a product requirement;
- running a destructive migration;
- deleting data outside the retention rules;
- changing Windows settings, including the timezone;
- registering or modifying scheduled tasks;
- running tests that interrupt the PC or the network, such as sleep, shutdown or disconnecting the network;
- merging anything into `main`;
- updating the live checkout (`yarn live:update`);
- adding a git remote or pushing anywhere;
- sending project material to any external AI review other than the `/code-review` runs approved under OD-15, or dispatching implementer subagents or any other reviewer subagents;
- switching retention to active in the live checkout;
- starting a ⛔ chunk;
- marking a chunk complete while its "Decision before completion" or "Confirm before completion" is still pending;
- changing a chunk that is already complete (propose a follow-up task instead).

## Implementation workflow

1. Work on one chunk at a time.
2. Respect chunk dependencies and gates.
3. Write a spec in `docs/superpowers/specs/` before implementation.
4. Write a plan in `docs/superpowers/plans/` before coding.
5. Write tests before implementation.
6. Implement only the current chunk's approved scope.
7. Run the tests and type checks.
8. Review the changes.
9. Update the roadmap.
10. Update the documentation.
11. Stop and ask David when a product decision or an approval is needed.

### Pre-PR code review

**Status: active.** OD-15 was resolved on 2026-11-06 (option (a), decision log). Use only the built-in `/code-review` skill at effort level `high`, not `code-review:code-review`. No other AI review tool, no automatic AI reviews, and no reviewer subagents other than those `/code-review` runs itself.

- Before creating any PR or asking David to approve a merge into `main`, run the existing `/code-review` skill at effort level `high` against the target branch. David approved this on 2026-11-04.
- Fix all critical and high-severity findings, run relevant tests again, and repeat the review.
- Include unresolved medium and low findings, with reasons, in the PR description or the request for David's merge approval.
- Never create a PR or request merge approval while critical or high findings remain unresolved.
- If code review cannot run, stop and ask David. Never skip it.
- Don't use another AI review tool as a substitute, and don't use `ultra`, `max`, `--comment`, `--post` or `--fix`.
- Creating a PR does not authorize merging. David must approve merging into `main`.

## Documentation rules

- **Roadmap:** `docs/IMPLEMENTATION_ROADMAP.md` is the single source of truth for progress.
  - Update the task markers and the progress summary whenever a status changes.
  - Set a chunk's Status to `Complete.` only when it meets the Definition of done, including its `**Spec must resolve:**` items.
- **Decisions:** record David's decisions in the decision log in `docs/REQUIREMENTS.md`, with their Type and Source.
- **Carried review findings:** never drop one silently. Only a decision-log row of Type `Carried finding` can drop it.
- **Commits:** local only, on the chunk branch, after verification, as part of the approved plan. Never push.
- **Manual checks:** after each chunk, write an italic note saying what was and wasn't checked by hand.
- **README:** keep its status honest, and never claim a feature works before it is verified.
- **Markdown:** keep docs free of markdownlint warnings.
