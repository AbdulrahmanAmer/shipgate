# The spec audit loop (Stage 0 — closed)

**Closed by the Operator on 2026-10-22** (DECISIONS D-006) after round 09, a single-writer consistency pass, without a GO round: reading audits stopped converging (concreteness 404 → 274 → 245; consistency 135 → 113), so remaining gaps are found by each WP's fixture author and fixed as recorded spec changes (ORCHESTRATOR_PROMPT non-negotiables 1 and 4). The loop below is kept as the record of how rounds 06–08 ran; it is not re-run without the Operator.

Every round lives in `audit/rounds/NN/`.

## One round

1. **Mechanical gate** — `node tools/trace/spec-lint.mjs` must exit 0 with **0 warnings**, and `node tools/trace/spec-lint.test.mjs` must pass (proves each check still catches its planted defect). Fix until green; no auditor runs on a red lint.
2. **Concreteness audit** — independent auditors (fresh context, told "do not edit spec files") check every requirement against `audit/STANDARD.md`, split by file group so each auditor reads ≤ ~80 KB. Brief: `audit/prompts/concreteness.md`. Each writes `audit/rounds/NN/concreteness-<group>.md`.
3. **Consistency audit** — one auditor over seams between files (keys used vs defined, ownership, channels → gates, mutating stage, edge requests, business.json fields, BUILD_MAP deps). Brief: `audit/prompts/consistency.md`.
4. **Coverage audit** — auditors over the goal (search engines, answer engines, real use, law in major markets). Brief: `audit/prompts/coverage.md`. Must-adds **and** Should-adds are both added; nothing is parked as optional.
5. **Resolution** — the orchestrator merges all findings into `audit/rounds/NN/resolution.md`: one line per finding → `fixed (file § / CHANGES entry)` or `rejected (reason)`. Fixes are applied (one writer per spec file), then step 1 runs again.

## Exit (GO)

A round is **GO** when, in that same round:
- spec-lint: 0 errors, 0 warnings; self-test passes;
- concreteness: 0 findings across all groups;
- consistency: 0 findings;
- coverage: 0 Must-adds and 0 Should-adds;
- the previous round's `resolution.md` accounts for every one of its findings.

Findings that fresh auditors raise but that don't meet the bar in the brief are rejected with a reason in `resolution.md` — rejected is closed, not open. A round with any fix applied is never GO: its fixes get audited by the next round.

## Rules for auditors (put in every brief)

- Do NOT edit spec files. Write only your own findings file.
- Search the spec before claiming something is missing; quote the line you checked.
- Every finding: location (`file:line`), criterion or seam, severity, the defect in one sentence, and the exact replacement text that fixes it.
- Don't pad. A report with zero findings is a valid result.
