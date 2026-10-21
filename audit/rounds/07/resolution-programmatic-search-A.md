# Resolution — programmatic-search — pass A — round 07

Inputs: every row of `audit/rounds/07/concreteness-programmatic-search.md` (49 rows); the rows of `consistency.md` whose Location names `programmatic.md` or `search-engines.md` (#25, 26, 29, 41, 42, 43, 45, 49, 51, 52, 54, 55, 60, 61, 62, 63, 64, 65, 116, 132, 133); the gaps of `coverage-visibility.md` whose pack is programmatic or search-engines (#3, #5, #6, #7). `coverage-real-use.md` has no gap whose pack is programmatic or search-engines (its 19 gaps are privacy, security, ux, web-delivery, accessibility and resilience), so it contributes no row.

`P` = spec/packs/programmatic.md, `S` = spec/packs/search-engines.md (line numbers after this pass). Cross-file edits: `xfile/from-programmatic-search.md` (X1–X10). `spec/CHANGES.md` is outside {FILES}; the orchestrator adds the CHANGES entries from this table.

Operator-decision rows (#4, #26, #27): each proposed default was checked against the SPEC.md decision log. None contradicts it ("Oracle: policy + data", "Acceptance criteria: Operator-signed", "Programmatic review/FAQ markup: denied", "Skeleton & similarity: token-wrapped templates"), so each default was taken; see the Note column.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-programmatic-search#1 | PCF-006, DAT-005 | fixed | P:117 | `id` unique per (family, locale); same id across locales = alternates. |
| concreteness-programmatic-search#2 | CNT-002, PCF-002 | fixed | P:121 | Rule cell replaced with the proposed (a)/(b)/(c) removal procedure. |
| concreteness-programmatic-search#3 | DAT-002 | fixed | P:120, P:130 | Code points after NFC; `max` ≤ 500; `pattern` = Rust `regex`, whole-value match. |
| concreteness-programmatic-search#4 | PCF-003, DAT-010 | fixed + xfile | P:84, P:137, P:265; X4, X5 | **Operator decision: default taken** (it does not contradict the decision log: values come from policy + data only, "Oracle: Policy + data"). `offerField` added to the example (default `null`). Applied only "with `Offer` in `schemaTypes`", and `offerField` naming a non-required/non-money field is also a PCF-003 finding. The inventory example line now carries `schema.values`. 03 § 13 / § 3.5 → X4, X5. |
| concreteness-programmatic-search#5 | PCF-004, DAT-017, ROL-002 | fixed | P:138 | Ranges added; `revalidateSeconds` integer ≥ 1; the proposal's contradictory "`demand.min` ≥ 1 (≥ 0)" resolved as `demand.min` ≥ 0. `ssg`/`ssr` informational. |
| concreteness-programmatic-search#6 | PCF-006, TPL-001 | fixed | P:140 | Copy keys: bare or locale-keyed; missing locale = finding; `aiTextDisclosure` key must exist per rendering locale. |
| concreteness-programmatic-search#7 | PCF-007, PLK-001 | fixed | P:141 | Added "(an ungenerated hub: as above)" so the new sentence does not override the existing ungenerated-hub rule. |
| concreteness-programmatic-search#8 | DAT-001 | fixed | P:156 | Dataset format and `parse-error` (operator) outcomes prepended. |
| concreteness-programmatic-search#9 | DAT-006, CNT-007, ROL-001 | adapted | P:163, P:190, P:202, P:228 | Blocker. Parts `size` (data), `served` (site), `omitted` (http) as proposed. Adapted: route matching cites 03 § 2.1 (URL patterns), not 04 § 10; declared static paths stay allowed in `served`; PRNG candidate key = row `id`; rows whose pathname collides with a live/`previousSlugs`/`retired` pathname are skipped (they legitimately answer 200/301/410). Cross-refs added in CNT-007, § 4-0 and ROL-001. New channels need ownership rows (below). |
| concreteness-programmatic-search#10 | DAT-007 | fixed | P:164 | Part `source-hint` (W · ast). |
| concreteness-programmatic-search#11 | DAT-009 | fixed | P:166, P:138 | Arithmetic added; the "declared together" requirement is also stated in PCF-004 (with `observedAtField` typed `date`/`datetime`, `maxAgeDays` ≥ 1). |
| concreteness-programmatic-search#12 | TPL-001, TPL-003, TPL-004 | fixed + xfile | P:173, P:177; X2, X3 | Hub route files and per-hub skeleton identity. 04 § 13 and § 11 steps 6/8 → X2, X3. |
| concreteness-programmatic-search#13 | TPL-005, TPL-007 | fixed | P:178 | |
| concreteness-programmatic-search#14 | CNT-003 | fixed | P:186 | Also states the comparison for the remaining types (TPL-003 canonical machine value). |
| concreteness-programmatic-search#15 | CNT-006 | fixed + xfile | P:189; X3 | Domain, row text, pair order as proposed; 04 § 11 pointer → X3. |
| concreteness-programmatic-search#16 | CNT-008 | fixed | P:191 | |
| concreteness-programmatic-search#17 | CNT-009 | fixed | P:192 | Raw-DOM structural disclosure exemption, items 1–4 and 6. |
| concreteness-programmatic-search#18 | CNT-010, CRW-002 | fixed + xfile | P:252, P:193, P:238; X4 | *Hub `lastmod`* in § 6, cited from CNT-010 and CRW-002. 03 § 13 → X4. |
| concreteness-programmatic-search#19 | CNT-011 | fixed | P:214, P:138 | Match procedure (per page locale) in CNT-011; key-existence check in PCF-004. |
| concreteness-programmatic-search#20 | CNT-012 | fixed | P:222 | |
| concreteness-programmatic-search#21 | DAT-013, DAT-015 | fixed | P:210, P:212 | DAT-015 now cites DAT-013 *reviewed*. |
| concreteness-programmatic-search#22 | DAT-014 | fixed | P:211 | |
| concreteness-programmatic-search#23 | ROL-001, ROL-003 | fixed | P:228, P:230 | Evidence check uses the export at `waves[k].evidence.exportFile`; failure class `value-mismatch` named. |
| concreteness-programmatic-search#24 | ROL-002, PCF-004 | adapted | P:138 | Type list, missing-value ordering and absent-key behaviour as proposed. "A family with several currencies is a finding" is data-dependent, so it became part `priority-currency` (P0 · data) of PCF-004 (channel `data` added to the rule header). |
| concreteness-programmatic-search#25 | CRW-001, CRW-002 | fixed | P:237, P:238 | Nearest-rank p75; `Last-Modified` = inventory `lastmod` as HTTP-date; stable `ETag`; no `lastmod` → `ETag` required. |
| concreteness-programmatic-search#26 | PLK-002 | adapted | P:246 | **Operator decision: default taken** (consistent with TPL-001 / decision log "Programmatic review/FAQ markup: denied" and "Oracle: Policy + data"): family pages only; `staticFragments` are plain text with no links. Adapted: the DAT-018 `attribution` source link (new this round) is added to the allowed set, since DAT-018 requires it in `<main>` or `<footer>`. |
| concreteness-programmatic-search#27 | § 7 | adapted + xfile | P:272-277, P:163, P:159-160, P:255; X4, X7, X8 | **Operator decision: default taken** (fixtures are Operator-owned under `quality/fixtures/**`, 01-core path table; consistent with the decision log). Adapted so every expectation is decidable: (a) each case has a `fixture` key value; (b) the proposal's "`undefined` is quarantined (MET-008)" had no rule behind it, so DAT-002 now rejects text-like values containing `{`/`}`/`${` or equal to `undefined`/`null`/`nan`/`[object object]`; (c) DAT-003 now defines invalid optional values (omitted, listed in `quarantine.jsonl`), which the `javascript:` case needs; (d) the missing-fixture finding needed a rule ID: DAT-006 part `fixtures` (P1 · data, operator, required-facts); (e) live mode → `skipped(live-mode)`; (f) `SHIPGATE_INVENTORY_DIR` added to § 6 inventory mode. Stage placement 04 § 2 → X8; required-facts list → X7; 03 § 13 → X4. |
| concreteness-programmatic-search#28 | DAT-012, DAT-014, KW-003, CNT-002 | fixed + xfile | P:132, P:169; X1 | `stop-words.json` shape in § 1.1, `advice-patterns.json` shape in DAT-012; fallback chain → 04 § 14 (X1). |
| concreteness-programmatic-search#29 | SE-002 | fixed | S:37 | Combined with consistency#62 (`engines` ∪ {google, bing}, explicit engine→token map). The browser-observed resources became part `rendered-resources` (P0 · browser), because the rule's other evidence is HTTP-only; channel `browser` added. |
| concreteness-programmatic-search#30 | SE-004, IDX-003 | fixed | S:39 | Merged with consistency#52: format grammar stated, movement → AEO-012, source → IDX-003. |
| concreteness-programmatic-search#31 | SE-005, CRW-002 | fixed | S:40 | |
| concreteness-programmatic-search#32 | SE-007 | fixed | S:42 | |
| concreteness-programmatic-search#33 | SE-008, SE-002 | fixed + xfile | S:43; X10 | SE-008 reads `search-agents.json` per SE-002 token; RTE-010 token list → X10. |
| concreteness-programmatic-search#34 | SE-101 | fixed | S:49 | |
| concreteness-programmatic-search#35 | SE-104 | adapted | S:52 | Proposed text taken; the sitemap check was named part `sitemap` (P1 · site) since it is separately severable, and `news.enabled` false → `notApplicable` stated. |
| concreteness-programmatic-search#36 | SE-108 | fixed | S:56 | |
| concreteness-programmatic-search#37 | SE-109 | fixed | S:57 | *Gated block* defined; merged with consistency#26. |
| concreteness-programmatic-search#38 | SE-112 | fixed | S:60 | |
| concreteness-programmatic-search#39 | SE-113 | fixed | S:61 | |
| concreteness-programmatic-search#40 | SE-130, SE-131, SE-132 | fixed | S:77, S:81 | |
| concreteness-programmatic-search#41 | SE-204 | fixed | S:92 | |
| concreteness-programmatic-search#42 | SE-302 | fixed | S:98 | |
| concreteness-programmatic-search#43 | SE-401 | fixed | S:102 | |
| concreteness-programmatic-search#44 | SE-501 | fixed | S:111 | In part `hosts` (see consistency#63). |
| concreteness-programmatic-search#45 | SE-503 | fixed | S:113 | URL canonicalised per 04 § 10 normalisation. |
| concreteness-programmatic-search#46 | SE-103, SE-121, SE-301, SE-501, LOC-001 | fixed + xfile | S:51, S:66, S:97, S:111, S:130; X1 | Each shape is stated where the rule cites the file; locale fallback → X1. |
| concreteness-programmatic-search#47 | LOC-001 | fixed | S:130 | Candidate filter as proposed ("at most one comma"). |
| concreteness-programmatic-search#48 | LOC-001 | fixed | S:130 | Day-range / time-range expansion. |
| concreteness-programmatic-search#49 | LOC-001, UX-003 | fixed | S:128, S:130 | Raw-HTML text, `ux.factsIgnore` exclusion for all three parts, default region = 04 § 15 *E.164 normalisation*. |
| consistency#25 | CNT-009 (with AEO-014) | fixed | P:192 | CNT-009 side only: allowance holds only while non-exempt hidden words in `<main>` total < 100 (the AEO-014 page total). The AEO-014 side is the answer-engines fixer's own row. |
| consistency#26 | SE-109 ↔ AEO-014 | fixed | S:57 | Mirrored `owns` sentence added. The AEO-014 side is already in the text (no request). |
| consistency#29 | LOC-001 ↔ PRV-022/025 | fixed | S:125, S:130 | A candidate also passes on `postalAddress`, `manufacturers[].address` or `euResponsible.address`; the empty-`locations` facts-oracle preamble now says the same. |
| consistency#41 | SCH-003 ↔ features | xfile (already applied) | — | The fix targets web-delivery only; the current text already has it (see xfile "No request needed"). |
| consistency#42 | URL-004 ↔ SE-111 | fixed (mirror) | S:59 | URL-004 side already applied by its owner; SE-111 now names the URL-004 allowance. |
| consistency#43 | URL-001 ↔ SE-111, § 3.3 | fixed (mirror) | S:59, S:77 | URL-001 side already applied; mirrors added. |
| consistency#45 | SE-105 ↔ MET-005 | fixed | S:53 | |
| consistency#49 | SE-113, SE-114 owner | fixed + xfile | S:61, S:62; X6 | Builder-owned unless outside `writeScope` (04 § 14); 03 § 14 two places → X6. |
| consistency#51 | SE-110 ↔ AEO-006 | fixed | S:58 | Clause deleted. |
| consistency#52 | SE-004 ↔ AEO-012 | fixed | S:39 | Merged with concreteness#30. |
| consistency#54 | CNT-005 ↔ CQ-002 | fixed | P:188 | CQ-002 side already applied. |
| consistency#55 | SE-107 | fixed | S:55 | |
| consistency#60 | SE-122 ↔ RTE-010 | fixed | S:67 | |
| consistency#61 | SE-008 data source | skipped — orchestrator | — | Fix targets BUILD_MAP WP-104 only (orchestrator's). The spec side is covered by concreteness#33 (SE-008 text) and X10 (RTE-010 token list). |
| consistency#62 | SE-002, SE-008 implied engines | fixed | S:37, S:43 | |
| consistency#63 | SE-501 ↔ RTE-001 | fixed | S:111 | Part `parity` (P0 · browser) with overlap 1.0 and `owns` `RTE-001#main`; RTE-001 side already applied. Channel `browser` added. |
| consistency#64 | SE-502 ↔ MET-007 | fixed | S:112 | |
| consistency#65 | SE-006 ↔ AEO-009 | fixed | S:41 | AEO-009 side already applied. |
| consistency#116 | ROL-003 CLI syntax | fixed | P:230 | `shipgate rollout release <family>` (05 § 1). |
| consistency#132 | CRW-001 calibration/samples | fixed + xfile | P:237; X8 | `minBenchmarkIndex` default 1000 without the pack; family and hub pages; edge pass = family/hub pages of the edge sample (none → `notApplicable`). 04 § 2 item 5 → X8; 04 § 6.3 is already fixed in the text. |
| consistency#133 | SE-103 ↔ AEO-001 | fixed | S:51 | Mirror added; AEO-001 side already applied. AEO-002/003/004 parts of the row are answer-engines-only. |
| coverage-visibility#3 | CRW-004 (new) | fixed + xfile | P:240; X9 | Added as proposed (Should; nothing parked). Parts `params`, `values`, `depth`, `loop`, `maxurls`; scope stated as the whole crawl. Crawler must record drops and a `loop` limit → 04 § 10 (X9). |
| coverage-visibility#5 | SE-128 (new) | adapted + xfile | S:73, S:24; X5 | Policy key placed in the search-engines block (`search-engines.sitewideLinkAllow`) instead of web-delivery, so the rule and its key live in one pack. Host purpose `legal` does not exist in 03 § 3.3, so the exemption uses `payments` and `assets`. Part `anchor` (W) defined with the Public Suffix List label. 03 § 3.5 → X5. |
| coverage-visibility#6 | LOC-004 (new) | adapted | S:133 | "Korean-market" etc. made decidable through `regions[]` of `local-listing-sources.json` matched against the location `country`. |
| coverage-visibility#7 | DAT-018 (new) | adapted + xfile | P:219-220, P:17-21; X5, X7 | `attribution` for `licensed` sources is a required key that may be `null` (Operator states "none required"; Auditor confirms in part `licensed`) instead of a required string, since some licensed data (e.g. the example's keyword export) is never rendered. Missing `attributionFragment` key folded into part `rights`. Policy example updated with `rights`. Required-facts list → X7; 03 § 3.5 → X5. |

## Ownership rows

```
DAT-006	channel:site	WP-504	part `served` (crawl; WP-504 depends on WP-407)
DAT-006	channel:http	WP-504	part `omitted` probes (404/noindex of omitted rows)
DAT-006	part:fixtures	WP-504	fixture-file check; the fixture pass itself (04 § 2 item 7, X8) needs WP-415 stage scheduling and WP-508 inventory reader honouring SHIPGATE_INVENTORY_DIR
DAT-018	*	WP-502	cfg part `rights`
DAT-018	channel:html	WP-505	part `attribution`
CRW-004	*	WP-506	crawler hook (record trap drops with discovery source, X9) in WP-407
SE-002	channel:browser	WP-608	part `rendered-resources`
SE-501	channel:browser	WP-608	part `parity`
SE-128	*	WP-411	
LOC-004	*	WP-411	review items
```
Parts added to rules whose `*` owner already covers them (no row needed, listed for completeness): PCF-004 `priority-currency` (WP-502), DAT-006 `size` (WP-502), DAT-007 `source-hint` (WP-502), DAT-018 `licensed` (review, WP-502), SE-104 `unused`/`sitemap` (WP-411), SE-128 `anchor` (WP-411), SE-501 `hosts` (WP-411).

## Ruleset data

- `attribution-licences.json` (`[SPDX id…]`) — WP-104 "Round-6 named files" list (or a new "Round-7 data" bullet); DAT-018.
- `local-listing-sources.json` (`[{ engine, name, url, regions[] }]`) — WP-104 "Crawlers and agents" or a new "Round-7 data" bullet; LOC-004.
- `search-agents.json` gains entries for YandexBot, Yeti, Baiduspider, SeznamBot, Applebot — WP-104 "Crawlers and agents" (consistency#61, orchestrator).

## Policy keys added (key · type · default · file)

- `programmatic.families[].offerField` · string (a required `money` field) or `null` · `null` · P (§ 1, PCF-003)
- `programmatic.sources.<id>.rights` · `"owned"|"licensed"|"public-domain"|"open:<SPDX id>"|"facts-only"` · none (required when the source is used) · P (DAT-018)
- `programmatic.sources.<id>.attribution` · string or `null` · none (key required for `licensed`; non-null for attribution-requiring `open:`) · P (DAT-018)
- `programmatic.sources.<id>.attributionFragment` · `staticFragments` key · `attribution-<id>` · P (DAT-018)
- `search-engines.sitewideLinkAllow` · array of host (03 § 3.3 grammar) or `{ host, anchor }` · `[]` · S (§ 1, SE-128)

## spec-lint

`node tools/trace/spec-lint.mjs`, last three lines (run after all edits; the totals include the other 7 fixers' in-flight edits):
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":30,"warnings":64}
  errors by check: ownership=23 channel-infra=7
  warnings by check: ruleset-unsourced=64
```
Errors from these two files (8), all expected — they clear when the orchestrator adds the ownership rows above:
- `[ownership] DAT-018 / CRW-004 / SE-128 / LOC-004 … has no owning work package` (4)
- `[channel-infra] DAT-006 channel site → WP-502` and `channel http → WP-502` (cleared by the two DAT-006 channel rows)
- `[channel-infra] SE-002 channel browser → WP-411` and `SE-501 channel browser → WP-411` (cleared by the WP-608 channel rows)

Warnings from these two files: `ruleset-unsourced` for `attribution-licences.json` (P:219, P:220) and `local-listing-sources.json` (S:133), pending the "Ruleset data" bullets above. The other 22 errors and 59 warnings are in files owned by other fixers (privacy, security, ux, web-delivery, …).
