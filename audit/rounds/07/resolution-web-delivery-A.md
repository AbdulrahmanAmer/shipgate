# Resolution — web-delivery — pass A — round 07

File edited: `spec/packs/web-delivery.md` (line numbers below are after the edits). Cross-file edits: `audit/rounds/07/xfile/from-web-delivery.md` (6 entries). Before writing xfile entries, the target files were re-read: rows whose cross-file side had already been applied in pass A by that file's own fixer are marked "already applied", with the line.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-web-delivery#1 | all "indexable" rules | adapted | web-delivery.md:70, :62 (WCF-006) | The algorithms fixer had already added the same definition as 04 § 15 *Indexable page* ("the only definition"). § 2 now points to it instead of keeping a second copy. It also says that only Operator config and shipgate requests decide, and that noindex, robots and canonical never remove a URL. WCF-006 ties now count `staticPaths` and `privacy.legalPages` entries. |
| concreteness-web-delivery#2 | SCH-006, SCH-010, TRS-002, MET-011, URL-012 | adapted | :74; :220 (SCH-006), :224 (SCH-010), :296 (TRS-002) | Defined for raw HTML and for the browser. Adapted: the verified 04 § 15 disclosure exemption **is** applied (in raw HTML, disclosure candidates by markup, items 1–4, count as visible). Without it, prices or FAQ text in legitimate tabs and accordions would fail SCH-006, and that would contradict CNT-009 and AEO-014. The exemption is verified by activation, which is shipgate's own observation (C10 holds). The 3 rules gained channel `browser`. |
| concreteness-web-delivery#3 | HTTP sample | xfile | xfile §1; :72 | 04 § 10 gets the HTTP sample and browser-sampled definitions. The pack-local meaning of "public pages" is at :72. |
| concreteness-web-delivery#4 | MET-007, I18-002, I18-003 | fixed | :15-16 (`localePrefix`, `localePaths`), :54, :58 (WCF-002), :175 (MET-007), :268 (I18-002) | The locale segment is defined in § 1. The page locale is defined in 04 § 15 *Page locale* (algorithms fixer), which reads this segment. MET-007 now compares exactly after case folding. No 03 § 3.5 entry is needed: by the 03 § 3.5 convention, the key shown in the pack block is its default. |
| concreteness-web-delivery#5 | WCF-003, WCF-004 | fixed | :59, :60; xfile §5 | WCF-004 value ranges for every listed key, plus `leakIgnore` and `reviewSources`. WCF-003 compares named `config` settings; their standard names go to 03 § 6 by xfile. |
| concreteness-web-delivery#6 | SCH-003, SCH-004 | adapted | :41, :196, :200, Product row in SCH-004 table | The `reviewSources` shape is `{pattern, ratingsSource}`, and AggregateRating values must equal `business.json` `ratings[]`. Adapted: instead of banning individual `Review` nodes, they are allowed only when they pass UX-014 `testimonials` (Operator-owned `testimonials[]`) and carry no `reviewRating`. UX-014 already validates JSON-LD `Review` nodes, so a ban would contradict it. Every failure is `forbidden-value`, never `notConfigured`. |
| concreteness-web-delivery#7 | RTE-004 | fixed | :130 | Part `soft-404` covers which responses are tested, the union with `soft404Phrases`, and the finding evidence. |
| concreteness-web-delivery#8 | RTE-001 | fixed | :110 | Capture moment and viewport. |
| concreteness-web-delivery#9 | RTE-003 | adapted | :112 | Made a tombstone (`lifecycle: deprecated`). Adapted: its ownership row is **kept**. spec-lint makes "has no owning work package" an error for every defined ID, and CQ-004 is a tombstone that keeps its row. |
| concreteness-web-delivery#10 | RTE-004, RTE-006 | fixed | :130; xfile §2 | `{n}` is derived from the lock digest. The 04 § 15 fallback body uses the same `{n}`. |
| concreteness-web-delivery#11 | RTE-005 | fixed | :131 | Traps are named by `guards` (02 § 5 / 03 § 5 term). The http half uses the RTE-006 probe. Single-report rule with RTE-006. |
| concreteness-web-delivery#12 | RTE-006 | fixed | :132 | One param at a time. Added `skipped(closed-set)` and `skipped(no-valid-sample)`. |
| concreteness-web-delivery#13 | RTE-008, MET-001, URL-004 | fixed | :134; :170 | Also changed MET-002 so it no longer judges duplicate descriptions ("duplicates: RTE-008"), which keeps a single owner. |
| concreteness-web-delivery#14 | RTE-009 | fixed | :135 | |
| concreteness-web-delivery#15 | RTE-010 | fixed | :136 | The paywall removal now depends on the Operator's `search-engines.features` containing `paywalled-content`. AEO-014 already mirrors the condition (answer-engines.md:45). |
| concreteness-web-delivery#16 | RTE-011, I18-006 | fixed | :137, :272; xfile §4 | Parts `clock` and `random`; I18-006 is decided by argument roles. `randomApis` and the formatter roles go to 03 § 6 by xfile. |
| concreteness-web-delivery#17 | RTE-012 | fixed | :138 | Compares responses on the `preview-20` sample and reports the first differing URL. |
| concreteness-web-delivery#18 | URL-001 | fixed | :153 | Observation, components and failure class. Merged with consistency#43. |
| concreteness-web-delivery#19 | URL-002 | fixed | :154; :158 (URL-006 mirror) | 3 probes enumerated. Further variants go to the new URL-014. |
| concreteness-web-delivery#20 | URL-004, URL-005, MET-006, IDX-012 | fixed | :156, :157, :125 (RTE-004 table), :259 (IDX-012) | The noindex branch is removed. Expected-canonical table added. Site-search results carry no canonical. |
| concreteness-web-delivery#21 | URL-005 | fixed | :157 | Probes and `contentParams` modes. `tracking-param-expansions.json` is already listed in BUILD_MAP. Its shape is at :76, and an unlisted glob falls back to `source`. |
| concreteness-web-delivery#22 | URL-006 | fixed | :158 | |
| concreteness-web-delivery#23 | URL-007 | fixed | :159 | New part `format`. |
| concreteness-web-delivery#24 | URL-009, URL-012, URL-013, IDX-001 | fixed | :161, :163, :164, :239 | IDX-001 is the single owner of sitemap membership. |
| concreteness-web-delivery#25 | MET-001, MET-002, MET-004 | fixed | :169, :170, :172 | |
| concreteness-web-delivery#26 | MET-006 | adapted | :174 | Adapted: the proposed "index:false or RTE-004 noindex → no `nofollow`" would contradict the RTE-004 rows that require `noindex,nofollow` (`app` authenticated, non-production). Clause (2) therefore covers only public `indexRules` `index: false` pages. The other Robots cells are assigned explicitly to IDX-005, IDX-006, IDX-007, IDX-012, URL-012 and URL-013. |
| concreteness-web-delivery#27 | MET-008 | fixed | :27, :176, :60 (WCF-004); xfile §3 | `leakIgnore` is signed policy, and `data-shipgate-ignore` no longer has any effect. |
| concreteness-web-delivery#28 | MET-013 | fixed | :191 | `generic-titles.json` named, with a tie-break. |
| concreteness-web-delivery#29 | SCH-011 | fixed | :225 | Parts `vocabulary` (P1), `domain` (W) and `format` (P1). |
| concreteness-web-delivery#30 | LNK-003 | fixed | :231 | Raw-HTML graph. Failure classes `orphan` and `budget-exceeded`. |
| concreteness-web-delivery#31 | LNK-005 | fixed | :233 | |
| concreteness-web-delivery#32 | IDX-004 | fixed | :242 | |
| concreteness-web-delivery#33 | IDX-009 | fixed | :256 | |
| concreteness-web-delivery#34 | LNK-007, IDX-003 | fixed | :235, :241 | IDX-003 without git: `future` is `skipped(no-git)`, `build-time` runs on the instants alone, and `oracle` is unaffected. |
| concreteness-web-delivery#35 | ruleset shapes | fixed | :76 | Also covers `search-agents`, `ai-agents`, `tracking-param-expansions`, `default-documents`, `load-more-labels` and `placeholder-handles`. |
| concreteness-web-delivery#36 | CQ-005 | fixed | :284 | |
| consistency#9 | MET-011, IDX-008 parts | fixed | :179, :246 | Both part lists are now in the `Parts \`a\`, …` form (verified with `extractParts`). The ownership.tsv row change (`MET-011 part:dead-anchor WP-608`) is for the orchestrator; see Ownership rows. |
| consistency#12 | CQ-010 fetch-store writer | rejected (orchestrator's) | — | The whole fix is in BUILD_MAP (WP-306, WP-803, WP-501 and the section table). The brief says rows targeting BUILD_MAP belong to the orchestrator. CQ-010 text needs no change. |
| consistency#28 | RTE-010 cloaking scope | fixed | :136 | Head, robots, canonical, hreflang and JSON-LD comparison added. The AEO-014 side is already applied (answer-engines.md:45 "hreflang pairs and JSON-LD `@type` and property-name sets, compared as in RTE-014"). |
| consistency#41 | SCH-003 allowed types | fixed | :195 | Feature `schemaTypes` and nested value types added. A deprecated feature's node is judged only by SE-101 `deprecated`. |
| consistency#42 | URL-004 vs SE-111 | fixed | :156 | |
| consistency#43 | URL-001 query | fixed | :153 | `variantParams` and `facets.indexable` added (via 04 § 15 *Indexable page* item 5). |
| consistency#44 | noindex search URL canonical | fixed | :156, :157, :125 | URL-005 no longer has a noindex branch, so only site search is excepted. |
| consistency#45 | SE-105 vs MET-005 | rejected (already fixed) | search-engines.md:53 | "images referenced as `og:image` (except a URL equal to `web-delivery.defaultOgImage`)". No web-delivery change needed. |
| consistency#46 | 04 § 2 HEAD vs MET-005 `fetchers` | rejected (already fixed) | 04-algorithms.md:134 | "GET for the social preview fetcher user agents on the homepage (MET-005 `fetchers` part, which compares `og:*` values from the body)". |
| consistency#47 | IDX-011 precondition | fixed | :258 | |
| consistency#50 | LNK-001 vs MET-011 `dead-anchor` | fixed | :229 | |
| consistency#53 | IDX-003 vs AEO-012 | fixed | :241 | |
| consistency#54 | CNT-005 vs CQ-002 | fixed | :281 | Mirror added. CNT-005 is already applied (programmatic.md:188 "…when at least one of the two is a family or hub page (other pairs: CQ-002)"). |
| consistency#56 | RTE-014 ownership | rejected (orchestrator's) | — | trace/ownership.tsv and the WP-608 text belong to the orchestrator. RTE-014 text is unchanged (`html, http`). |
| consistency#57 | UX-005 cross-reference | rejected (already fixed) | ux.md:36 | "(`/sg-{n}` and `/{p}/sg-{n}`, web-delivery RTE-004)". |
| consistency#58 | IDX-005 preview pass | fixed | :243 | `preview-edge` now uses the homepage and `robots.txt`, which matches 04-algorithms.md:137. |
| consistency#59 | RTE-004 preview row | fixed | :130 | 04:132 already reads "RTE-004 `status`". |
| consistency#60 | SE-122 vs RTE-010 | fixed | :136 | RTE-010 states that it owns UA-dependent HTTP redirects. SE-122 is already applied (search-engines.md:67). |
| consistency#63 | SE-501 vs RTE-001 | fixed | :110 | Mirror added. SE-501 is already applied (search-engines.md:111, SE-501 `owns` `RTE-001#main`). |
| consistency#64 | SE-502 vs MET-007 | fixed | :175 | Mirror added. SE-502 is already applied (search-engines.md:112). |
| consistency#66 | soft404Phrases merge | fixed | :130 | Union stated in the RTE-004 `soft-404` part. 04 § 15 *Per-locale lists* already states the union. |
| consistency#67 | I18-007 `lingua` sourcing | rejected (orchestrator's) | — | The fix is in BUILD_MAP WP-102. |
| consistency#68 | `remote` metadata | fixed | :133 | RTE-007 states `remote: write`. 04-algorithms.md:487 already lists "every fault rule (RTE-007, RES-\*) … are `write`". The 03 `parts.remote` side belongs to the formats fixer. |
| consistency#98 | RES-001 vs RTE-007 | fixed | :133 | RES-001 is already applied (resilience.md:21 "API surface (pages: RTE-007)"). |
| consistency#99 | RES-003 vs RTE-007 | fixed | :133 | RES-003 is already applied (resilience.md:23, `fault-20` additions). |
| consistency#133 | AEO-001..004 cross-refs | rejected (already fixed) | answer-engines.md:30 | AEO-002 "share, per origin, one `@id` (`{origin}/#organization`, SCH-001)". The row needs no web-delivery edit (SCH-001 :198 already defines `{origin}/#organization`). |
| consistency#135 | CQ-010 cross-reference | fixed | :289 | |
| coverage-visibility#1 | RTE-016 head integrity (Must) | fixed | :142 | 4 parts. Adapted details: a non-whitespace text token in the head counts as invalid, SVG `<title>` is excluded, and the 2 parts never report the same element twice. |
| coverage-visibility#2 | RTE-017 click-only content | adapted | :149 | Scoped to controls inside `<main>`. `absent-in-raw` compares against raw `<body>` text, because content outside `<main>` would otherwise false-fire. Dialogs, popovers and carousels are exempt as proposed. Part `button` added. New ruleset `load-more-labels.json`. |
| coverage-visibility#4 | URL-014 path variants | adapted | :165; xfile §6 | Adapted: a 200 with the correct canonical is accepted for default-document variants too, because Google treats rel=canonical and redirect as equivalent and static hosts serve `/x/index.html` 200. The vague "emulation does not support" skip became decidable: `host` ≠ `none` → (a) and (b) are `skipped(host-emulation)` locally and checked at the edge. The edge requests go to 04 § 2 by xfile. |
| coverage-visibility#8 | IDX-008 Google-Agent | fixed | :246, :76 | `Google-Agent`, `honoursRobots` and `docUrl` added. New part `unenforceable` (W). `match` is `notApplicable` for non-honouring tokens. `userAgent` stays a single string (AEO-014 iterates it), with the version-placeholder rule. |
| coverage-real-use#10 | I18-010 French for Quebec | adapted | :276 | Adapted: "I18-009 with no skipped exemption" became part `complete`, which states exactly which I18-009 checks run. The page header and the French alternate are made decidable, and `parity` value normalisation is specified. `ca-qc` is already in privacy.md (:20). |

