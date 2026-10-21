# Resolution — web-delivery — pass A — round 06

File edited: `spec/packs/web-delivery.md`. Cross-file requests: `audit/rounds/06/xfile/from-web-delivery.md` (X1–X9). DECISIONS.md D-001..D-004 (budget exhaustion, cache keys, CSRF/SameSite, session lifetimes) don't touch any web-delivery finding; no row applies them. `spec/CHANGES.md` entries for these fixes are left to the orchestrator (the file is not in this fixer's {FILES}).

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-web-delivery#1 | RTE-004 | adapted | web-delivery.md:119 | RTE-004 judges the Status column only (parts `status`, `soft-404`, both P0†). Changed from the proposal: the Robots column of the 404/410 rows goes to IDX-006, not RTE-004. IDX-006 already owns "404/410 responses carry `noindex`", so leaving it in RTE-004 would have kept a double check. Probes defined: `/sg-{n}` plus `/{p}/sg-{n}` per literal first segment, retired entries, one past the last page of each URL-006 series, `app` seeds with and without a session. |
| concreteness-web-delivery#2 | RTE-001, LNK-001 | fixed | web-delivery.md:97, :209 | RTE-001 parts `head`/`links`/`main` with equality rules. LNK-001 now uses the browser channel and the control click probe. Ownership row below. |
| concreteness-web-delivery#3 | RTE-001, RTE-014, IDX-013 | xfile (X2) | 04 § 12 | The definition belongs in 04 § 12 (algorithms fixer; same gap as concreteness-algorithms#26). Adapted: the proposal made the smartphone response the RTE-014 reference, but then desktop-only content can never lower the score, so the reference is the desktop response. web-delivery.md RTE-001/RTE-014 now name their reference (:97, :129). |
| concreteness-web-delivery#4 | RTE-010 | adapted | web-delivery.md:125; xfile X4, X9 | New ruleset `search-agents.json`. Parts `behaviour`/`empty-ua`/`source-hint` keep the 04 § 1.8 names. Two changes from the proposal. (a) Googlebot is compared with the Chrome UA **of the same variant** (smartphone vs smartphone, desktop vs desktop): comparing Googlebot smartphone with desktop Chrome would flag legitimate responsive serving. (b) The skeleton hash masks every text node: the proposed 04 § 11 steps 1, 3, 6 keep all text on non-family pages, so the "skeleton" would have been a text hash. |
| concreteness-web-delivery#5 | RTE-014 | fixed | web-delivery.md:129 | Pages = the HTTP sample; overlap is the only text test; structured data compared by `@type` set plus per-node property-name sets (nodes matched by `@id`, else `@type` and position). |
| concreteness-web-delivery#6 | RTE-002 | adapted | web-delivery.md:98; xfile X1 | Uses `renderModes`. The proposed "no matching entry → finding" was replaced: the list is ordered, the first match wins and the last entry is a catch-all for the framework default, so a route always gets a mode. |
| concreteness-web-delivery#7 | RTE-013 | fixed | web-delivery.md:128; xfile X1 | Parts `uncaught`/`hydration`/`subresource`; `hydrationErrorPatterns`; browser sample 04 § 10; class `runtime-error`. |
| concreteness-web-delivery#8 | RTE-012 | fixed | web-delivery.md:127 | Normalisation as proposed. |
| concreteness-web-delivery#9 | URL-001 | adapted | web-delivery.md:134 | Section ref corrected to 03 § 3.2 (where `pathCase` is defined, not § 4). States `insensitive` behaviour (200 + canonical to emitted case) in line with 03 § 3.2. |
| concreteness-web-delivery#10 | URL-006 | adapted | web-delivery.md:139 | Series capped at 50 pages (04 § 10 trap limit). The `items` part needs ≥ 2 pages: on a 1-page series every link is "on every page", so the part can't be judged. Scroll procedure spelled out. Browser channel added (ownership row below). |
| concreteness-web-delivery#11 | URL-007 | adapted | web-delivery.md:140; xfile X1 | The `stable` part compares against the family dataset **at the diff base** (04 § 5), not `_main`. `_main/routes.jsonl` has no `family`/`rowId` fields (03 § 12), so the proposed comparison couldn't run. No git → `skipped(no-git)` (04 § 5). `slugApis` goes to 03 § 6. |
| concreteness-web-delivery#12 | MET-005 | fixed | web-delivery.md:153 | Missing image → builder-owned finding, never `notConfigured`; allowed host defined; `fetchers` sample = first 10 HTTP-sample pages (edge pass: homepage, as 04 § 2 already states). |
| concreteness-web-delivery#13 | MET-008 | fixed | web-delivery.md:156 | Parts `main`/`banned`/`i18n-keys`; `skipped(no-catalogues)`; class `leak`. |
| concreteness-web-delivery#14 | SCH-001 | fixed | web-delivery.md:178 | Required nodes listed; unresolved reference → `value-mismatch`. |
| concreteness-web-delivery#15 | SCH-005 | adapted | web-delivery.md:199; xfile X5 | Also accepts a `date`/`datetime` field of the page's inventory row, since programmatic pages get dates from data. Content modification time is defined once, in IDX-003. |
| concreteness-web-delivery#16 | SCH-006 | fixed | web-delivery.md:200 | Node scope and property list as proposed; the existing comparison methods are kept. |
| concreteness-web-delivery#17 | SCH-009 | fixed | web-delivery.md:203 | `<video>` source = `src` or first `<source src>`; classes named. |
| concreteness-web-delivery#18 | LNK-005, KW-002 | fixed | web-delivery.md:278, :213, :281 | Head term defined in § 12 using `stop-words.json` and `gazetteer/<country>.json`. Rule added for an empty head term (the full word list is used). |
| concreteness-web-delivery#19 | IDX-003 | adapted | web-delivery.md:221 | "Content modification time" is defined from inventory `lastmod`, or the committer time of the route file's import graph (04 § 13), with shared/layout files excluded. Pages whose graph reads `queryApis`/`httpClientApis` (DB/CMS content) have none: their real edit time is unknowable. The proposed "different from the content modification time is a finding" would have flagged every CMS page. It is replaced by parts `build-time` (as proposed, plus all-identical instants), `oracle` (family pages, exact), `future` (later than real edit + 24 h, the fake-freshness direction) and `deprecated-tags`. |
| concreteness-web-delivery#20 | I18-002 | fixed | web-delivery.md:245 | Path map comes from the adapter `config` readers (03 § 6 `config`; no new field needed). |
| concreteness-web-delivery#21 | I18-007 | fixed | web-delivery.md:250 | `lingua` pinned via WP-102 (see Ruleset data). Unconfident pages are listed in the coverage record. |
| concreteness-web-delivery#22 | I18-009, MET-008 | adapted | web-delivery.md:252; xfile X1 | Instead of an object form, `i18nCatalogs[]` globs must contain one `{locale}` placeholder. Same information, no type change for existing adapters. |
| concreteness-web-delivery#23 | CQ-002, CQ-008 | adapted | xfile X3; web-delivery.md:257, :263 | 04 § 1.4 edit generalised to "every `content`-channel rule (CQ-002, CQ-008, CQ-010)". CQ-006 dropped from the proposal's list: its channels are `baseline, site`, not `content`. The complete-crawl condition went into the rule texts, using the existing 04 § 10 `skipped(incomplete-crawl)`, not into 04 § 1.5. |
| concreteness-web-delivery#24 | TRS-001 | fixed | web-delivery.md:271 | Header `P1 (part \`strict\` P0)`. Missing-source case → builder-owned `missing-element`; the one-source case is defined too. |
| concreteness-web-delivery#25 | RTE-006 | fixed | web-delivery.md:121 | |
| concreteness-web-delivery#26 | URL-008 | fixed | web-delivery.md:141 | |
| concreteness-web-delivery#27 | URL-011 | fixed | web-delivery.md:143 | |
| concreteness-web-delivery#28 | MET-003 | fixed | web-delivery.md:151 | Parts `main`, `skip` (both P0, as before). |
| concreteness-web-delivery#29 | MET-010 | fixed | web-delivery.md:158 | Measured on the decoded image. |
| concreteness-web-delivery#30 | SCH-004 | fixed | web-delivery.md:185 | |
| concreteness-web-delivery#31 | SCH-008 | fixed | web-delivery.md:202 | |
| concreteness-web-delivery#32 | SCH-010, CQ-004 | adapted | web-delivery.md:204, :259 | CQ-004 becomes a tombstone. SCH-010 also gave up its "published date" clause: SE-110 already says it owns "the article shows a date" check, so leaving it would have kept a second overlap. SCH-010 now owns visible author only. |
| concreteness-web-delivery#33 | LNK-004 | fixed | web-delivery.md:212 | New ruleset `generic-anchors.json`. |
| concreteness-web-delivery#34 | IDX-005 | fixed | web-delivery.md:223 | Class `leak`. |
| concreteness-web-delivery#35 | IDX-010 | fixed | web-delivery.md:234 | |
| concreteness-web-delivery#36 | I18-005 | fixed | web-delivery.md:248 | Googlebot UA from `search-agents.json`. |
| concreteness-web-delivery#37 | I18-008 | fixed | web-delivery.md:251 | CLDR from the toolchain (already pinned for ICU4X, 04 § 11). |
| concreteness-web-delivery#38 | CQ-001 | fixed | web-delivery.md:256 | Decorative images as MET-012. |
| concreteness-web-delivery#39 | CQ-002 | fixed | web-delivery.md:257 | `mainTextHash` per 03 § 12 definition. |
| concreteness-web-delivery#40 | CQ-005 | fixed | web-delivery.md:260 | |
| concreteness-web-delivery#41 | MET-011 `social` | fixed | web-delivery.md:159 (part `social`) | Content shape of `social-hosts.json` and `placeholder-handles.json` now defined in the rule text; also listed under Ruleset data for the WP-104 bullet. |
| coverage-r05-carryover#1 | CQ-010 (new) | adapted | web-delivery.md:265; xfile X3, X6, X7, X8 | Changes from the proposal: (a) channel `content` (G5, WP-501 engine), not `html`; (b) pages = HTTP sample; (c) the excluded hosts are only `business.json` `socialProfiles` (03 § 14 has no `organization.sameAs`); (d) closes an escape the proposal left open: the state dir becomes a protected path (X8), and a recorded session of a fetch-reporting host with no store file is a builder-owned finding, not `skipped`; (e) the host capability is not claimed as confirmed; WP-101 verifies it. Store layout follows 03 § 15 state-dir conventions (`<state dir>/shipgate/<repo-id>/fetches/`). |
| lint.json ruleset-unnamed | :138 URL-007 | fixed | web-delivery.md:140 | Ruleset data: `stop-words.json` (the same name programmatic.md now uses). |
| lint.json ruleset-unnamed | :158 MET-011 `lorem` | fixed | web-delivery.md:159 (part `lorem`) | Ruleset data: `placeholders.json` (already in WP-104, "lorem/filler"). |
| lint.json ruleset-unnamed | :160 MET-011 `contact` | fixed | web-delivery.md:159 (part `contact`) | Ruleset data: `placeholders.json` (already in WP-104, "fictional phone ranges"). |
| lint.json ruleset-unnamed | :162 MET-011 `social` | fixed | web-delivery.md:159 (part `social`) | Ruleset data: `social-hosts.json` `handleSegment` (shape now defined). |
| lint.json ruleset-unnamed | :169 MET-013 `h1` | fixed | web-delivery.md:171 | Ruleset data: `stop-words.json`. |

