# Resolution — programmatic-search — pass A — round 06

Inputs: `audit/rounds/06/concreteness-programmatic-search.md` (64 rows) and the 6 `spec-lint` warnings in `audit/rounds/06/lint.json` for these files (all `ruleset-unnamed`, all in search-engines.md). `P` = spec/packs/programmatic.md, `S` = spec/packs/search-engines.md (line numbers after this pass). Cross-file edits are in `xfile/from-programmatic-search.md` (X1–X11).

DECISIONS.md D-001..D-004 (budget exhaustion, cache keys, CSRF/SameSite, session lifetimes) cover nothing in these two files, so none applied here. `spec/CHANGES.md` is outside {FILES}; the orchestrator adds the CHANGES entries from this table.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-programmatic-search#1 | TPL-003, TPL-007 | fixed + xfile | P:173, P:243, P:246, P:250, P:256; X3 | Canonical machine value per type added after TPL-003, with `facts.<field>.attr`; live-mode item 1 now byte-equality against it; example line carries `attr`. 03 § 13 `attr` → X3. |
| concreteness-programmatic-search#2 | CNT-009 | adapted + xfile | P:189; X1, X2 | As instructed, the single hidden-content definition goes to 04 § 15 *Hidden content* (X1). CNT-009 cites it, and AEO-014 is pointed at it too (X2). Contrast < 1.1 is kept and ΔE 3 is dropped. The exemption list is the union of CNT-009's and AEO-014's (adds closed dialog/popover, carousel-markers, `<template>`, `<noscript>`). Added part `raw` (html channel) and an allowance for icon glyphs and < 30-word screen-reader text, the same allowance AEO-014 gives. Ownership: CNT-009 `owns` `AEO-014#hidden-text` and SE-123's hidden-link condition inside `<main>` of family/hub pages. |
| concreteness-programmatic-search#3 | LOC-001, LOC-003 | fixed + xfile | S:121-125; X4 | LOC-001 is now facts-oracle (`address`/`hours` → blocking `forbidden-value`, builder) and LOC-003 required-facts (blocking `missing-element`, operator, `business.json#/locations`). Merged with #41's applicability condition. Lists in 04 § 1.2 → X4. |
| concreteness-programmatic-search#4 | PCF-007 | fixed | P:138 | Ungenerated hub: nearest generated ancestor or `null`, breadcrumb entry dropped; part `members` (P0 · data, G2). |
| concreteness-programmatic-search#5 | DAT-001 | adapted | P:154-155 | Parts `types` and `types-import` as proposed. Generation is tied to the existing adapter codegen `types-from-policy` (02-adapters); an adapter without it gives `noAdapterSupport`. |
| concreteness-programmatic-search#6 | DAT-003/004, TPL-002, CNT-001/006/007 | adapted | P:196-201, P:181, P:187, P:158 | Row states added to § 4-0. YMYL was removed from the `thin` clause because DAT-012 already quarantines those rows, so there's no double classification. CNT-001 now reads "not quarantined + local facts + CNT-002"; the template clause is deleted (TPL-002 quarantines). CNT-007 text replaced. DAT-004 now cites the per-family/locale rate. |
| concreteness-programmatic-search#7 | DAT-008 | fixed | P:162 | |
| concreteness-programmatic-search#8 | DAT-012 | fixed | P:166 | Took the ruleset option (not the deletion option, which would weaken the rule): part `advice` (P0 · cfg, owner `operator` because the text is policy), ruleset `advice-patterns.json`. |
| concreteness-programmatic-search#9 | TPL-005, TPL-006 | fixed + xfile | P:175-176; X10 | Each rule is emitted from TPL-004 step 6a / step 8, and TPL-004 doesn't report the same page again. TPL-006 part `source-hint` (W · ast) is defined as field+literal concatenation in family route files. 04 § 11 cross-note → X10. |
| concreteness-programmatic-search#10 | `sourcedText`, CNT-002 | fixed | P:120, P:182 | Stop-word list named as ruleset `stop-words.json`. |
| concreteness-programmatic-search#11 | CNT-010 | fixed | P:190 | Uses the existing 04 § 15 *Visible dates*. |
| concreteness-programmatic-search#12 | DAT-014 | fixed | P:208 | Field treated as absent and listed in `quarantine.jsonl` without quarantining or counting toward DAT-004. Part `proper-nouns` (W · data). |
| concreteness-programmatic-search#13 | DAT-017 | fixed | P:215, P:86 | Missing demand value is treated as low; `onLow` enum also added to the policy comment. |
| concreteness-programmatic-search#14 | CRW-001 | fixed + xfile | P:232; X5 | 100-URL PRNG sample with warm-up; edge pass uses the 20-URL sample. The verify-env measurement is `skipped(slow-host)` per TR-111; the TR-111 and performance calibration lists → X5. |
| concreteness-programmatic-search#15 | family keys | fixed | P:140-146, P:59, P:84 | New § 1.3 Family keys. `localBusiness` changes from `requiredFields` (schema names) to a `fields` property→field map, and the policy example is updated. |
| concreteness-programmatic-search#16 | SE-001 | fixed | S:35 | The 404 case is part `missing` (W). Size is 512,000 bytes (= 500 KiB). |
| concreteness-programmatic-search#17 | SE-003 | fixed | S:37, S:12-13 | Value grammar added. The example's `bing` value now uses `meta:`, and legacy values are still accepted. `"dns"` → `skipped(dns-verification)`. |
| concreteness-programmatic-search#18 | SE-004 | fixed | S:38 | |
| concreteness-programmatic-search#19 | SE-006 | adapted | S:40 | "not meant for indexing" isn't decidable, so it wasn't used. Rule: a paired document carries canonical-to-HTML **or** `X-Robots-Tag: noindex`; an unpaired linked document with neither is part `unpaired` (W) for Operator confirmation. Document content types listed. |
| concreteness-programmatic-search#20 | SE-008 | fixed | S:42 | Parts `ua-reach` (W · edge) and `allowlist` (W · review); channel `review` added. |
| concreteness-programmatic-search#21 | SE-101 | fixed | S:48, S:82 | Parts `required`/`recommended`/`deprecated`/`unused`; § 4 path/`anyOf` grammar. |
| concreteness-programmatic-search#22 | SE-102 | fixed + xfile | S:49; X6, X9 | `web-delivery.siteAlternateName` declared via X6. |
| concreteness-programmatic-search#23 | SE-103 | fixed | S:50 | Parts `preview`, `image`, `clickbait`; ruleset `clickbait-patterns.json`; compared against the existing `web-delivery.defaultOgImage`. |
| concreteness-programmatic-search#24 | SE-104 | fixed | S:51 | |
| concreteness-programmatic-search#25 | SE-105 | fixed | S:52 | |
| concreteness-programmatic-search#26 | SE-109 | fixed | S:56 | Uses 04 § 15 *Hidden content* (X1). Browser channel added (rendered anonymous Chrome page) → ownership row below. |
| concreteness-programmatic-search#27 | SE-112 | adapted | S:59, S:58 | The proposed exclusion (`data-list` / own `itemscope`) only works on programmatic markup, so a shared **related-product cards** definition (SE-111) adds `<li>`/`<article>` cards that link to another URL of the same route group. State→value map and `stock-phrases.json` shape added. |
| concreteness-programmatic-search#28 | SE-113 | fixed + xfile | S:60; X7 | A missing or unparsable feed is a blocking `parse-error` owned by operator. 03 § 14 field list → X7. |
| concreteness-programmatic-search#29 | SE-114 | fixed + xfile | S:61; X7 | `agentic-feeds.json` shape defined; missing/unparsable path is a `parse-error` (operator); `.xml` in 03 § 14 → X7. |
| concreteness-programmatic-search#30 | SE-121 | fixed | S:65 | Parts `list`, `density`, `phones`; ruleset `stop-words.json`, `verbs.json`, Snowball (WP-104). |
| concreteness-programmatic-search#31 | SE-122 | fixed | S:66 | |
| concreteness-programmatic-search#32 | SE-123 | fixed + xfile | S:67; X1, X2 | Hidden per 04 § 15. SE-123 `owns` the hidden-link condition of `AEO-014#hidden-text`, except inside `<main>` of family/hub pages (CNT-009). Skip-link definition added. |
| concreteness-programmatic-search#33 | SE-124 | fixed | S:68 | |
| concreteness-programmatic-search#34 | SE-130..132 | adapted + xfile | S:74, S:76-78, S:20-21; X8, X9 | `facets.routes` added (no default, under 03 § 3.5 `facets.*`). Instead of the proposed plain `notConfigured`, probe bases fall back to crawled URLs that carry a facet parameter, and only when there are none is the rule `notConfigured(facets.routes)`. That keeps it from becoming an escape. `indexable` defined as parameter-name sets. 04 § 15 facet probes → X8. |
| concreteness-programmatic-search#35 | SE-203, SE-302, SE-403, SE-601, SE-602 | adapted | S:88, S:95, S:101, S:116, S:117 | SE-203 tombstone. SE-302 now only checks size. SE-403 drops the URL-004 clause, so its headline severity is now W: the only check left was already W. SE-601 is now W · cfg (IndexNow enabled with seznam); SeznamBot access is owned by SE-002 at P0, so nothing is weakened. SE-602 is a **tombstone**: both of its clauses are owned elsewhere (SE-002; IDX-008 lists Applebot-Extended in `ai-agents.json`), and a P1 rule that emits nothing can't be fixtured (C9). |
| concreteness-programmatic-search#36 | SE-301 | fixed | S:94 | Ruleset `tracking-param-expansions.json`. "Session ids" dropped (no `sessionParams` key; Operator may add one later). |
| concreteness-programmatic-search#37 | SE-402 | fixed | S:100 | Part `shared-image` (W). |
| concreteness-programmatic-search#38 | SE-501 | fixed | S:108 | Ruleset `china-blocked-hosts.json`. |
| concreteness-programmatic-search#39 | SE-501/502/504 | fixed | S:106, S:109 | Chinese-locale pages defined; one `baidu` condition for SE-501..504. |
| concreteness-programmatic-search#40 | LOC-001 | fixed | S:127 | Ruleset `postal-patterns.json` (libaddressinput). `hours` now applies on every indexable page. Also excluded text inside programmatic `data-fact` elements (dataset oracle, TPL-003), so directory families aren't judged against `business.json`. |
| concreteness-programmatic-search#41 | LOC-001 vs UX-003 | fixed | S:121, S:127 | Preamble uses UX-003's condition; LOC-001 `owns` `UX-003#phones` stated in the rule. |
| concreteness-programmatic-search#42 | PCF-003 | fixed | P:134 | Points to web-delivery § 6 *Allowed types by surface*. |
| concreteness-programmatic-search#43 | PCF-001, ROL-003 | fixed | P:132, P:225 | Parts `hub-constant` (P0 · data) and `evidence` (P0 · data); ROL-003 channels `cfg, data`. |
| concreteness-programmatic-search#44 | DAT-001 | fixed | P:153 | Unknown key → quarantined; aiText siblings referenced to 04 § 15 *aiText provenance*. |
| concreteness-programmatic-search#45 | CRW-002 | fixed | P:233 | |
| concreteness-programmatic-search#46 | TPL-007 | fixed | P:177 | |
| concreteness-programmatic-search#47 | CNT-005, CNT-012 | fixed | P:185, P:217 | |
| concreteness-programmatic-search#48 | KW-003 | fixed | P:216 | Stop words also named (`stop-words.json`). |
| concreteness-programmatic-search#49 | inventory example | fixed | P:256 | `type`, `tokens`, `wave` (and `attr`, #1) added. |
| concreteness-programmatic-search#50 | DAT-009 | fixed | P:163 | |
| concreteness-programmatic-search#51 | ROL-002 | fixed | P:224 | |
| concreteness-programmatic-search#52 | DAT-007 | fixed | P:161 | |
| concreteness-programmatic-search#53 | SE-106 | fixed | S:53 | |
| concreteness-programmatic-search#54 | SE-107 | fixed | S:54 | |
| concreteness-programmatic-search#55 | SE-110 | fixed | S:57 | "near the headline" made concrete as "within 200 characters after the `<h1>`" (the 04 § 15 *Visible dates* window). |
| concreteness-programmatic-search#56 | SE-125 | fixed | S:69 | |
| concreteness-programmatic-search#57 | SE-202 | fixed | S:87 | |
| concreteness-programmatic-search#58 | SE-204 | fixed | S:89 | |
| concreteness-programmatic-search#59 | SE-503, SE-504 | fixed | S:106, S:110-111 | `baidu` condition via the § 8 preamble. |
| concreteness-programmatic-search#60 | SE-505 | fixed | S:112 | |
| concreteness-programmatic-search#61 | SE-007 | fixed | S:41 | Parts `uri` (html), `hash-router` (ast). |
| concreteness-programmatic-search#62 | SE-002 | fixed | S:36 | |
| concreteness-programmatic-search#63 | CNT-011 | fixed | P:211 | |
| concreteness-programmatic-search#64 | SE-111 | fixed | S:58 | Uses the shared related-product cards definition (see #27). |
| lint.json ruleset-unnamed search-engines.md:3 | § intro | fixed | S:3 | Names `rules/features/<engine>.json`. |
| lint.json ruleset-unnamed search-engines.md:47 | SE-101 | fixed | S:48 | Names ruleset `rules/features/google.json` (already sourced in WP-104). |
| lint.json ruleset-unnamed search-engines.md:49 | SE-103 | fixed | S:50 | Ruleset `clickbait-patterns.json` (see Ruleset data). |
| lint.json ruleset-unnamed search-engines.md:64 | SE-121 | fixed | S:65 | Ruleset `stop-words.json`, `verbs.json` (see Ruleset data). |
| lint.json ruleset-unnamed search-engines.md:77 | § 4 heading | fixed | S:80 | Heading renamed "Feature tables (`rules/features/<engine>.json`)". |
| lint.json ruleset-unnamed search-engines.md:79 | § 4 | fixed | S:82 | "ruleset bumps" changed to "new ruleset releases". Files named `rules/features/{google,bing,naver}.json`. |

