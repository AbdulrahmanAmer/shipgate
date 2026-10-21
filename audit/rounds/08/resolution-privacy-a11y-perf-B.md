# Resolution — privacy-a11y-perf — pass B — round 08

Inputs: every request in `audit/rounds/08/xfile/from-*.md` targeting spec/packs/privacy.md, spec/packs/accessibility.md or spec/packs/performance.md. Found 3 (all privacy.md). None target accessibility.md or performance.md. The PRF-002 / PRF-010 / PRF-011 mentions in from-core-adapters-ux.md:8, from-data-refactor-arch-aeo-ops-testing-resilience.md:32 and from-web-delivery.md:24–25 target 03 and 04, not these files. from-privacy-a11y-perf.md lists this group's own outgoing requests, so it is not an input.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-algorithms#38 | consistency#38: PRV-023 "Neither request observed: `notConfigured`" → fallback order control + operator-owned `missing-element`; PRV-027 pointer → "(PRV-023's definition, including its fallback and its operator-owned outcome)" | rejected (already fixed) | privacy.md:124, :141 | Applied in pass A (resolution-privacy-a11y-perf-A.md row consistency#38). privacy.md:124 already reads "Neither request observed: the order control is the control activated by the flow's last `click` or `press` step before its first outcome step (`expectEmail`, `expectEgress`, `expectDb`; UX-001); a flow with none of these is one blocking `missing-element` finding owned by `operator` naming the flow id (04 § 1.2 required-facts rules)." privacy.md:141 already reads "(PRV-023's definition, including its fallback and its operator-owned outcome)". No `notConfigured` is left for PRV-023/PRV-027. The 04:35 list already names "PRV-023 (a checkout flow with no order request and no outcome step)". |
| xfile-algorithms#39 | consistency#39: PRV-037 `notice` gets the mutating-stage and `remote: write` markers | rejected (already fixed) | privacy.md:151 | Applied in pass A (row consistency#39, adapted). privacy.md:151 already reads "Part `notice` (Art. 16; G6 mutating flow; mutating stage, 04 § 4.2 step 8; `remote: write`)". |
| xfile-core-adapters-ux#20 | Same fix as consistency#39: replace "(G6 mutating flow). Part `terms`" with "(G6 mutating flow; mutating stage, 04 § 4.2 step 8; `remote: write`). Part `terms`" | rejected (already fixed) | privacy.md:151 | Duplicate of xfile-algorithms#39. The old anchor text is gone. The markers sit on part `notice`, the only part that submits the form. That is where the requested text ends, since it closes just before "Part `terms`". Part `terms` is a read-only html check and stays unmarked. |

## Ownership rows
None (no new rule IDs or parts).

## Ruleset data
None.

## Policy keys added (key · type · default · file)
None.

## spec-lint (`node tools/trace/spec-lint.mjs`, exit 0)
```
spec-lint: {"requirements":575,"rules":556,"toolRequirements":19,"rulesWithParts":201,"errors":0,"warnings":0}
  errors by check: none
  warnings by check: none
```
