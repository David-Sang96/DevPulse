# DevPulse Requirements

**Status:** Planning — no application code yet. Revision r4, last updated 2026-11-03.

**Related documents:** [Architecture](ARCHITECTURE.md) · [Implementation roadmap](IMPLEMENTATION_ROADMAP.md) · [README](../README.md)

## How to read this document

Every statement in this document carries exactly one label.

| Label | Meaning |
| --- | --- |
| **Confirmed (brief)** | Stated in David's project brief of 2026-11-02. |
| **Assumption (A-NN)** | Inferred, not stated. David confirms it. The chunks that depend on it are listed. |
| **Proposed (AD-NN or P-NN)** | A technical decision or a target, not a requirement. AD items live in [ARCHITECTURE.md](ARCHITECTURE.md). A Proposed item may change in a chunk spec, unless the change touches cost, privacy, the stack or product behaviour. In that case it becomes an open decision. |
| **Open decision (OD-NN)** | David decides. Nothing that depends on it is treated as settled. |

An Assumption or a Proposed item becomes confirmed, and an open decision becomes resolved, only when the [decision log](#decision-log) has a row in which David explicitly confirms, approves, resolves or declines that exact ID. The full test is the Decision status rule in `.claude/skills/chunk-workflow/SKILL.md`. A recommendation, a Proposed entry, a Deferred entry or a tentative wording does not count.

## Purpose and scope

DevPulse is a local-first developer news dashboard for a personal Windows PC. Every week it collects developer-related technology news from RSS/Atom feeds and permitted public APIs. It then rewrites each article in simple English, so that junior developers can understand it. A local web dashboard lets David browse, search, filter, bookmark and track the articles. DevPulse is not a chatbot.

## Out of scope

| Item | Basis |
| --- | --- |
| A chatbot or conversational Q&A | Confirmed (brief) |
| Building or running a local AI model | Confirmed (brief) |
| Features unrelated to collecting, simplifying and browsing developer news | Confirmed (brief) |
| Paid services, subscriptions, hosting, databases or APIs without David's approval | Confirmed (brief) |
| Permanently storing original article text, HTML or webpage copies | Confirmed (brief) |
| Multiple users, accounts or login | Assumption A-03 |
| Grouping the same story from different outlets into one item | Assumption A-02 |

## Functional requirements — Confirmed (brief)

### Collection (FR-COL)

| ID | Requirement |
| --- | --- |
| FR-COL-01 | Automatically collect news every Monday at 08:00 Malaysia time (`Asia/Kuala_Lumpur`). |
| FR-COL-02 | Collect the articles published during the previous calendar week (see A-01). |
| FR-COL-03 | Collection runs independently of the website and the Next.js server. |
| FR-COL-04 | Support manual collection. |
| FR-COL-05 | Use RSS/Atom feeds and permitted public APIs. |
| FR-COL-06 | Handle source failures independently: one failing source does not stop the others. |
| FR-COL-07 | Prevent duplicate articles (see A-02). |

### Simplification (FR-SIM)

Every successfully processed article contains the following:

| ID | Requirement |
| --- | --- |
| FR-SIM-01 | Original title. |
| FR-SIM-02 | A simple summary of 2–4 sentences. |
| FR-SIM-03 | Why it matters to developers. |
| FR-SIM-04 | A technical explanation. |
| FR-SIM-05 | Key takeaways, as 3–5 bullets. |
| FR-SIM-06 | The relevant technologies and developer roles. |
| FR-SIM-07 | A difficulty level: `Beginner`, `Intermediate` or `Advanced`. |
| FR-SIM-08 | The original URL and source. |
| FR-SIM-09 | Collection continues even when simplification fails. |
| FR-SIM-10 | Articles whose simplification failed are recorded for retry. |
| FR-SIM-11 | No external AI provider is assumed to be free. Choosing a provider, and sending article content to it, both need David's approval. |

> **Status of FR-SIM-01…08.** An article counts as successfully processed only when it has all eight items. Collection supplies FR-SIM-01 and FR-SIM-08. FR-SIM-02…07 need an approved, verified provider (roadmap Chunks 31–32). The `none` and `fake` providers let collection and testing go ahead without an external AI, but they do **not** satisfy these requirements. Real article simplification stays incomplete until OD-01 is approved and Chunk 32 is verified.

### Data and retention (FR-DATA)

| ID | Requirement |
| --- | --- |
| FR-DATA-01 | Use SQLite with Drizzle ORM. |
| FR-DATA-02 | Store the simplified content and the original article's metadata. |
| FR-DATA-03 | Never permanently store original article text, HTML or webpage copies. |
| FR-DATA-04 | Keep only two months of articles (the exact definition is OD-04). |
| FR-DATA-05 | Automatically and safely delete expired records and their related data. |
| FR-DATA-06 | Prevent duplicate records at the database level. |
| FR-DATA-07 | Write to the database safely, using transactions where appropriate. |

### Dashboard (FR-DASH)

| ID | Requirement |
| --- | --- |
| FR-DASH-01 | Latest articles. |
| FR-DASH-02 | Search and filters. |
| FR-DASH-03 | Categories and technologies. |
| FR-DASH-04 | Difficulty levels. |
| FR-DASH-05 | Article details. |
| FR-DASH-06 | Links to the original articles. |
| FR-DASH-07 | Weekly archive. |
| FR-DASH-08 | Bookmarks. |
| FR-DASH-09 | Read/unread status. |
| FR-DASH-10 | Collection status. |
| FR-DASH-11 | Last collection run. |
| FR-DASH-12 | Next scheduled run. |
| FR-DASH-13 | Collection failures. |

### Background automation (FR-AUTO)

| ID | Requirement |
| --- | --- |
| FR-AUTO-01 | Use Windows Task Scheduler. |
| FR-AUTO-02 | The task is named `DevPulse-Weekly-News-Collection`. |
| FR-AUTO-03 | The task runs every Monday at 08:00 Malaysia time. |
| FR-AUTO-04 | The task runs the command `yarn news:sync`. |
| FR-AUTO-05 | The task runs without the website being open. |
| FR-AUTO-06 | Prevent overlapping jobs. |
| FR-AUTO-07 | Recover missed runs where possible. |
| FR-AUTO-08 | Record collection results. |
| FR-AUTO-09 | Handle failures safely. |

## Technical requirements — Confirmed (brief)

| ID | Requirement |
| --- | --- |
| TR-01 | Next.js App Router. |
| TR-02 | TypeScript. |
| TR-03 | Tailwind CSS v4. |
| TR-04 | shadcn/ui. |
| TR-05 | SQLite. |
| TR-06 | Drizzle ORM. |
| TR-07 | A Node.js collection script that runs independently of Next.js. |
| TR-08 | RSS/Atom and permitted public APIs are the only source types. |
| TR-09 | Windows Task Scheduler. |
| TR-10 | Vitest. |
| TR-11 | Playwright. |
| TR-12 | Yarn is the package manager. This is implied by the required command `yarn news:sync`. |
| TR-13 | TypeScript checks pass before a chunk is marked complete. |
| TR-14 | Changing the stack needs a clear technical reason and David's approval. |

## Non-functional requirements — Confirmed (brief)

| ID | Requirement |
| --- | --- |
| NFR-01 | Local-first. |
| NFR-02 | No paid services, subscriptions, hosting, databases or APIs without David's approval. |
| NFR-03 | No external AI provider without David's approval. |
| NFR-04 | No unnecessary architecture or abstractions. |
| NFR-05 | Not a chatbot, and no local AI model is built. |
| NFR-06 | No unrelated features. |
| NFR-07 | Product requirements are never changed silently. |
| NFR-08 | A personal Windows application. |
| NFR-09 | Scheduled runs need the PC to be powered on, awake and connected to the internet. |

## Assumptions — need David's confirmation

None of these is stated in the brief. Approving the planning documents approves only the planning baseline, and lets Chunk 1 start. It does **not** confirm any assumption. Each assumption stays an assumption, with Status `Pending`, until David explicitly confirms it and that confirmation is recorded in the decision log under the Decision status rule in `.claude/skills/chunk-workflow/SKILL.md`. Each assumption is a **"Confirm before completion"** gate for the chunks it affects: those chunks may start, but cannot be marked complete until the assumption is confirmed.

| ID | Assumption | Basis | Affects chunks | Status |
| --- | --- | --- | --- | --- |
| A-01 | "Previous calendar week" means Monday 00:00 to Sunday 23:59:59 Malaysia time. | The brief's "previous calendar week" together with its Malaysia-time schedule. | 7, 9, 23, 30 | Pending |
| A-02 | A duplicate is the same canonical URL or the same source item. The same story covered by different outlets is kept as separate articles, and stories are not grouped. | The brief's "prevent duplicate articles". | 10 | Pending |
| A-03 | Single user, with no login. Bookmarks and read state belong to that one user. | The brief's "personal Windows application". | 5, 22 | Pending |
| A-04 | The dashboard is started when needed, on localhost only. It is not a background service. | Local-first, and collection runs independently of the website. | 17 | Pending |
| A-05 | Sources are written in English. Nothing filters articles by language; the approved source list (OD-03) settles it. | Not in the brief. Inferred from the "simple English" output. | 6 | Pending |
| A-06 | The volume is tens to low hundreds of articles a week. | A curated source list. | 16, 34 | Pending |

## Proposed — not requirements

These are targets or technical decisions. They are often mistaken for requirements, so they are listed here. A chunk spec may change them, unless the change touches cost, privacy, the stack or product behaviour.

| Item | Proposal | Where defined | Checked in |
| --- | --- | --- | --- |
| P-01 performance target | Dashboard pages respond in under 1 second locally with up to 5,000 articles. | This document | Chunk 34 |
| Database driver | `better-sqlite3`, with alternatives recorded. | AD-02 | Chunk 4 |
| Retry limit | 3 attempts, retried on later runs. Revisit if a paid provider is approved. | AD-19 | Chunks 15, 32 |
| Missed-run catch-up limit | 4 weeks of automatic recovery by the existing weekly runs; later weeks stay manually retryable. A Proposed technical policy that limits automatic recovery (FR-AUTO-07); David may override it. | AD-21 | Chunk 30 |
| Run-record retention | Run records use the article cutoff. | AD-31 | Chunk 27 |
| Dashboard binding | 127.0.0.1 only, in development and production. | AD-08, AD-28 | Chunks 1, 17 |
| Node.js and Yarn versions | An exact Node.js version, checked at run time; Yarn 4 committed as a release file, with `nodeLinker: node-modules`. | AD-18 | Chunk 1 |
| Tests and network | Tests never use the live network. | AD-13 | Every chunk |
| P-02 privacy target | Derived from NFR-01: no telemetry from tools or frameworks, no font or other outbound requests except to approved sources and an approved provider, and no original article content in fixtures, logs, errors or anything sent off the PC. | AD-28, AD-29 | Chunks 1, 14, 17, 34 |
| Live checkout | Scheduled runs and real use run from a separate live checkout of an approved `main` commit, with the only real database. | AD-23, AD-30 | Chunks 4, 29 |
| Retries and offline handling | In-run retries with backoff; a bounded wait for connectivity (up to 2 hours); 3 attempts across runs. | AD-19, AD-25, AD-26 | Chunks 14, 15, 30 |
| Deployment backups | At most 5, each deleted once its oldest retained record would expire. | AD-30 | Chunks 27, 29 |

**Live collection guard (AD-32) — David's r4 requirement, not a proposal.** In the live checkout, nothing is collected until retention is active (`retention_inactive`). David required this in the r4 instruction of 2026-11-03, to preserve FR-DATA-04. It is not an ordinary Proposed decision: no chunk spec and no ordinary `Technical` decision-log row can change it; only David's explicit decision can. Defined in ARCHITECTURE AD-32; checked in Chunks 27 and 29.

## Open product decisions

The gate types are explained in the [roadmap legend](IMPLEMENTATION_ROADMAP.md#legend). In short:

- ⛔ means the chunk must not start until the decision is resolved in the decision log.
- "Before completion" means the chunk may start, but cannot be marked complete until the decision is resolved in the decision log.
- "Resolved" follows the Decision status rule in `.claude/skills/chunk-workflow/SKILL.md`. A Pending, Proposed or Deferred status does not count, and neither does a recommendation. Approving the planning documents does not resolve any decision.
- The Status columns in this document and in the assumptions table are informational only. The [decision log](#decision-log) is the only authoritative record.
- "Prepared in" names the chunk that gathers what David needs to decide.

| ID | Decision | Recommendation | Gate | Status |
| --- | --- | --- | --- | --- |
| OD-01 | AI provider, model, monthly budget cap, and permission to send article content to it | Decide from the Chunk 16 comparison. No provider is assumed to be free. | ⛔ 31, 32 (prepared in 16) | Pending |
| OD-02 | Which article content is used for simplification and retries | Option (a): feed content held in memory, fetched again on retry | ⛔ 31 (prepared in 16) | Pending |
| OD-03 | RSS/Atom sources and any public APIs | Approve a short list from the Chunk 6 candidates | ⛔ 12; before completion of 30 (needed before tasks 30.3–30.5) and 36 (needed before task 36.2); also needed before the first real-source run | Pending |
| OD-04 | What "two months" means | 2 calendar months from the published date, in Malaysia time | ⛔ 27; needed before live collection starts (AD-32) | Pending |
| OD-05 | Whether bookmarked articles are deleted at expiry | Delete them (strict reading) | ⛔ 27; needed before live collection starts (AD-32) | Pending |
| OD-06 | Whether articles not yet simplified appear on the dashboard | Show them, with an "Awaiting simplification" badge | Before completion of 18 | Pending |
| OD-07 | Dashboard "Run collection now" button (optional) | The CLI meets FR-COL-04; add the button only if David wants it | ⛔ 28 | Pending |
| OD-08 | Category list, developer-role list, and who assigns an article's category | The fixed lists below; the AI picks a category, falling back to the source's default | Before completion of 13 and 21 | Pending |
| OD-09 | Whether to add an extra trigger for missed runs: a logon trigger and/or a daily "run only if a week is due" trigger | Start with StartWhenAvailable only; add a trigger only if the real checks show a gap | Before completion of 30 | Pending |
| OD-10 | Scheduled task run mode, password storage, and whether to wake the PC | Avoid storing a password; decide after task 29.3 has tested each mode on David's PC | Before completion of 29 (needed before task 29.4) | Pending |
| OD-11 | Whether late or back-dated articles are accepted into weeks already collected and not yet expired | Accept them (de-duplication makes it safe) | Before completion of 9 and 30 | Pending |
| OD-12 | Whether to collect more often than weekly while still presenting weekly | Keep weekly for now; decide using the feed-depth and coverage data | Before completion of 29 (needed before task 29.4) | Pending |
| OD-13 | Whether the scheduled task may run a PowerShell wrapper that runs `yarn news:sync` | Allow it; the command itself is unchanged | Before completion of 29 (needed before task 29.4) | Pending |
| OD-14 | Whether opening an article marks it as read | Manual toggle only, unless David prefers marking on an explicit action | Before completion of 22 | Pending |
| OD-15 | Whether any external AI code review may receive project material, and which | No recommendation; David decides with the privacy details below | Governs the review step of every chunk | Resolved: option (a), see the decision log |
| OD-16 | Whether to show an "expires soon" hint on bookmarked articles near the cutoff | Show it, if OD-05 deletes bookmarks | Only the conditional hint in task 27.5; never blocks Chunk 27, retention or collection | Pending |
| OD-17 | How real-source checks run before retention exists | (b) A temporary database deleted after the check, and the database for 32.3 named explicitly | Before the real-source manual check in Chunk 11 and before task 32.3 | Pending |
| OD-18 | What "retention cleanup must succeed" covers before a live run collects | No recommendation | Before completion of 27 and 29 | Pending |
| OD-19 | Where catch-up starts on the first run after retention becomes active | No recommendation | Before completion of 30 | Pending |

### OD-01 — AI simplification provider

- **Question:** Which provider and model should simplify articles? What is the monthly budget cap? May article content be sent to that provider?
- **Options:**
  - a paid API;
  - a provider's free tier, after checking its limits and whether it keeps submitted content or uses it for training;
  - an existing model running locally on the PC, if David considers this compatible with "no local AI model";
  - no provider for now, in which case articles stay pending.
- **Recommendation:** Decide from the comparison prepared in Chunk 16. No provider is assumed to be free.
- **Consequence of waiting:** articles collected before a provider is approved stay pending. With option (a) of OD-02, their content has to be fetched again from the feed, which usually no longer has them after a week or two. Most of that backlog is therefore likely never to be simplified. Chunk 16 can be done early, any time after Chunk 6, to shorten this period.
- **Gate:** ⛔ Chunks 31 and 32. Prepared in Chunk 16.

### OD-02 — Article content used for simplification and retries

- **Options:**
  - **(a)** Use the content the feed provides, held in memory only. On retry, fetch the feed again.
  - **(b)** Also fetch the original web page during processing, without storing it.
  - **(c)** Keep a feed excerpt temporarily until the article is simplified, then purge it. This option needs explicit approval because of FR-DATA-03.
- **Recommendation:** Option (a), because it complies fully with FR-DATA-03.
- **Consequences:**
  - (a) Many feeds carry only a short excerpt, which may be too thin for a good "technical explanation" (FR-SIM-04), and retries after a week usually find the item gone (`content_unavailable`).
  - (b) Better input and retries, at the cost of fetching full pages from each source, subject to its terms.
  - (c) Reliable retries, but it stores original text for a while, which needs an explicit exception to FR-DATA-03.
  - Chunk 15 implements (a) only. If David chooses (b) or (c), the extra work is added as a follow-up task in Chunk 31; Chunk 15 is not silently reopened.
- **Gate:** ⛔ Chunk 31. Prepared in Chunk 16, together with each candidate source's typical content length.

### OD-03 — News sources

- **Question:** Which RSS/Atom feeds, and which public APIs if any? Each one needs a check of its terms of use or permission.
- **Recommendation:** Approve a short curated list from the candidates prepared in Chunk 6 (task 6.3). The candidates stay disabled until approved. This decision also settles A-05.
- **Gate:**
  - ⛔ Chunk 12, the API connector.
  - Before completion of Chunk 30 (needed before tasks 30.3–30.5) and Chunk 36 (needed before task 36.2).
  - Also needed before the first collection run against real sources. That is the manual check in Chunk 11, which also needs OD-17; if OD-03 is still open then, the real-source run moves to task 36.2, which is gated on it.
  - Until OD-03 is resolved, every source stays disabled and runs end as `no_sources`, which never marks a week complete.
  - After OD-03, enabling the approved sources is a small commit, deployed to the live checkout with `yarn live:update` after David's go-ahead.

### OD-04 — Meaning of "two months"

- **Options:**
  - **Length:** 2 calendar months, or 60 days.
  - **Measured from:** the published date, or the date the article was collected.
- **Recommendation:** 2 calendar months from the published date, worked out in Malaysia time.
- **Gate:** ⛔ Chunk 27, because deletion cannot be undone. It is also a condition for live collection: nothing is collected in the live checkout until retention is active (AD-32).

### OD-05 — Bookmarked articles at expiry

- **Options:**
  - Delete them with everything else, which is the strict reading of "retain only two months".
  - Keep bookmarked articles beyond the cutoff.
- **Recommendation:** Delete them (the strict reading).
- **Gate:** ⛔ Chunk 27. Because cleanup can't run without knowing whether to delete bookmarked articles, this is a retention rule and also a condition for live collection (AD-32).
- **Split in r4:** the optional "expires soon" hint, previously part of this recommendation, is now its own decision, OD-16. It never blocks Chunk 27, retention or collection.

### OD-06 — Articles not yet simplified

- **Options:**
  - Show them with an "Awaiting simplification" badge and a link to the original.
  - Hide them until they are simplified.
- **Recommendation:** Show them. Otherwise the dashboard stays empty until a provider is approved.
- **Gate:** before completion of Chunk 18. In code, the choice is one query clause and one card variant.
- **Interim behaviour (Proposed, development only):** while OD-06 is unresolved, Chunk 18 shows pending articles with a badge. "Development only" means this is never merged into `main` or deployed while OD-06 is unresolved, and Chunk 18 can't be marked complete until it is resolved.

### OD-07 — Dashboard "Run collection now" button

- **Options:**
  - Command line only. `yarn news:sync` already meets FR-COL-04.
  - Also add the optional button from Chunk 28, which lets the dashboard start the collector as a separate process.
- **Recommendation:** The command line is enough. Add the button only if David wants it.
- **Gate:** ⛔ Chunk 28. The chunk is skipped if David declines.

### OD-08 — Categories and developer roles

- **Proposed categories:** Web & Frontend, Backend & APIs, Mobile, DevOps & Cloud, Data & AI, Security, Languages & Tools, Industry & Careers.
- **Proposed roles:** Frontend, Backend, Full-stack, Mobile, DevOps / SRE, Data / ML, Security, All developers.
- **Who assigns the category:**
  - the source's default category only; or
  - the AI picks from the list, falling back to the source's default.
- **Recommendation:** Use the lists above, with the AI picking the category and the source's default as the fallback.
- **Gate:** before completion of Chunks 13 and 21. Both lists live in one module and are not database constraints (AD-22).

### OD-09 — Extra triggers for missed runs

- **Options:**
  - **(a)** Rely on Task Scheduler's StartWhenAvailable setting and the collector's connectivity wait. This is the baseline.
  - **(b)** Also add a logon trigger that runs `news:sync` only when a week is due.
  - **(c)** Also add a daily trigger that does nothing unless a week is due. This touches FR-AUTO-03 (Monday 08:00), so it needs David's approval.
- **Consequences:** (a) a missed Monday whose catch-up also fails waits until the next Monday; (b) and (c) recover sooner, but mean runs at times other than Monday 08:00.
- **Recommendation:** Start with the baseline. Add (b) or (c) only if the real Windows checks in Chunk 30 show that missed runs are not recovered.
- **Gate:** before completion of Chunk 30. No extra trigger is added without a resolved decision.

### OD-10 — Scheduled task run mode

- **Options:**
  - **"Run only when user is logged on".** No password is stored, but the task cannot run while David is logged off.
  - **"Run whether user is logged on or not".** This may mean storing the Windows password in Task Scheduler. The alternative is a no-password mode whose internet access must be verified first.
  - **"Wake the computer to run this task"**, either on or off.
- **Recommendation:** Avoid storing a password. Decide once task 29.3 has tested each mode with a temporary test task on David's PC.
- **Gate:** before completion of Chunk 29, and specifically before task 29.4 registers the real task.

### OD-11 — Late or back-dated articles

- **Question:** An item can appear in a feed after its week was already collected and marked complete — for example, dated Sunday but published to the feed on Monday afternoon. Should later runs still accept such items into that week, as long as the week is within retention?
- **Options:**
  - **(a)** No. Only weeks that are still due (incomplete) are collected again. Late items for complete weeks are missed.
  - **(b)** Yes. Each run also looks for new in-window items for weeks already complete and not expired, and stores them in their week.
- **Consequences:** (a) is simpler but misses some articles. (b) is more complete, costs a little extra work per run, and means "the previous calendar week" (FR-COL-02, A-01) is read as "any recent week still within retention" for late items.
- **Recommendation:** (b), because de-duplication makes it safe.
- **Gate:** before completion of Chunks 9 and 30.
- **Interim behaviour:** while OD-11 is unresolved, no code for late items is written. That is today's behaviour, **not** a choice of option (a). Chunks 9 and 30 can't be marked complete until OD-11 is resolved.

### OD-12 — Collection frequency

- **Question:** Busy feeds keep only their most recent items, so a weekly run can miss part of a week. Should DevPulse fetch more often (for example daily) while still presenting the news weekly?
- **Options:**
  - **(a)** Weekly only, as the brief states.
  - **(b)** More frequent fetching. This changes how FR-COL-01 and FR-AUTO-03 are read, adds scheduled runs, and needs the PC to be on and awake more often.
- **Consequences:** (a) leaves some sources `possibly_incomplete`, which the status page shows. (b) improves completeness at the cost of more runs and a further schedule.
- **Recommendation:** Keep weekly for now. Decide using the feed-depth data from task 6.3 and the coverage reports of the first weeks.
- **Gate:** before completion of Chunk 29 (needed before task 29.4).

### OD-13 — PowerShell wrapper in front of `yarn news:sync`

- **Question:** May the scheduled task run a PowerShell wrapper that then runs `yarn news:sync`, rather than running `yarn news:sync` directly?
- **Options:**
  - **(a)** Use the wrapper. It sets the working directory, uses an absolute Node.js path and checks its version, applies the live-checkout guards, writes the log and passes the exit code through.
  - **(b)** Run the command directly. The guards and the logging would then have to move into the collector, and PATH and working-directory problems are more likely under Task Scheduler.
- **Recommendation:** (a). The command that does the work is still `yarn news:sync`.
- **Gate:** before completion of Chunk 29 (needed before task 29.4).

### OD-14 — Does opening an article mark it as read?

- **Options:**
  - **(a)** No. Read state changes only through an explicit toggle.
  - **(b)** Yes, after the details page has loaded, through an explicit client action (never as a side effect of rendering or link prefetching).
- **Consequences:** (a) is predictable but needs a click. (b) is convenient but marks articles read that were only glanced at.
- **Recommendation:** (a) as the baseline; (b) if David prefers convenience.
- **Gate:** before completion of Chunk 22. Until it is resolved, Chunk 22 builds the manual toggle only.

### OD-15 — External AI code review

- **Question:** May an external AI review (for example the `/code-review` command or a review subagent) receive material from this project, and if so, which?
- **What would leave the PC:** the diff; the source files the reviewer reads; tests and fixtures (synthetic, but they still reveal code and test design); configuration; project docs; and the review instructions. It goes to the AI provider behind the review tool and is subject to that provider's retention and usage terms.
- **Never to be sent, whatever the choice:** `.env.local`, databases, backups, logs and anything in `data/`, and real article content.
- **Already happening:** the coding assistant used for development already sends the files it reads to its provider. OD-15 does not change that, and David may want to decide whether that is acceptable too.
- **Options:**
  - **(a)** Allow AI review of diffs, code and synthetic fixtures.
  - **(b)** Allow code diffs only; exclude fixtures, docs and configuration.
  - **(c)** No separate AI review. The chunk workflow uses a structured self-review checklist, labelled as not independent.
- **Recommendation:** none. David decides.
- **Gate:** governs the review step of every chunk. Until it is resolved, the chunk workflow uses option (c), and no implementer or reviewer subagents are dispatched.
- **Status:** resolved on 2026-11-06 with option (a); see the decision log.

### OD-16 — "Expires soon" hint

- **Question:** Should bookmarked articles that are close to the retention cutoff show an "expires soon" hint?
- **Options:** (a) show the hint; (b) no hint.
- **Recommendation:** (a), if OD-05 deletes bookmarked articles.
- **Gate:** only the conditional hint in task 27.5. It never blocks Chunk 27's start or completion, retention activation, or live collection. If it is approved after Chunk 27 is complete, the hint is added as a follow-up task.

### OD-17 — Real-source checks before retention exists

- **Question:** Chunk 11's real-source manual check, and task 32.3 if run in development, would store real articles in a database that has no retention yet. How should these checks run?
- **Options:**
  - **(a)** Before Chunk 27, real-source checks use `--dry-run` only.
  - **(b)** They use a temporary database that is deleted after the check.
  - **(c)** The `retention_inactive` guard applies to any database that would hold real-source articles.
- **Consequences:** (a) can't show stored results; (b) keeps real data only for the length of the check; (c) blocks those checks until Chunk 27 is done.
- **Recommendation:** (b) for Chunk 11, plus naming the database for 32.3 explicitly.
- **Gate:** before the real-source manual check in Chunk 11, and before task 32.3. Until it is resolved, both are marked "needs OD-17".

### OD-18 — What "retention cleanup must succeed" covers

- **Question:** Before a live run collects, retention cleanup must succeed (AD-32). Which parts count?
- **Options:**
  - **(a)** Only the database check: no expired rows remain.
  - **(b)** Database rows, log files and backups.
- **Consequences:** (b) is stricter about FR-DATA-04, but a locked backup file then stops weekly collection until it is fixed, which needs the recovery path required for the Chunk 29 spec (N-13).
- **Recommendation:** none. It changes how strict FR-DATA-04 is in practice.
- **Gate:** before completion of Chunks 27 and 29.

### OD-19 — Where catch-up starts

- **Question:** While retention is inactive, weekly runs collect nothing, so every week stays due. Where should automatic catch-up start on the first run after retention becomes active?
- **Options:**
  - **(a)** Backfill up to 4 weeks (AD-21) on the first active run.
  - **(b)** Start from the first week after retention becomes active, or the first week with enabled sources.
- **Consequences:** (a) collects more at once, limited by what the feeds still hold; (b) avoids backfilling weeks that were never missed.
- **Recommendation:** none.
- **Gate:** before completion of Chunk 30.

## Decision log

This table is the only authoritative record of David's decisions. Each row has a **Type**:

| Type | IDs | Effect |
| --- | --- | --- |
| Baseline | BL-NN | Approves the planning baseline. It only lifts Chunk 1's start gate. It confirms no assumption and resolves no decision. |
| Product decision | OD-NN | Resolves an open decision: approved, declined or deferred. |
| Assumption | A-NN | Confirms or rejects an assumption. |
| Technical | AD-NN, P-NN | Approves or overrides a Proposed item. It never changes AD-32, which is David's r4 requirement. |
| Carried finding | N-NN, F-NN, L-x | Drops a review finding that the roadmap carries as "Spec must resolve". This is the only way to drop one. |

The **Source** column says where David gave the decision: a date plus a quote or a message reference. A row counts only under the Decision status rule in `.claude/skills/chunk-workflow/SKILL.md`.

| Date | Type | ID | Decision | Choice | Decided by | Source | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-11-03 | Baseline | BL-01 | Planning baseline approval (revision r4, with the RV-01…RV-05 and final baseline review corrections) | Planning baseline approved | David | Message in the Claude Code session of 2026-11-03: "David has explicitly approved BL-01." | Covers the six baseline files whose hashes are recorded in `docs/BASELINE.md`. Lifts only Chunk 1's start gate. Confirms no assumption, approves no Proposed item and resolves no open decision. |
| 2026-11-03 | Technical | AD-33 | Yarn release version (Chunk 1 spec, Q1) | Approved: Yarn 4.12.0 | David | Message in the Claude Code session of 2026-11-03, "DevPulse — Final Chunk 1 Spec and Plan Corrections": "Q1: David approved Yarn 4.12.0." | Affects only AD-33. |
| 2026-11-03 | Technical | AD-34 | Next.js scaffold version (Chunk 1 spec, Q2) | Approved: the latest stable `create-next-app` version, looked up at execution time from registry metadata only (G-1a), and downloaded and run only after a separate approval (G-1b) | David | Message in the Claude Code session of 2026-11-03, "DevPulse — Final Chunk 1 Spec and Plan Corrections": "Q2: David approved using the latest stable create-next-app version, looked up at execution time, subject to separate approval before downloading and running it." | Affects only AD-34. The exact version is recorded in Chunk 1's verification note. |
| 2026-11-03 | Technical | AD-35 | Per-project Next.js telemetry switch (Chunk 1 spec, Q3) | Approved: commit `.env.yarn` containing only `NEXT_TELEMETRY_DISABLED=1`; it covers `yarn dev`, `yarn build`, `yarn start` and `yarn next …`; direct invocations outside Yarn are not covered and are not supported | David | Message in the Claude Code session of 2026-11-03, "DevPulse — Final Chunk 1 Spec and Plan Corrections": "Q3: David approved committing `.env.yarn` containing only `NEXT_TELEMETRY_DISABLED=1`, subject to the invocation boundary below." | Affects only AD-35. If task 1.4's check fails, the evidence goes to David; no other method is used. |
| 2026-11-04 | Technical | AD-36 | Format scripts (Chunk 2 spec, D-1) | Approved: `format` = `prettier --write .` and `format:check` = `prettier --check .`; the 2.1 acceptance check is `yarn format:check` | David | Claude Code session of 2026-11-04, plan-mode question "Format cmd": David chose "format + format:check (Recommended)" | Affects only AD-36. Recording approved by David on 2026-11-04: "Q3: Approved. Record D-1 through D-5 as AD-36 through AD-40." |
| 2026-11-04 | Technical | AD-37 | E2E smoke-test title (Chunk 2 spec, D-2) | Approved: check the exact current title `Create Next App`, with no app change in Chunk 2 | David | Claude Code session of 2026-11-04, plan-mode question "E2E title": David chose "Assert current title (Recommended)" | Affects only AD-37. Recording approved as for AD-36. |
| 2026-11-04 | Technical | AD-38 | Existing markdownlint violations (Chunk 2 spec, D-3) | Approved: MD013 off; formatting-only fixes without wording changes, in their own commit; ask before any wording change or other disabled rule | David | Claude Code session of 2026-11-04, plan-mode question "MD lint": David chose "Fix mechanically, else ask (Recommended)" | Affects only AD-38. Recording approved as for AD-36. |
| 2026-11-04 | Technical | AD-39 | `typecheck` script (Chunk 2 spec, D-4) | Approved: `next typegen && tsc --noEmit` | David | Claude Code session of 2026-11-04, Step 4 self-review question "Typecheck": David chose "next typegen && tsc (Recommended)" | Affects only AD-39. Recording approved as for AD-36. |
| 2026-11-04 | Technical | AD-40 | Existing code failing `yarn format:check` (Chunk 2 spec, D-5) | Approved: one formatting-only commit, which may touch Chunk 1 files, with no behaviour change, recorded in the change log | David | Claude Code session of 2026-11-04, Step 4 self-review question "Format Ch1": David chose "Format in own commit (Recommended)" | Affects only AD-40. Recording approved as for AD-36. |
| 2026-11-04 | Technical | AD-41 | Chunk 2 devDependencies and exact versions (Chunk 2 spec, D-6) | Approved: `prettier@3.9.10`, `markdownlint-cli2@0.24.0`, `vitest@5.1.0`, `@playwright/test@1.64.1` and `vite@8.3.5`, each pinned exactly, installed in one step | David | Claude Code session of 2026-11-04: "Q1: Approved. Use prettier, markdownlint-cli2, vitest and @playwright/test." and "Q2: Approved. Use the latest stable versions available at execution time and pin them exactly."; after the G-2a registry lookup: "David approves adding `vite@8.3.5` as the fifth devDependency." | Affects only AD-41. Versions come from G-2a (2026-11-04). `vite` is added because Vitest 5 declares it as a non-optional peer dependency. Installing remains the separate go-ahead G-2b. AD-17 stays Proposed. |
| 2026-11-04 | Technical | AD-42 | E2E browser (Chunk 2 spec, D-7) | Approved: Playwright E2E tests run in the installed Google Chrome (`channel: "chrome"`); no browser download is planned in Chunk 2 | David | Claude Code session of 2026-11-04, question "E2E browser": David chose "Installed Chrome (Recommended)" | Affects only AD-42. Chrome was 156.0.8078.80 when checked on 2026-11-04. The cached Chromium revisions are 1223 and 1228, and the exact revision required by Playwright 1.64.1 has not yet been verified. Nothing is installed or downloaded by this decision. |
| 2026-11-06 | Technical | AD-43 | markdownlint handling of the last 20 violations in the planning-r2 plan (Chunk 2 spec, D-3 follow-up; a detail of AD-38) | Approved: the 18 bold-only lines used as headings become plain text (MD036), and MD038 is disabled for two lines only, with a `markdownlint-disable-next-line MD038` comment above each code span that intentionally ends with a space; no other rule is disabled and no file is excluded | David | Claude Code session of 2026-11-06, Step 5 questions "MD036 x18" and "MD038 x2": David chose "Remove the bold (Recommended)" and "Inline-disable MD038 (Recommended)"; then: "Recording the two markdownlint decisions as AD-43, a detail of AD-38." | Affects only AD-43. A detail of AD-38, which it does not change (MD013 stays off and other fixes stay formatting-only). Applies only to `docs/superpowers/plans/2026-11-03-devpulse-planning-docs.md`. |
| 2026-11-06 | Product decision | OD-15 | External AI code review: whether any external AI review may receive project material, and which | Approved: option (a). Only the built-in `/code-review` skill, at effort level `high`, may receive project material: the diff, the source files it reads, synthetic tests and fixtures, configuration, project docs and the review instructions. It runs before every PR and before every request for David's approval of a merge into `main`. No other AI review tool, no automatic AI review, and no `ultra`, `max`, `--comment`, `--post` or `--fix` | David | Claude Code session of 2026-11-06, plan-mode questions "OD-15 scope": David chose "Option (a) (Recommended)", and "Review level": David chose "high (Recommended)"; then David approved the resolution plan: "Approved. Proceed with the plan". Builds on David's approval of 2026-11-04 to run `/code-review` before every PR or merge-approval request (`CLAUDE.md`, "Pre-PR code review") | Affects only OD-15. Never sent, whatever the choice: `.env.local`, databases, backups, logs, anything in `data/`, and real article content. Only the agents that `/code-review` runs itself are allowed; implementer subagents are still not dispatched. The material goes to the provider behind Claude Code (Anthropic), the development assistant's provider. CodeRabbit and the `security-guidance` plugin's automatic review stay disabled for DevPulse. `CLAUDE.md`'s severity and remediation rules are unchanged, and merging into `main` still needs David's explicit approval. |

### Baseline approval procedure (BL-01)

The planning baseline is the six files `CLAUDE.md`, `README.md`, `docs/REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_ROADMAP.md` and `.claude/skills/chunk-workflow/SKILL.md`. It is approved only by David's explicit approval message. When that arrives:

1. Add a BL-01 row (Type `Baseline`, Choice "Planning baseline approved", Decided by David, Source quoting the approval).
2. Convert line endings to LF, byte-exactly, with Git Bash `sed -i 's/\r$//'`, never with a PowerShell write command. Check for each file that the new size equals the old size minus its carriage-return count, that no byte-order mark was added, and that 0 carriage returns remain.
3. Compute the SHA-256 hash, size and timestamp of each of the six files (read-only, for example with Git Bash `sha256sum`).
4. Write them to `docs/BASELINE.md`, a record file outside the six, so the record never changes the files it describes.

Until git exists, `docs/BASELINE.md` is a **content fingerprint, not a version pin**.

- **Before the baseline commit:** if any of the six files changes, BL-01 must be re-approved. That includes an editor re-saving a file with CRLF line endings.
- **The baseline commit:** task 1.1 checks that the hashes still match, then makes the first commit, which contains the six files, `docs/BASELINE.md`, `docs/superpowers/` (including the Chunk 1 spec and plan) and the repository settings files.
- **Checking the commit:** task 1.1 then compares each committed file with its recorded hash, using Git Bash `git cat-file blob <commit>:<file> | sha256sum`.
- **After the commit:** the commit hash is appended to `docs/BASELINE.md` on `chunk-01-toolchain`, and from then on git is the record.