## Ownership rows
```
CQ-010	*	WP-501	new (coverage r05 carry-over #1); store recording WP-306 (Claude Code) / WP-803 (other hosts) via xfile X6–X8
LNK-001	*	WP-608	replaces the WP-410 row: LNK-001 is now browser-only (control click probe, WP-602/609 machinery)
URL-006	channel:browser	WP-608	part infinite-scroll
URL-007	channel:diff	WP-410	part stable (diff base dataset); same WP, row only to make the new channel explicit
```

## Ruleset data
- `search-agents.json` — `[{ token, variant: "desktop"|"smartphone", userAgent }]` for Googlebot, Bingbot, Chrome (RTE-010, RTE-014, I18-005, AEO-014 via X9) → WP-104 **Crawlers and agents** bullet.
- `stop-words.json` per locale (URL-007, MET-013, KW head term; programmatic.md KW-003 uses the same name) → WP-104 main row "stop words, verb lists and a pinned Snowball stemmer per locale": put the file name in backticks there.
- `generic-anchors.json` per locale (LNK-004) → WP-104 main row "generic anchor-text lists": put the file name in backticks there.
- `social-hosts.json` `[{ host, aliases[], handleSegment, sharePaths[] }]` and `placeholder-handles.json` `[string]` (MET-011 `social`) → WP-104 **Round-2 content data** bullet (already listed; add the shapes).
- `lingua` crate, pinned, high-accuracy models for every `locales` language (I18-007) → WP-102 toolchain row (with licence, Apache-2.0).

