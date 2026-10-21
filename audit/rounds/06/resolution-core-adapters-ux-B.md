# Resolution — core-adapters-ux — pass B — round 06

Inputs: every request in `audit/rounds/06/xfile/from-*.md` (8 files) whose target is `spec/01-core.md`, `spec/02-adapters.md` or `spec/packs/ux.md`. Four requests qualify; none targets `ux.md`. from-algorithms, from-data-refactor-arch-aeo-ops-testing-resilience, from-security, from-web-delivery and from-core-adapters-ux (this group's own outbox) contain no request to these files. The second bullet of from-programmatic-search X5 targets `performance.md` and is not handled here.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-core-adapters-ux#X1 | from-formats-integrations §1 — 01 § 7 Modes table, "Operator commands" row: point to the single list in 05 § 3.2 | adapted | spec/01-core.md:162 | Cell now reads "exactly the commands denied by 05 § 3.2 "shipgate Operator verbs" (the single definition; incl. `debt rotate`, `conformance`, `migrate`)". Changed from the proposed text: it also names the `baseline --ci` exception (CI detection required, 04 § 15). 05 § 3.2 lists that exception, and the proposed text left it out. Without it, 01 would have contradicted the single definition it points to. `keys show` and `inventory` are stated as not Operator verbs, matching 05 § 1 (l.25, l.32) and the licence-free list (l.216). |
| xfile-core-adapters-ux#X2 | from-privacy-a11y-perf X7 — 01 TR-111: only PRF-001 parts `lcp`/`tbt` are host-calibrated | rejected (already fixed) | spec/01-core.md:269 | Pass A already covers it, and in stricter form: "these timing parts are `skipped(slow-host)` rather than FAIL: PRF-001 parts `lcp` and `tbt`; PRF-002 part `main` (INP across flows) and part `probe` (W); PRF-006; PRF-011; PRF-016; … PRF-001 parts `cls` and `seo` always run". The pass-A text names PRF-002 by part, which is more precise than the proposed whole-rule "PRF-002", so it stays. It matches performance.md PRF-001 (l.34). |
| xfile-core-adapters-ux#X3 | from-privacy-a11y-perf X8 — 02 Templates bullet: drop PRF-005 from the template-level rules | fixed | spec/02-adapters.md:62 | `(SEC-001 raw sinks, TPL-001, PRF-005)` → `(SEC-001 raw sinks, TPL-001)`. Checked: performance.md:38 now has PRF-005 as `browser`-channel over loaded stylesheets, with no template part. |
| xfile-core-adapters-ux#X4 | from-programmatic-search X5 (01 bullet) — 01 TR-111: add CRW-001's verify-environment measurement to the calibrated rules | rejected (already fixed) | spec/01-core.md:269 | Pass A already covers it: "CRW-001's verify-environment measurement (`http` channel; its edge-pass measurement is not calibrated and always runs)". That matches programmatic.md CRW-001 (l.232). X2 and X4 change the same sentence. The current text satisfies both, so no further edit is needed. |

## Ownership rows
None (no new rule IDs or parts).

## Ruleset data
None.

## Policy keys added (key · type · default · file)
None.

## spec-lint (last three lines)
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":142,"errors":0,"warnings":62}
  errors by check: none
  warnings by check: ruleset-unsourced=62
```
The 62 `ruleset-unsourced` warnings are orchestrator-owned (ruleset sourcing rows not yet added). None comes from this pass's edits.
