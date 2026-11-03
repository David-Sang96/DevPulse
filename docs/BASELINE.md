# DevPulse planning baseline (BL-01)

This file records the planning baseline that David approved as BL-01. It sits outside the six baseline files, so writing it never changes the files it describes. It follows the "Baseline approval procedure (BL-01)" in [REQUIREMENTS.md](REQUIREMENTS.md#baseline-approval-procedure-bl-01).

Until git exists, this is a **content fingerprint, not a version pin**. If any of the six files changes before the baseline commit, BL-01 must be re-approved, including when an editor re-saves a file with CRLF line endings.

## Approval

| Field | Value |
| --- | --- |
| Decision | BL-01, planning baseline approval: revision r4, with the RV-01…RV-05 and final baseline review corrections |
| Decision log | The BL-01 row in the [REQUIREMENTS decision log](REQUIREMENTS.md#decision-log) |
| Date | 2026-11-03 |
| Source | Message in the Claude Code session of 2026-11-03: "David has explicitly approved BL-01." |
| Effect | Lifts only Chunk 1's start gate. Confirms no assumption (A-01…A-06), approves no Proposed item and resolves no open decision (OD-01…OD-19). |

## Baseline fingerprint

Taken after procedure steps 1 and 2: the BL-01 row was added, then line endings were converted to LF with Git Bash `sed -i 's/\r$//'`. Each file had 0 carriage returns and no byte-order mark before and after the conversion, and its size and content were unchanged by it. The Chunk 1 start check (chunk-workflow skill, Step 2) and task 1.1 compare against these hashes.

| File | SHA-256 | Size (bytes) | Last modified (+08:00) |
| --- | --- | --- | --- |
| `README.md` | `2778f11f092d7fc29aaaec327e4da105e73ec942dac05f5435a49b77e5095c9d` | 6906 | 2026-11-03 13:21:19 |
| `CLAUDE.md` | `232de46a9ca1e5cf0c65aefa13ff93a43273f4788d452afe1fb2e7e81be69c27` | 9591 | 2026-11-03 13:21:19 |
| `docs/REQUIREMENTS.md` | `a109c8a432f094e3a2655373a869d21af5b365a7920be12b950e8263e62f2aab` | 34463 | 2026-11-03 13:21:19 |
| `docs/ARCHITECTURE.md` | `513e0287d5fc85f708450e26593776b0f5c91aab4165d338e28b9981b3c9a04d` | 43720 | 2026-11-03 13:21:19 |
| `docs/IMPLEMENTATION_ROADMAP.md` | `63107f3efb74d1baf31d31f44820d5f337a78185b6c92d3001963da7b7d63660` | 106262 | 2026-11-03 13:21:19 |
| `.claude/skills/chunk-workflow/SKILL.md` | `8d00431c8edbddcc0fef8043162de63acdf0e54e3a5b3c9fdc21909c45039e1b` | 17874 | 2026-11-03 13:21:19 |

To check, run this in Git Bash from the project root and compare the output with the table:

```bash
sha256sum README.md CLAUDE.md docs/REQUIREMENTS.md docs/ARCHITECTURE.md docs/IMPLEMENTATION_ROADMAP.md .claude/skills/chunk-workflow/SKILL.md
```

## Content David reviewed

These are the hashes of the six files as reviewed, taken before the BL-01 row was added. Five are identical to the fingerprint above. `docs/REQUIREMENTS.md` differs only at the decision log, where the BL-01 row replaced the placeholder row "No decisions recorded yet": putting the placeholder back reproduces the hash below exactly.

| File | SHA-256 before the BL-01 row |
| --- | --- |
| `README.md` | `2778f11f092d7fc29aaaec327e4da105e73ec942dac05f5435a49b77e5095c9d` |
| `CLAUDE.md` | `232de46a9ca1e5cf0c65aefa13ff93a43273f4788d452afe1fb2e7e81be69c27` |
| `docs/REQUIREMENTS.md` | `3ed962dc939d324c6adc80a182468aadb8a6f2be79196031645135591669d7fb` |
| `docs/ARCHITECTURE.md` | `513e0287d5fc85f708450e26593776b0f5c91aab4165d338e28b9981b3c9a04d` |
| `docs/IMPLEMENTATION_ROADMAP.md` | `63107f3efb74d1baf31d31f44820d5f337a78185b6c92d3001963da7b7d63660` |
| `.claude/skills/chunk-workflow/SKILL.md` | `8d00431c8edbddcc0fef8043162de63acdf0e54e3a5b3c9fdc21909c45039e1b` |

## Baseline commit

Not made yet. Task 1.1 makes the baseline commit, checks each committed file with Git Bash `git cat-file blob <commit>:<file> | sha256sum`, and then appends the commit hash here, on the `chunk-01-toolchain` branch. From then on, git is the record.