## Ownership rows
```
PCF-001	part:hub-constant	WP-502	new part (data channel, G2)
PCF-007	part:members	WP-502	new part (data channel, G2)
DAT-001	part:types	WP-502	new part; uses adapter codegen types-from-policy
DAT-001	part:types-import	WP-502	new part (W · ast detector)
DAT-012	part:advice	WP-502	new part (cfg; ruleset advice-patterns.json)
TPL-006	part:source-hint	WP-504	new part (W · ast)
CNT-009	part:raw	WP-504	new part (html channel)
DAT-014	part:proper-nouns	WP-505	new part (W)
ROL-003	part:evidence	WP-104	new part (data channel, G2); follows ROL-003's current WP
SE-001	part:missing	WP-411	new part (W)
SE-006	part:unpaired	WP-411	new part (W)
SE-007	part:uri	WP-411	new part
SE-007	part:hash-router	WP-411	new part (ast)
SE-008	part:ua-reach	WP-414	new part (edge)
SE-008	part:allowlist	WP-414	new part (review channel added)
SE-101	part:required	WP-411	new part
SE-101	part:recommended	WP-411	new part (W)
SE-101	part:deprecated	WP-411	new part (W)
SE-101	part:unused	WP-411	new part (W)
SE-103	part:preview	WP-104	new part; follows SE-103's current WP
SE-103	part:image	WP-104	new part
SE-103	part:clickbait	WP-104	new part (W)
SE-109	channel:browser	WP-608	new channel (rendered anonymous Chrome); clears the channel-infra warning
SE-121	part:list	WP-104	new part; follows SE-121's current WP
SE-121	part:density	WP-104	new part
SE-121	part:phones	WP-104	new part
SE-402	part:shared-image	WP-411	new part (W)
```
SE-203 and SE-602 are now tombstones. Their existing `*` rows can stay, as SE-205's does. SE-601's channel changed from `http` to `cfg` (still WP-411).

