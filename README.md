# DevPulse

DevPulse is a local-first developer news dashboard for a personal Windows PC. Every Monday morning it collects the previous week's developer news from RSS/Atom feeds and permitted public APIs. It then rewrites each article in simple English, so that junior developers can understand it.

> **Status: Chunks 1 (repository and toolchain) and 2 (quality tooling) complete — no DevPulse features yet.** See the [implementation roadmap](docs/IMPLEMENTATION_ROADMAP.md). Real article simplification needs an AI provider, and David has not chosen one yet. Until then, DevPulse will be able to collect articles but not simplify them. Real collection also waits until the two-month retention is implemented, verified and switched on.

## Main goals

- Collect developer news automatically every Monday at 08:00 Malaysia time (`Asia/Kuala_Lumpur`), without the website being open.
- Rewrite each article in simple English for junior developers.
- Browse, search, filter and track the articles in a local dashboard.
- Stay local-first, with no paid services unless David approves them.

## Technology stack

| Area | Technology |
| --- | --- |
| Dashboard | Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui |
| Collection | Node.js command-line script (`yarn news:sync`), RSS/Atom feeds and permitted public APIs |
| Data | SQLite with Drizzle ORM |
| Scheduling | Windows Task Scheduler |
| Testing | Vitest, Playwright |
| Package manager | Yarn |

## Planned features

None of these exist yet.

- **Collection:**
  - weekly automatic collection of the previous calendar week's articles;
  - manual collection from the terminal;
  - each source handled independently, so one failure doesn't stop the rest;
  - duplicate prevention.
- **Simplification:** for each article,
  - a 2–4 sentence summary;
  - why it matters to developers;
  - a technical explanation;
  - 3–5 key takeaways;
  - the relevant technologies and developer roles;
  - a difficulty level: Beginner, Intermediate or Advanced.

  This needs an AI provider approved by David. Articles that fail are recorded for retry.
- **Dashboard:**
  - latest articles;
  - search and filters;
  - categories and technologies;
  - difficulty levels;
  - article details with links to the originals;
  - a weekly archive;
  - bookmarks and read/unread status;
  - collection status, including the last run, the next scheduled run and failures.
- **Automation:** a Windows Task Scheduler task, `DevPulse-Weekly-News-Collection`. It:
  - runs `yarn news:sync` every Monday at 08:00 Malaysia time;
  - never runs twice at once;
  - catches up on missed or incomplete weeks where possible, and shows honestly when a week's coverage is incomplete;
  - records the results.
- **Data:** SQLite stores the simplified content and the article metadata only, never the original article text. Articles are kept for two months, then deleted automatically, and backups follow the same rule. No telemetry, and nothing leaves the PC except requests to approved sources and an approved AI provider.

## High-level architecture

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

Retention cleanup runs at step 8 in development. In the live checkout it
runs right after the lock, before any fetch.
```

DevPulse is two independent programs that share one SQLite file:

- **Collector.** Task Scheduler runs it every Monday; David can also run it by hand.
- **Dashboard.** It runs only on the local machine.

Neither program needs the other to be running. Development happens in one folder against a development database; real use and the scheduled runs happen in a separate live copy of the approved code, with the only real database. [ARCHITECTURE.md](docs/ARCHITECTURE.md) explains each component and the proposed design decisions.

## Prerequisites

This is what DevPulse will need once it is built:

- **A Windows 11 PC.**
- **Node.js and Yarn.** Chunk 1 pins an exact Node.js version and commits the Yarn release, so no separate Yarn install is needed.
- **An internet connection.**
- **For scheduled runs:** the PC must be powered on, awake and online on Mondays at 08:00 Malaysia time.

## Documentation

- [Requirements](docs/REQUIREMENTS.md): confirmed requirements, assumptions, open decisions and the decision log.
- [Architecture](docs/ARCHITECTURE.md): the proposed components, data model, decisions and risks.
- [Implementation roadmap](docs/IMPLEMENTATION_ROADMAP.md): 10 phases and 36 chunks, with progress tracking.
- [Claude Code instructions](CLAUDE.md): rules for future implementation sessions.
- [Plans](docs/superpowers/plans/): implementation plans. Chunk specs go in `docs/superpowers/specs/`.

## Development status

- The planning documents were written on 2026-11-03 and revised to r4 the same day. David approved them as the planning baseline (BL-01) on 2026-11-03.
- A git repository with one remote, `origin` (`https://github.com/David-Sang96/DevPulse.git`), holds the baseline and Chunk 1: a Next.js 16.4.4 scaffold, Node.js 24.13.0 and Yarn 4.12.0 pinned, telemetry off, and the dev server bound to 127.0.0.1. No DevPulse feature exists yet.
- Chunk 2 (quality tooling) is complete on the branch `chunk-02-quality-tooling`, which is not yet merged into `main`: Prettier, markdownlint, Vitest, Playwright, and the scripts `yarn check` and `yarn verify`. The automated checks and David's manual verification of 2026-11-06 passed. The Chunk 2 note in the [roadmap](docs/IMPLEMENTATION_ROADMAP.md) lists what was not checked and the known limitations.
- The roadmap has 10 phases and 36 chunks. 5 chunks are blocked until David makes a decision. The open decisions (OD-01…OD-19) and assumptions (A-01…A-06) are listed in [REQUIREMENTS.md](docs/REQUIREMENTS.md); none has been decided yet.

## Development commands

These commands work now, in the development folder. Run `yarn check`, and `yarn verify` (which adds the browser test), before calling work done.

| Command | What it does |
| --- | --- |
| `yarn dev`, `yarn start` | The Next.js dashboard, bound to `127.0.0.1` only. |
| `yarn build` | A production build. |
| `yarn typecheck` | `next typegen && tsc --noEmit`: generates the route types, then type-checks, so it also works on a clean checkout. |
| `yarn lint` | ESLint for the code. |
| `yarn lint:md` | markdownlint for every Markdown file (line length is not checked). |
| `yarn format`, `yarn format:check` | Prettier rewrites, or only checks, code and config. Markdown is excluded, because markdownlint governs it. |
| `yarn test` | Vitest in two projects: `unit` runs `src/**/*.test.ts` in UTC, and `tz-kuala-lumpur` runs `src/**/*.tz.test.ts` in `Asia/Kuala_Lumpur`. `TZ` is set in `vitest.config.mts`, never in the shell. |
| `yarn test:e2e` | A Playwright smoke test: it builds the production app, serves it on `127.0.0.1:3100`, and runs one Chromium project in the installed Google Chrome (`channel: "chrome"`), so no browser is downloaded on this PC. |
| `yarn check` | The Node version check, `typecheck`, `lint`, `lint:md` and `test`, in that order, stopping at the first failure. |
| `yarn verify` | `yarn check`, then `yarn test:e2e`. |

`yarn news:sync` does not exist yet; it arrives in Chunk 3. Everything above has been run only on David's Windows 11 PC (Node.js 24.13.0, Yarn 4.12.0, Google Chrome 156.0.8078.80). Passing automated checks is not proof of Windows Task Scheduler behaviour or of any future collection workflow.
