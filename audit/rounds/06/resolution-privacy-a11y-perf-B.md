# Resolution — privacy-a11y-perf — pass B — round 06

Inputs scanned: all 8 files `audit/rounds/06/xfile/from-*.md` (algorithms, core-adapters-ux, data-refactor-arch-aeo-ops-testing-resilience, formats-integrations, privacy-a11y-perf, programmatic-search, security, web-delivery). Exactly one request targets a file of this group (`spec/packs/performance.md`); none target `privacy.md` or `accessibility.md`. Requests addressed to other spec files, to `spec/CHANGES.md`, `BUILD_MAP.md`, `trace/ownership.tsv` or `tools/` were skipped as out of scope.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-privacy-a11y-perf#X1 | from-programmatic-search X5 (2nd bullet), serves concreteness-programmatic-search #14: performance.md § Calibration — add CRW-001's verify-environment TTFB to "Calibrated rules" | adapted | spec/packs/performance.md:28 | Proposed old text (`Calibrated rules: PRF-001, PRF-002, …`) no longer exists: pass A of this group changed it to `PRF-001 parts \`lcp\` and \`tbt\``. Kept the pass-A part restriction (stricter: `cls`/`seo` never skipped) and appended `, and CRW-001's verify-environment TTFB (programmatic pack, \`http\` channel in G4; its edge-pass measurement is not calibrated and always runs)`. Consistent with programmatic.md:232 (CRW-001 text) and 01-core.md:269 (TR-111, already lists CRW-001 and the PRF-001 parts), and with performance.md:60 ("every timing rule in G4 and G6") since CRW-001's `http` channel runs in G4 (04 § 1.1). |

Cross-checks with no edit needed in this group's files:
- formats-integrations #2 / data-refactor X3, X9 (hosts `dependency` marker): privacy.md:26 already speaks of `hosts[]` entries "with purposes", and no file of this group references the `dependency` marker. Not affected by either version.
- algorithms X1–X5 / programmatic-search X1 (single *Hidden content* definition): no file of this group defines or cites hidden content, ΔE or skeleton hashes. accessibility.md:52 (A11-021 `carousel`) uses ruleset `carousel-markers.json`, the same name 04 § 15's exemption list uses.

No new xfile requests from pass B.

## Ownership rows
None (no new rule IDs or parts).

## Ruleset data
None new in pass B. (The pass-A ruleset files listed in `resolution-privacy-a11y-perf-A.md` still produce the expected `ruleset-unsourced` warnings below until the orchestrator adds them to BUILD_MAP WP-104.)

## Policy keys added (key · type · default · file)
None.

## spec-lint (`node tools/trace/spec-lint.mjs`, exit 0) — last three lines
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":142,"errors":0,"warnings":62}
  errors by check: none
  warnings by check: ruleset-unsourced=62
```
Expected warnings from this group's files (orchestrator rows not yet added): `required-labels` (accessibility.md:34), `pagination-labels` (performance.md:45), `lighthouse-audit-renames` (performance.md:58), `marketing-optin-labels` (privacy.md:64), `shipping-cost-phrases` (privacy.md:97).