## Ownership rows
```
RTE-016	*	WP-410	explicit (html side)
RTE-016	channel:browser	WP-608	explicit (body-signal rendered DOM)
RTE-017	*	WP-608	explicit (browser control activation; raw-text side uses WP-410 raw HTML)
URL-014	*	WP-410	explicit
URL-014	channel:edge	WP-414	explicit (edge-pass probes of /)
I18-010	*	WP-410	explicit (WP-410(c))
SCH-006	channel:browser	WP-608	explicit (visible-text browser check, § 2)
SCH-010	channel:browser	WP-608	explicit (visible-text browser check, § 2)
TRS-002	channel:browser	WP-608	explicit (visible-text browser check, § 2)
MET-011	part:dead-anchor	WP-608	replaces `MET-011 channel:browser WP-608` (consistency#9)
RTE-003	*	WP-410	keep (tombstone; spec-lint requires an owner)
```
New parts already covered by an existing `*` row (no new row needed): URL-007 `format`, SCH-011 `vocabulary`/`domain`/`format`, RTE-011 `clock`/`random`, IDX-008 `unenforceable` (all WP-410).

## Ruleset data
- `generic-titles.json` (`{ "<primary subtag>": [string] }`): WP-104 **Content checks**. It replaces the prose bullet "generic titles per locale".
- `load-more-labels.json` (`{ "<primary subtag>": [string] }`): WP-104 **Content checks** (RTE-017 `button`).
- `default-documents.json` (`[string]`: `index.html`, `index.htm`, `index.php`, `default.aspx`, `default.asp`): WP-104 **Crawlers and agents** (URL-014).
- `ai-agents.json`: field list becomes `(token, vendor, category, userAgent, honoursRobots, docUrl)`; add `Google-Agent` (`user-fetch`, `honoursRobots: false`). WP-104 **Crawlers and agents**.
- `tracking-param-expansions.json`: already listed; shape now defined in web-delivery § 2.