## Ruleset data
- `stop-words.json` (per locale): WP-104 main row, the "stop words, verb lists and a pinned Snowball stemmer per locale" item. Name it there. Used by § 1.1 `sourcedText`, DAT-014, KW-003, SE-121.
- `verbs.json` (per locale): same WP-104 item (SE-121 `list`).
- `clickbait-patterns.json` (per-locale regexes): WP-104 main row, "clickbait patterns (SE-103)". Name it there.
- `china-blocked-hosts.json`: WP-104 main row, "China-blocked host list (SE-501)". Name it there.
- `advice-patterns.json` (per locale): WP-104 coverage-audit "Content checks" bullet (DAT-012 `advice`).
- `postal-patterns.json` (libaddressinput `zip` regexes per country): WP-104 "Content checks" bullet (LOC-001 `address`).
- `tracking-param-expansions.json`: WP-104 "Crawlers and agents" bullet (SE-301).
- Existing files whose shape is now defined here: `stock-phrases.json` (SE-112) and `agentic-feeds.json` (SE-114). Already sourced.

## Policy keys added (key · type · default · file)
- `search-engines.facets.routes` · URL pattern[] · no default (`facets.*`, 03 § 3.5) · search-engines.md (03 § 3.5 note → X9)
- `web-delivery.siteAlternateName` · string \| null · `null` · web-delivery.md (→ X6, X9)
- `programmatic.families[].localBusiness` · shape changed to `null` \| `{ fields: { streetAddress, addressLocality, postalCode, addressCountry, telephone? } }` · `null` · programmatic.md § 1.3
- Enums documented for existing keys: `families[].indexation` / `hubs[].indexation` `"index"|"noindex"`; `demand.onLow` `"omit"|"noindex"`; `prebuild` `"all"|{ top }`; `retired` JSONL row shape; `search-engines.verification.*` value grammar.

## spec-lint (after this pass)
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":142,"errors":5,"warnings":74}
  errors by check: ownership=5
  warnings by check: ruleset-unsourced=69 channel-infra=5
```
None of the 5 errors is in these files. They are AGT-006 `channel:html`, REF-014, SEC-067, UX-022 and CQ-010 ownership, all from other groups' parallel edits. In these files:
- No `ruleset-unnamed` warnings are left (all 6 fixed).
- Expected `ruleset-unsourced` warnings: `stop-words`, `verbs`, `advice-patterns`, `clickbait-patterns`, `tracking-param-expansions`, `china-blocked-hosts`, `postal-patterns`. They clear when the orchestrator names them in BUILD_MAP WP-104.
- Expected `channel-infra`: SE-109 browser. It clears with the SE-109 `channel:browser` → WP-608 row above.
