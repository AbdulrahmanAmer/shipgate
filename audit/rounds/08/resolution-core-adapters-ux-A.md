# Resolution — core-adapters-ux — pass A — round 08

Inputs: all 23 rows of `concreteness-core-adapters-ux.md`; consistency rows ≥ 20 whose Location names `spec/01-core.md`, `spec/02-adapters.md` or `spec/packs/ux.md` (19 rows); ux-pack gaps of `coverage-real-use.md` (#1, #4, #9) and `coverage-visibility.md` (#8). 46 rows. Settled decisions applied: 07 passB-notes items 1–5. The row-1 Operator default (wide form definition + `formsNotCritical`) does not contradict the SPEC.md decision log (`grep -n "formsNotCritical\|UX-001" SPEC.md` → no hit) and was taken.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-core-adapters-ux#1 | UX-001 Forms | adapted | ux.md:35 | Operator default taken. "A form without `action` is therefore a form whatever its `method`" narrowed to "…without `action` that has a submit control…", because the definition's first clause needs a submit control or a non-GET method; navigation-form exemption points at UX-026 for search/filter forms. |
| concreteness-core-adapters-ux#2 | UX-001/UX-006 probe | fixed | ux.md:35, :39 | Probe clicks every other visible enabled button incl. `<nav>` and no-landmark elements; UX-001 says "anywhere in the document". |
| concreteness-core-adapters-ux#3 | UX-001 `mobile` | fixed | ux.md:35 | Part now `cfg, browser`, gated on G6 like UX-022; *form identity* defined. 04 § 1.2 example text → xfile #7. |
| concreteness-core-adapters-ux#4 | UX-003 ratings | adapted | ux.md:36, :97 | As proposed; `best` wording made explicit for a non-participating group. |
| concreteness-core-adapters-ux#5 | UX-005 | fixed | ux.md:38 | Locale root via `web-delivery.locales`; normalisation 04 § 10. |
| concreteness-core-adapters-ux#6 | UX-006/UX-001 visible | fixed | ux.md:101; used at :35, :39 | § 3 *Visible element*. |
| concreteness-core-adapters-ux#7 | UX-008 JS | adapted | ux.md:41, :89, :102 | Ruleset `baseline-js-syntax.json` with shape and match rule in § 3; BCD key forms added ("first that exists in the pinned BCD data" for `api.*` vs `javascript.builtins.*`). BUILD_MAP WP-104 entry → Ruleset data below (orchestrator). |
| concreteness-core-adapters-ux#8 | UX-010 conversions | fixed | ux.md:43 | |
| concreteness-core-adapters-ux#9 | UX-014 people/testimonials | fixed | ux.md:46 | |
| concreteness-core-adapters-ux#10 | UX-014 byline prefix | fixed | ux.md:46, :95; UX-017 :49 | `byline.prefixes` added to the *Phrase-list matching* list. |
| concreteness-core-adapters-ux#11 | UX-015 | fixed | ux.md:47 | |
| concreteness-core-adapters-ux#12 | UX-018/UX-016 shapes | fixed | ux.md:99 | |
| concreteness-core-adapters-ux#13 | UX-019 marks | adapted | ux.md:52 | UX-019 is `html`, so `currentSrc`/computed `background-image` (browser) replaced by raw-HTML candidates: `img` `src`+`srcset`, `input[type=image]`, `svg image href`, inline-`style` `url()`; fetched for the hash. |
| concreteness-core-adapters-ux#14 | UX-020 social-proof | adapted | ux.md:59, :27 | As proposed, reworded "the `hosts` of the widget's `social-proof-widgets` entry" (the proposed "ruleset `hosts`" made spec-lint report a ruleset file named `hosts`). Validation sentence added. |
| concreteness-core-adapters-ux#15 | UX-020 `:path`, db result | fixed | ux.md:56, :58, :59 | |
| concreteness-core-adapters-ux#16 | UX-023 claims | fixed | ux.md:63 | |
| concreteness-core-adapters-ux#17 | UX-023 minimum | fixed | ux.md:64 | |
| concreteness-core-adapters-ux#18 | term-patterns unit | adapted | ux.md:98 | "exact decimal arithmetic" → "exact rational arithmetic" (1/24 day has no finite decimal); a non-integer result equals no integer `terms` value. |
| concreteness-core-adapters-ux#19 | UX-024 | adapted | ux.md:66, :69 | `data:`/`blob:` rule as proposed; `stock-preview` window defined (navigation start → `load` + 2 s) since UX-024 had no observation window. |
| concreteness-core-adapters-ux#20 | ux policy block | fixed | ux.md:12, :14, :18, :19, :27 | `factsIgnore` comment also names UX-027 (new). |
| concreteness-core-adapters-ux#21 | 02 § 3 Detection | fixed | 02-adapters.md:55 | |
| concreteness-core-adapters-ux#22 | 02 § 5 hosted-builder | fixed + xfile | 02-adapters.md:88; xfile #1 | `builderAssets` row for 03 § 6. |
| concreteness-core-adapters-ux#23 | AGT-011 parts | adapted | 01-core.md:207–208 | Written "Parts `ast` and `behaviour`: …" (spec-lint parses `Parts ` + names, not `Parts:`); "Behavioural part" → "Behavioural part `behaviour`". Lint now requires an ownership row `AGT-011 part:behaviour WP-608` (below). |
| consistency#21 | CFG-002 `snapshot` | fixed + xfile | 01-core.md:132, :133; xfile #13, #16 | `snapshot` command removed from CFG-002; CFG-001 rejects a live-mode family without `family.snapshot`. 04/programmatic clauses → xfile. |
| consistency#23 | ops ↔ CFG-006 | xfile | xfile #21 | 01:137 needs no change; the fix is in ops.md only. |
| consistency#37 | UX-003/LOC-001 phones | fixed + xfile | ux.md:36; xfile #17 | |
| consistency#39 | PRV-037 mutating | xfile | xfile #20 | 01:171 is only the cited `remote` rule; no 01 text changes. |
| consistency#41 | WP dependencies | xfile (orchestrator) | — | Fix is BUILD_MAP only (WP-609/203/602); orchestrator-owned per 07 passB-notes item 5, not written to xfile. ux.md needs no change. |
| consistency#43 | RES-008 stage order | xfile | xfile #9, #22 | ux.md:59 (UX-022) already carries the G6 guard RES-008 copies. |
| consistency#62 | seed contract | fixed + xfile | 01-core.md:218; xfile #10 | |
| consistency#66 | `data-api.db.service` | fixed + xfile | 01-core.md:133; xfile #5, #12, #23 | 01 now names `data-api.db.service`; the key itself is added by the data-api owner (xfile #23). |
| consistency#67 | SMTP sink | fixed + xfile | 01-core.md:149; xfile #4 | |
| consistency#70 | early stop | fixed + xfile | 01-core.md:171; xfile #11 | |
| consistency#82 | 03 § 3.5 no default | xfile | xfile #3 | ux.md already marks both "no default"; request also adds `trackingIds`. |
| consistency#83 | `ux.egressStubs` comment | fixed | ux.md:12 | Merged with concreteness#20 (status/body types). |
| consistency#84 | UX-024 channels | fixed | ux.md:66 | |
| consistency#88 | adapter traps ↔ RTE-008 | fixed | 02-adapters.md:85, :88 | |
| consistency#89 | URL-011 applicability | xfile | xfile #18 | 01:140 already says stage `live`; no 01 change. |
| consistency#101 | modes table | fixed | 01-core.md:161 | |
| consistency#108 | launch-check list | fixed + xfile | 01-core.md:140; xfile #14 | |
| consistency#111 | verify.env reads | fixed + xfile | 01-core.md:99; xfile #15 | |
| consistency#113 | Firebase emulator | fixed + xfile | 01-core.md:143; xfile #6 | |
| coverage-real-use#1 | UX-025 tracking IDs (Must) | adapted | ux.md:22, :27, :71–76, :94, :100 | Part `declared` made pure `cfg` over Operator-owned `hosts[]` (no G6 dependency, so decidable at G0). Part `static` is builder-owned facts-oracle (`forbidden-value`), not an Operator handoff: an agent adding an undeclared tag must not earn an operator stop. ID fields live in `analytics-vendors` (`idParam`, `libraryPaths`, `libraryIdParam`, `idPattern`; table now also lists advertising vendors) instead of a second `google-tags.json` lookup. Part `placeholder` also checks the Operator's `ids` (owner `operator`). 04 § 1.2 lists → xfile #7, #8. |
| coverage-real-use#4 | UX-026 search/filter (Should) | adapted | ux.md:23, :27, :77–80, :100 | Term source made deterministic (lowest-position page of 10-URL sample `ux-026`, 04 § 10) instead of "first sampled page" + PRNG; part `empty` requires the no-results phrase and 2xx only (dropped the undefined "no result links"); filter probe capped at 5 controls per form; probes at both viewports. Ties in with concreteness#1: GET navigation forms are exempt from UX-001 and judged here. IDX-012 pointer → xfile #19. |
| coverage-real-use#9 | UX-013 `regulated` (Should) | adapted | ux.md:45, :100 | Added overlap rule: a span matched by both `claimPhrases` and `regulated-claims.json` is judged by `regulated` only (otherwise one sentence gave two findings). |
| coverage-visibility#8 | incentivised reviews (Should) | adapted | ux.md:81–85; xfile #2, #7 | Renumbered UX-027 (UX-025 taken by real-use#1). Channel `cfg` instead of `data` (business.json checks in this pack are `cfg`, as UX-023 `minimum`). Disclosure region defined as the nearest ancestor `article`/`section`/`aside`/`main` (else `<body>`) instead of the undefined "section around it"; `incentive` optional in the 03 shape so a missing value is the UX-027 Operator finding, not a CFG-001 run stop. |

Counts (46 rows): fixed 28 (10 of them also with an xfile request), adapted 12, xfile only 6 (1 of them orchestrator-owned BUILD_MAP, not written), rejected 0.

## Ownership rows
```
UX-025	*	WP-609	R08 new: tracking IDs are the Operator's (coverage-real-use#1); ruleset WP-104
UX-026	*	WP-609	R08 new: search and filter forms work (coverage-real-use#4); needs the UX-001 form identity (WP-602 control inventory)
UX-027	*	WP-609	R08 new: incentivised reviews disclosed (coverage-visibility#8); business.json `incentive` field WP-205
UX-013	part:regulated	WP-609	R08 new part (coverage-real-use#9); same WP as UX-013 *, listed for completeness
AGT-011	part:behaviour	WP-608	R08 part named (concreteness#23); comparison pass 04 § 2 item 6 — required by spec-lint
AGT-011	part:ast	WP-304	R08 part named (concreteness#23); same WP as AGT-011 *
```

## Ruleset data
All under the WP-104 "UX and analytics" bullet:
- `baseline-js-syntax.json` (UX-008) — oxc node type → BCD key table.
- `regulated-claims.json` (UX-013 `regulated`) — per-locale health/medical/origin/organic regexes.
- `placeholder-tracking-ids.json` (UX-025) — placeholder ID regexes.
- `no-results-phrases.json` (UX-026) — per-locale empty-search phrases.
- `incentive-disclosure-phrases.json` (UX-027) — per-locale incentive disclosure phrases.
- Shape changes to existing data: `testimonial-markers.json` `byline` → `{ selectors, prefixes: { <locale>: [string] } }`; `analytics-vendors` gains advertising-vendor entries and optional `idParam`, `libraryPaths`, `libraryIdParam`, `idPattern`; `ratingPatterns` may hold count-only patterns.

## Policy keys added (key · type · default · file)
- `ux.trackingIds` · `[{ host: host, ids: [string] (≥ 1) }]` · no default (03 § 3.5 row → xfile #3) · spec/packs/ux.md
- `ux.searchProbe.maxForms` · integer 1–20 · `3` · spec/packs/ux.md
- `ux.analyticsMatchers[host].idParam` / `.libraryPaths` / `.libraryIdParam` / `.idPattern` · string / regex / string / regex · absent · spec/packs/ux.md
- (03 § 14, via xfile #2) `business.json` `testimonials[].incentive`, `ratings[].incentive` · `"none"` or array of `discount|payment|free-product|other` · no default · spec/03-formats.md

## spec-lint
```
spec-lint: {"requirements":565,"rules":546,"toolRequirements":19,"rulesWithParts":192,"errors":22,"warnings":43}
  errors by check: dangling=5 ownership=17
  warnings by check: ruleset-unsourced=40 ruleset-unnamed=3
```
Errors from my files (all expected, waiting on orchestrator rows): `ownership` UX-025, UX-026, UX-027 (no owning WP) and AGT-011 `part:behaviour` (row above). Warnings from my files: `ruleset-unsourced` for the five new ruleset files above (not yet in BUILD_MAP WP-104). The other errors (`dangling` OPS-016, PRV-038, PRV-040, PRV-041, PRV-042; `ownership` SE-010/011/115/129, SEC-076..079, URL-015, MET-014) and the other warnings come from other fixers' files still being edited in parallel.