## Policy keys added (key · type · default · file)
- `web-delivery.localePaths` · object `{ "<locale>": "<segment>" }` (values `^[a-z0-9-]+$`, unique) · `{}` · spec/packs/web-delivery.md:16
- `web-delivery.leakIgnore` · string[] (CSS selectors) · `[]` · spec/packs/web-delivery.md:27
- `web-delivery.reviewSources` (element shape defined, key existed) · `[{ pattern, ratingsSource }]` · `[]` · spec/packs/web-delivery.md:41

## spec-lint (last three lines)
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":30,"warnings":64}
  errors by check: ownership=23 channel-infra=7
  warnings by check: ruleset-unsourced=64
```
The errors from this pass are all expected, because they come from rows the orchestrator hasn't added yet:
- `ownership`: RTE-016, RTE-017, URL-014 and I18-010 have no owning work package.
- `channel-infra`: SCH-006, SCH-010 and TRS-002 have channel browser → WP-410 (fixed by the `channel:browser WP-608` rows above).
- `ruleset-unsourced` warnings: `generic-titles`, `load-more-labels`, `default-documents`.

The remaining errors and warnings belong to other packs (PRV-029..037, A11-030, DAT-018, CRW-004, RES-008, SE-128, LOC-004, SEC-074/075, UX-023/024, DAT-006, SE-002, SE-501).
