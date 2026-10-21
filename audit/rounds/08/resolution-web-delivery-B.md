# Resolution — web-delivery — pass B — round 08

File edited: `spec/packs/web-delivery.md`. Line numbers are after the edits. Inputs: every request in `audit/rounds/08/xfile/from-*.md` that targets `spec/packs/web-delivery.md`. That is 7 rows from `from-algorithms.md` (Mirror tables), 2 from `from-core-adapters-ux.md` (#18, #19) and 1 from `from-programmatic-search.md` (X1). `from-security.md`, `from-privacy-a11y-perf.md`, `from-formats-integrations.md` and `from-data-refactor-arch-aeo-ops-testing-resilience.md` contain no request for this file: a grep found no `web-delivery` mention and none of this pack's rule IDs. `from-web-delivery.md` holds this group's own outgoing requests. Each "already applied" row was checked against the current text before it was marked.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| from-algorithms#46 (consistency#46) | URL-011 unresolved alias wildcard | already applied | web-delivery.md:166 | Pass A (resolution-web-delivery-A, consistency#46). The text now reads "an unresolved one is a blocking `missing-element` finding owned by `operator` naming the entry and `aliasHosts` (04 § 1.2 required-facts rules), never `notConfigured`". |
| from-algorithms#52 (consistency#52) | URL-001 hub query pagination | already applied | web-delivery.md:157 | Pass A. The text now reads "declared `pagination` (web-delivery entries and `style: "query"` programmatic hubs)". |
| from-algorithms#53 (consistency#53) | RTE-004 retired row and probe list cover `products.discontinued` | already applied | web-delivery.md:126, :134 | Pass A. The row reads "Retired path, no successor (web-delivery `retired`; `search-engines.products.discontinued` without `successor`) \| 410". The probe list reads "Retired = every `retired` entry without `successor` and every literal-path (wildcard-free) `search-engines.products.discontinued` …". |
| from-algorithms#45 (consistency#45) | RTE-007 503 stage | already applied | web-delivery.md:137 | Pass A. The text now reads "(04 § 4.5: database stopped, upstream refused or answering 503)". The RES-001 and resilience.md:17 halves went to the resilience owner (from-web-delivery.md #2). |
| from-algorithms#50 (consistency#50) | URL-014 `host-unsupported` | already applied | web-delivery.md:169 | Pass A. The text now reads "`skipped(host-unsupported)` and run in the edge pass as 04 § 3 says … a run whose G8 is `SKIPPED` is then partial (04 § 1.6 step 2)". |
| from-algorithms#86 (consistency#86) | RTE-004 soft-404 lookup key | already applied | web-delivery.md:134 | Pass A. The text now reads "the 04 § 12 effective list (ruleset list ∪ the `soft404Phrases` entry for the page locale's tag or primary subtag, 04 § 15 …)". |
| from-algorithms#92 (consistency#92) | I18-010 channels | already applied | web-delivery.md:282 | Pass A. The text now reads "**I18-010** · P1 · site, html, data —". |
| from-core-adapters-ux#18 (consistency#89) | URL-011 applicability | already applied | web-delivery.md:166 | Pass A. The text now reads "Alias hosts (with `project.stage: "live"` and `edge.production: true`, otherwise `notApplicable`)". |
| from-core-adapters-ux#19 (coverage-real-use#4) | IDX-012 pointer to UX-026 | fixed | web-delivery.md:265 | Added "Whether search works (results, empty state) is UX-026 (ux)." UX-026 exists at ux.md:77 and already cites "an IDX-012 search route (web-delivery)", so the pointer goes both ways. |
| from-programmatic-search#X1 (coverage-visibility#1, #6) | § 2 coverage map: robots.txt row | fixed | web-delivery.md:96 | Applied verbatim. SE-001, SE-002, SE-010 and SE-011 all exist (search-engines.md:36, :37, :45, :50). |

Skipped as orchestrator-owned (passB-notes #5): none of the requests to this file target `spec/CHANGES.md`, `BUILD_MAP.md`, `trace/ownership.tsv` or `tools/`.

## Ownership rows
None (no new rule IDs or parts).

## Ruleset data
None.

## Policy keys added (key · type · default · file)
None.

## spec-lint (last three lines)
```
spec-lint: {"requirements":575,"rules":556,"toolRequirements":19,"rulesWithParts":201,"errors":0,"warnings":0}
  errors by check: none
  warnings by check: none
```