## Policy keys added (key · type · default · file)
None. (New adapter fields `renderModes`, `hydrationErrorPatterns`, `slugApis`, and the `{locale}` placeholder in `i18nCatalogs`, are requested in xfile X1 for 03 § 6. They are adapter-manifest fields, not policy keys.)

## spec-lint (last three lines)
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":137,"errors":6,"warnings":63}
  errors by check: dangling=1 ownership=5
  warnings by check: ruleset-unsourced=57 ruleset-unnamed=1 channel-infra=5
```

Expected errors and warnings caused by this file (rows the orchestrator hasn't added yet):
```
ERROR [ownership] CQ-010 (spec/packs/web-delivery.md:265) has no owning work package
WARN  [ruleset-unsourced] ruleset data "search-agents" (spec/packs/web-delivery.md:125) is not listed in BUILD_MAP WP-102/WP-104
WARN  [ruleset-unsourced] ruleset data "generic-anchors" (spec/packs/web-delivery.md:212) is not listed in BUILD_MAP WP-102/WP-104
WARN  [ruleset-unsourced] spec/packs/web-delivery.md:125: `search-agents.json` is neither listed in BUILD_MAP WP-102/WP-104 nor a known project/product file
WARN  [ruleset-unsourced] spec/packs/web-delivery.md:129: `search-agents.json` is neither listed in BUILD_MAP WP-102/WP-104 nor a known project/product file
WARN  [ruleset-unsourced] spec/packs/web-delivery.md:140: `stop-words.json` is neither listed in BUILD_MAP WP-102/WP-104 nor a known project/product file
WARN  [ruleset-unsourced] spec/packs/web-delivery.md:171: `stop-words.json` is neither listed in BUILD_MAP WP-102/WP-104 nor a known project/product file
WARN  [ruleset-unsourced] spec/packs/web-delivery.md:212: `generic-anchors.json` is neither listed in BUILD_MAP WP-102/WP-104 nor a known project/product file
WARN  [ruleset-unsourced] spec/packs/web-delivery.md:248: `search-agents.json` is neither listed in BUILD_MAP WP-102/WP-104 nor a known project/product file
WARN  [ruleset-unsourced] spec/packs/web-delivery.md:278: `stop-words.json` is neither listed in BUILD_MAP WP-102/WP-104 nor a known project/product file
WARN  [channel-infra] URL-006 channel browser → WP-410, which doesn't depend on WP-601 (browser machinery)
WARN  [channel-infra] LNK-001 channel browser → WP-410, which doesn't depend on WP-601 (browser machinery)
```
The other errors (TCL-004 dangling, AGT-006/REF-014/SEC-067/UX-022 ownership) come from other groups' files, not from web-delivery.md.
