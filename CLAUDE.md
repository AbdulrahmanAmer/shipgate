# shipgate — CLAUDE.md

shipgate is a closed-source Rust verifier that gates AI-agent-built websites and apps so they thrive in search engines, AI answer engines and real use. This repo is its specification (`SPEC.md`, `spec/**`), build plan (`BUILD_MAP.md`) and — once Stage 0 is GO — its code.

**Where we are lives in `.claude/POSITION.md`** (injected at session start). To drive the work, follow `ORCHESTRATOR_PROMPT.md`.

## Rules for this repo
- **No build work until the spec audit loop is GO** (`audit/README.md`). Not WP-000, not `cargo init`.
- **Nothing is left open.** Every audit finding is fixed or rejected with a reason in that round's `resolution.md`; should-adds are added, not parked; every WP slice is delivered or re-assigned in `trace/ownership.tsv`.
- **Gates before claims:** `node tools/trace/spec-lint.mjs` (0 errors, 0 warnings) and `node tools/trace/spec-lint.test.mjs` after every spec edit; `node tools/trace/trace-check.mjs --wp WP-<id>` before any WP is called done. Paste real output.
- **Ownership changes only in `trace/ownership.tsv`**, never by rewording BUILD_MAP prose. A new rule or part needs its row in the same change.
- **Spec changes are recorded:** a `spec/CHANGES.md` entry (problem, decision, sections) with every spec edit; decisions in `DECISIONS.md`.
- **Builders get `wp-card.mjs` output**, never a hand summary; fixtures are written by a different agent than the builder (`BUILD_MAP.md` § 4.1).
- **One writer per file;** auditors never edit spec files.
- Don't re-open the `SPEC.md` decision log without the Operator.

## Talking to the Operator
Plain everyday words, short. Say NOT DONE, BLOCKED or UNPROVEN plainly when they apply.

## History
The spec was written in an OpenCode session (API billing) whose transcript is `session/opencode-session.json`; work continues here on the Claude Code subscription. Rounds 1–5 of the audits ran there; round 6 onward lives in `audit/rounds/`.
