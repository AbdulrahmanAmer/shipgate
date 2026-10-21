# shipgate — CLAUDE.md

shipgate is a closed-source Rust verifier that gates AI-agent-built websites and apps so they thrive in search engines, AI answer engines and real use. This repo holds its specification (`SPEC.md`, `spec/**`), build plan (`BUILD_MAP.md`) and its code.

**Where we are lives in `.claude/POSITION.md`** (injected at session start). To drive the work, follow `ORCHESTRATOR_PROMPT.md`.

## Rules for this repo
- **Stage 0 (spec audit loop) is closed** by the Operator (2026-10-22, DECISIONS D-006). Spec gaps found while building are fixed as recorded spec changes before that WP continues; no new whole-spec audit rounds without the Operator.
- **Nothing is left open.** Every finding is fixed or rejected with a written reason; should-adds are added, not parked; every WP slice is delivered or re-assigned in `trace/ownership.tsv`.
- **Gates before claims:** `node tools/trace/spec-lint.mjs` (0 errors, 0 warnings) and `node tools/trace/spec-lint.test.mjs` after every spec edit; `node tools/trace/trace-check.mjs --wp WP-<id>` before any WP is called done. Paste real output.
- **Ownership changes only in `trace/ownership.tsv`**, never by rewording BUILD_MAP prose. A new rule or part needs its row in the same change.
- **Spec changes are recorded:** a `spec/CHANGES.md` entry (problem, decision, sections) with every spec edit; decisions in `DECISIONS.md`.
- **Builders get `wp-card.mjs` output**, never a hand summary; fixtures are written by a different agent than the builder, and builder branches pass `merge-gate.mjs` (`BUILD_MAP.md` § 4.1).
- **One writer per file;** contract files (spec, `trace/`, `tools/trace/`, locked fixtures) change only on `main`, by the orchestrator.
- Don't re-open the `SPEC.md` decision log without the Operator.

## Talking to the Operator
Plain everyday words, short. Say NOT DONE, BLOCKED or UNPROVEN plainly when they apply.

## History
The spec was written in an OpenCode session (API billing) whose transcript is `session/opencode-session.json`; work continues here on the Claude Code subscription. Rounds 1–5 of the audits ran there; rounds 6–9 live in `audit/rounds/`.
