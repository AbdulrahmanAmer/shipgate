# Resolution — programmatic-search — pass A — round 08

Files owned: `spec/packs/programmatic.md` (P), `spec/packs/search-engines.md` (S). Line numbers are after this pass's edits. Settled decisions applied: round-07 passB-notes items 1, 2 and 4 (page locale and indexable page cited from 04 § 15, Operator-owned sources cited from 03 § 8). Cross-file requests: `audit/rounds/08/xfile/from-programmatic-search.md` (X1–X9).

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-programmatic-search#1 | § 6, TPL-003, PCF-002, DAT-018 | adapted | P:130, P:136, P:183, P:222, P:253, P:280 | All five parts applied. **TPL-008** added with parts `facts`, `h1`, `robots`, `tokens`. Changes from the proposed text: (a) `h1` checks only the text, because MET-003 already owns "exactly one `<h1>`"; (b) `robots` checks only that `noindex` is present when the oracle says `noindex`, because MET-006 (1) already owns its absence on indexable pages (otherwise the same page would be judged twice); (c) `tokens` covers family pages only (hub lines have no `tokens`) and checks the row-field tokens of `h1Template` inside the `<h1>`. Owner WP-504 (TPL family, oracle comparison), not WP-505 as proposed: WP-505 is AI-text/demand. Added to the § 7 fixture-pass list. |
| concreteness-programmatic-search#2 | SE-132 | adapted | S:96 | Tested-URL set as proposed. Two additions: the URL must be on a `facets.routes` path (any path when that key is unset), and "non-default" means a value other than its `facets.defaults` value. The `noindex` check reuses the MET-006 directive set for `googlebot`. With no tested URL the result is `notApplicable`, except in the § 3.3 skip case (#16). |
| concreteness-programmatic-search#3 | KW-003 | adapted | P:140, P:224 | `targetQueryTemplate` added to the PCF-006 copy keys. KW-003 rewritten and the procedure named **KW-003 normalisation**, because AEO-004 cites it. Additions: (a) "target pages" = eligible rows (released or not, matching § 4-0's "all eligible rows" for cannibalisation) of `indexation: "index"` families that DAT-017 does not serve `noindex`, plus `targets` entries; (b) locales with no Snowball stemmer are not stemmed; (c) `targets` entries with the same `url` count as one page. |
| concreteness-programmatic-search#4 | PCF-005, PLK-001 | adapted | P:139 | *Related candidates* added. Changes from the proposed text: the candidate set excludes only rows that DAT-017 serves `noindex`, not "not in sitemaps", because under that wording an `indexation: "noindex"` family would get no related links at all. `same-group` candidates must share the row's field value. Orders cite 04 § 11 *Relations* (X9 adds a pointer back). |
| concreteness-programmatic-search#5 | PCF-007, TPL-004, PLK-001 | adapted | P:257 | *Hub items* added in § 6. Items are counted per locale, matching consistency#99 (hub line `locale`) and TPL-004 "per hub id and locale". X8 adds a pointer from 03 § 13. |
| concreteness-programmatic-search#6 | LOC-001 | fixed | S:145 | Phone candidates now come from UX-003 *Candidates*. Merged with consistency#37: `legal.host.phone` and `legal.grievanceOfficer.phone` added. The `factsIgnore` exclusion was already in the rule ("Candidates of parts `phones`, `address` and `hours` are taken outside `ux.factsIgnore` regions"), so it is not repeated. |
| concreteness-programmatic-search#7 | ROL-004 | fixed | P:234 | Proposed text applied. The reference time is cited as 04 § 15 *Reference time*. |
| concreteness-programmatic-search#8 | SE-121 | fixed | S:75 | Split into part `density` (P1) and part `density-short` (W). Ownership row `SE-121 * WP-411` already covers both. |
| concreteness-programmatic-search#9 | PLK-001 | adapted | P:248 | Part `short` (W) added, and the comparison is defined: normalised pathnames, order ignored. Change from the proposed text: breadcrumb and hub links may be anywhere in `<body>` (breadcrumbs normally sit in a `<nav>` outside `<main>`); related links must be inside `<main>`; a `{self}` breadcrumb entry is excluded. |
| concreteness-programmatic-search#10 | CNT-003, CNT-004, DAT-005 | fixed | P:164, P:189, P:190 | Failure classes and evidence added as proposed. |
| concreteness-programmatic-search#11 | DAT-005 | fixed | P:164 | `(family, locale, id)` added. |
| concreteness-programmatic-search#12 | PCF-004 | fixed + xfile | P:63, P:138, P:150; X5 | `priorityField` default `null` added to § 1.3. PCF-004 now says "`null` (the default)". The example comment points to § 1.3. The 03 § 3.5 cell is requested in X5. |
| concreteness-programmatic-search#13 | PCF-002, PCF-004 | fixed | P:138 | `minLocalFacts` moved out of the "≥ 1" list and set to "an integer ≥ 3 (PCF-002)". |
| concreteness-programmatic-search#14 | DAT-006 | fixed | P:165 | Applied as proposed. |
| concreteness-programmatic-search#15 | SE-105 | fixed | S:60 | License clause deleted; it now points to SE-101 / `image-metadata`. |
| concreteness-programmatic-search#16 | SE-130..132 | fixed | S:92 | `skipped(no-facet-urls)` sentence added to § 3.3. |
| consistency#21 | live-mode oracle | adapted + xfile | P:63, P:261; X6, X7 | § 6 *live* now uses only `family.snapshot { db, sql }`, run in the read-only stage. `commands.snapshot` is never an oracle source. A live-mode family without `family.snapshot` is a CFG-001 finding, matching the 01 CFG-001 text another fixer already applied. Snapshot ownership cites 03 § 8 and 04 § 4.2 step 5 instead of restating them (passB-notes #4). Rows that are not Operator-owned give one blocking `missing-element` per family, owned by `operator`. The 04:406 and 01:133 halves belong to their own fixers. X6 aligns the 03 § 8 outcome sentence; X7 covers 03 `commands.snapshot`. |
| consistency#37 | LOC-001 `phones` ↔ PRV-030/033 | fixed | S:145 | search-engines half applied, together with concreteness#6. The ux.md half belongs to the ux fixer. |
| consistency#52 | indexable item 5 ↔ hub pagination | rejected (no edit in my files) | — | The edits are in 04:467 and web-delivery:153, both named in the row's Location, so their fixers apply them. programmatic.md:106 (`pagination.style: "query"`, `param`) already supplies the key the fix reads. Nothing in my files contradicts the fix. |
| consistency#53 | indexable set ↔ discontinued products | rejected (no edit in my files) | — | The edits are in 04:466 and web-delivery:122/130. SE-112 `discontinued` ("answer … a 301 or 308 in one hop to it, else 410") already matches the fixed RTE-004 row. |
| consistency#54 | complete crawl ↔ CRW-004 | fixed | P:244 | Programmatic half applied. Wording: "counts toward `incomplete-crawl` … unless it was discovered only through `a[href]` with `rel~=nofollow` or is disallowed for Googlebot". This matches the 04:374 replacement exactly; "(and only a trap hit)" was dropped, because it would also exempt drops found from non-indexable pages, which 04's text still counts. The 04 half belongs to the algorithms fixer (X2 adds CRW-004 to the robots.txt users list). |
| consistency#55 | `AEO-014#hidden-text` two owners | fixed | S:64 | SE-109 half applied as proposed. The AEO-014 half belongs to the answer-engines fixer. |
| consistency#56 | `tracking-param-expansions.json` shape | rejected (no edit in my files) | — | SE-301 already reads `{ "<entry ending in *>": [param…] }` and requires every name, which is the shape the fix gives web-delivery. Only web-delivery changes. |
| consistency#58 | review answers ↔ `review.json` | fixed | S:148, P:222 | LOC-004 now uses `{ rule: "LOC-004", target: "<location id>@<engine>", result, note }`, with `skipped(no-review)` when unanswered. Added: a `fail` answer is a W finding. DAT-018 target is `source:<id>`. The 03:535 `auditTargets` half belongs to the formats fixer. |
| consistency#60 | fixture pass ownership | rejected (orchestrator's) | — | BUILD_MAP and ownership.tsv edits are the orchestrator's (passB-notes #5). programmatic.md:278 (§ 7 *Fixture pass*) needs no change. |
| consistency#95 | indexable item 3 ↔ hubs | rejected (no edit in my files) | — | The edit is in 04:465. PCF-007 already defines hub generation ("a hub with fewer released eligible members than `minMembers` is not generated (404)"), which is what the fix cites. |
| consistency#96 | CNT-006 channel → gate | fixed | P:192 | `content` changed to `data` (G2): the row state shapes the inventory and the DAT-006 probes. The ownership row `CNT-006 * WP-504` is not channel-scoped, so it does not change. |
| consistency#97 | "page language" ↔ page locale | adapted | S:105, S:119, S:124 | SE-202 and SE-403 fixed as proposed. The same defect in the SE-501..504 *Chinese-locale pages* definition ("pages whose locale has language `zh`") was fixed the same way. |
| consistency#98 | PRF-016 owner mirror | rejected (no edit in my files) | — | The edit is in performance.md:49. CRW-001 already says "Family and hub pages", which is the side the fix aligns to. |
| consistency#99 | hub line locale / sort | rejected (no edit in my files) | — | The edits are in 03:441/444 and 04:470; the 03 `locale` is already applied (03:456). The new programmatic § 6 *Hub items* is per locale, consistent with it. |
| consistency#100 | `facets.*` default | rejected (no edit in my files) | — | The edit is in 03:122. search-engines § 1/§ 3.3 already give `facets.indexable` default `[]`, the side the fix keeps. |
| coverage-visibility#1 | SE-010 (Must) | adapted + xfile | S:37, S:45; X1, X2 | Added with parts `decision` (P0), `unsupported` (P1), `unknown-field` (W) and `crawl-delay` (W). **Correction to the proposal:** Google's crawler table gives `Googlebot-Image`, `Googlebot-Video` and `Googlebot-News` the token `Googlebot` as a fallback, and its robots.txt spec example sends Googlebot Images to the `googlebot` group, not to `*`. As proposed ("own group, else `*`"), a site with a `Googlebot` group that allows everything and a `*` group blocking `/images/` would get a false P0. The ruleset entry therefore gained `fallbackTokens`, and the *Token decision* is: own group → first fallback that has a group → `*`. `Storebot-Google` has no fallback, as the gap's evidence says. The proposal's W "any other field" became the separate part `unknown-field`, so `unsupported` keeps a single severity (C5). SE-002 now ends with a pointer. |
| coverage-visibility#2 | SE-129 (Must) | adapted + xfile | S:84; X3, X4 | Added with parts `entries` (P0), `back` (P0), `dialog` (W) and `source-hint` (W). Changes: with no origin page, A is a `data:text/html` page opened first, not `about:blank` (Chromium replaces the initial `about:blank` entry, so `back` would always fail); the origin page is the first crawl page whose `a[href]` yielded P (X3 has the crawler record it); `source-hint` reads an adapter `historyApis` list (X4, 03 § 6). |
| coverage-visibility#5 | SE-115 (Should) | adapted | S:70 | Added with parts `expired` (P1), `order` (P1) and `source` (W). `source` is channel html (both its inputs, page and feed, are read at G4). Edge part as proposed, on the wall clock. "Oracle `schema.values` of a family page" was dropped as a source, because PCF-003 never puts these properties there. |
| coverage-visibility#6 | SE-011 (Should) | adapted + xfile | S:50; X1, X2 | Added with parts `access` (P1) and `health` (W). Hosts are selected by `assets` in `purposes` (the real 03 § 3.3 key is `purposes[]`, not `purpose`). Service-origin hosts are excluded (SE-002/SE-010 own them). A 404 robots.txt passes. Without `edge.production` the edge pass is `notApplicable`. The 12-hour remark was dropped as non-normative. |

