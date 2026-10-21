# Resolution — programmatic-search — pass B — round 08

Files owned: `spec/packs/programmatic.md` (P), `spec/packs/search-engines.md` (S). Inputs: every request in `audit/rounds/08/xfile/from-*.md` that targets P or S (only from-algorithms, from-core-adapters-ux and from-privacy-a11y-perf name them). Settled decisions: round-07 passB-notes. Line numbers are after this pass's edits.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-algorithms#21 | consistency#21 mirror, programmatic § 6 *live* | rejected (already fixed) | P:261 | Applied in pass A (resolution-programmatic-search-A, consistency#21). P:261 already reads: "the oracle uses a snapshot produced at verify time by `family.snapshot: { db, sql }` … A live-mode family without `family.snapshot` is a CFG-001 finding; a service `commands.snapshot` is never an oracle source". |
| xfile-algorithms#54 | consistency#54 mirror, CRW-004 complete crawl | rejected (already fixed) | P:244 | Applied in pass A. P:244: "a URL dropped by a trap limit counts toward `incomplete-crawl` (04 § 10 *Complete crawl*, *Graph rules*) unless it was discovered only through `a[href]` with `rel~=nofollow` or is disallowed for Googlebot". |
| xfile-algorithms#96 | consistency#96, CNT-006 channel | rejected (already fixed) | P:192 | Applied in pass A. P:192 reads "**CNT-006** · P1 · data". |
| xfile-algorithms#97 | consistency#97, SE-202 / SE-403 page locale | rejected (already fixed) | S:105, S:119, S:124 | Applied in pass A. S:105: "pages whose page locale (04 § 15) has primary language subtag `zh`, `ja` or `ko`"; S:119: "on pages whose page locale (04 § 15) has primary language subtag `ko`". |
| xfile-core-adapters-ux#16 | consistency#21, programmatic § 6 *live* | rejected (already fixed) | P:261 | Same as xfile-algorithms#21. The CFG-001 outcome and the blocking `missing-element` owned by `operator` for snapshot rows that are not Operator-owned are both in P:261. No `commands.snapshot` remains except the sentence saying it is never an oracle source. |
| xfile-core-adapters-ux#17 | consistency#37, LOC-001 `phones` | rejected (already fixed) | S:145 | Applied in pass A (concreteness#6 + consistency#37): `legal.host.phone` and `legal.grievanceOfficer.phone` were already in the list. This pass extends the list further (next row). |
| xfile-privacy-a11y-perf#X8 | LOC-001 `phones` + `legal.dmcaAgent.phone` | adapted | S:140, S:145 | The phone half was applied as requested: the list now ends "`legal.grievanceOfficer.phone` or `legal.dmcaAgent.phone` value (PRV-030, PRV-033 and PRV-042 require the last three on pages)". **Extended:** the same defect also affects part `address`. PRV-038 `representative` puts `legal.euRepresentative`/`legal.ukRepresentative` `address` on the privacy page, and PRV-042 `dmca-agent` puts `legal.dmcaAgent.address` on a page. Without them, a compliant indexable page would get a P0 LOC-001 `forbidden-value`. So these three addresses were added to the facts-oracle sentence (S:140) and to the part `address` match list (S:145), whose "required-facts addresses" citation now also names PRV-038 and PRV-042. The keys are the ones X4 adds to 03 § 14 (formats fixer). Emails are not in LOC-001, so the UX-003 email half belongs to the ux fixer. |

## Ownership rows
None (no new IDs or parts).

## Ruleset data
None.

## Policy keys added (key · type · default · file)
None. The edits read `business.json` keys `legal.euRepresentative.address`, `legal.ukRepresentative.address`, `legal.dmcaAgent.address` and `legal.dmcaAgent.phone`, which 03 § 14 defines through request privacy-a11y-perf X4.

## spec-lint (`node tools/trace/spec-lint.mjs`, exit 0)
```
spec-lint: {"requirements":575,"rules":556,"toolRequirements":19,"rulesWithParts":201,"errors":0,"warnings":0}
  errors by check: none
  warnings by check: none
```