## Ownership rows
```
TPL-008	*	WP-504	explicit (R08: page equals oracle — facts/h1/robots/tokens; html)
SE-010	*	WP-411	explicit (R08: auxiliary crawler tokens; ruleset engine-crawlers.json WP-104)
SE-011	*	WP-411	explicit (R08: resource-host robots.txt, local half)
SE-011	channel:edge	WP-414	explicit (R08: resource-host robots.txt in the edge pass)
SE-115	*	WP-411	explicit (R08: Offer validity dates)
SE-115	channel:edge	WP-414	explicit (R08: part `expired` on production)
SE-129	*	WP-608	explicit (R08: back-button hijacking, browser parts)
SE-129	part:source-hint	WP-411	explicit (R08: ast hint; adapter `historyApis`)
```

## Ruleset data
- `engine-crawlers.json` — WP-104, coverage-audit data list: `[{ engine, token, fallbackTokens: [token…], covers: [images|favicons|video|news|shopping], appliesWhen: "always"|"news.enabled"|"feature:<name>", docUrl, checkedOn }]`. Shape test: every entry has `docUrl` and `checkedOn`; Yandex/Baidu `fallbackTokens` taken from `docUrl` (SE-010, SE-011).

## Policy keys added (key · type · default · file)
- None new. Default made explicit: `programmatic.families[].priorityField` · declared field name | `null` · `null` · programmatic.md § 1.3 (03 § 3.5 cell: X5).
- New adapter manifest key (not policy): `historyApis` · ApiRef[] · `[]` · 03 § 6 (X4).
- New skip reasons used: `skipped(no-facet-urls)` (SE-130..132), `skipped(no-indexing-export)` (ROL-004), `skipped(robots-unavailable)` (SE-010), `skipped(external-host)` (SE-011), `skipped(no-review)` (LOC-004, already used in 04).

## spec-lint (`node tools/trace/spec-lint.mjs`, exit 1)
```
spec-lint: {"requirements":570,"rules":551,"toolRequirements":19,"rulesWithParts":197,"errors":24,"warnings":62}
  errors by check: dangling=2 ownership=22
  warnings by check: ruleset-unsourced=59 ruleset-unnamed=3
```
Errors and warnings from my files, all expected (the orchestrator has not added the rows yet):
- `ERROR [ownership]` SE-010 (S:45), SE-011 (S:50), SE-115 (S:70), SE-129 (S:84), TPL-008 (P:183) — "has no owning work package"; rows above.
- `WARN [ruleset-unsourced]` S:45 `engine-crawlers.json` — Ruleset data above.
The remaining errors (dangling PRV-0xx / OPS-016, other fixers' new IDs without ownership) and warnings come from other fixers' files mid-edit, not from {FILES}.
