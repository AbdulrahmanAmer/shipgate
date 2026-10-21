# Resolution — web-delivery — pass A — round 08

File edited: `spec/packs/web-delivery.md`. Line numbers are after the edits. Cross-file edits are in `audit/rounds/08/xfile/from-web-delivery.md` (6 entries). Before writing them I grepped the target files. The 04 sides of consistency#44, #46, #49, #52, #53 and #94 had already been applied by the algorithms fixer, and the 02 side of #88 by its own fixer, so they are marked "already applied" and are not repeated. Settled decisions applied: round-07 passB-notes #1 (page-locale no-entry), #4 (03 § 8 *Operator-owned sources*) and #5 (BUILD_MAP rows go to the orchestrator).

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-web-delivery#1 | SCH-001, LNK-003, TRS-001, IDX-005, IDX-011, URL-011, URL-014 | adapted | :58; :204 (SCH-001), :237 (LNK-003), :166 (URL-011), :302 (TRS-001) | Added the § 1 *Homepage* definition as proposed. Also added: "the homepage" with no locale means the homepage of `defaultLocale`. SCH-001, LNK-003, URL-011 and TRS-001 now cite the definition. |
| concreteness-web-delivery#2 | RTE-004 | fixed | :124, :134 | The account whose id sorts first by UTF-8 bytes is used. With no accounts the result is `notConfigured(verifyEnv.auth.accounts)`, owner `operator`; `verifyEnv` is signed policy, so an agent cannot use this to escape. The table now says `verifyEnv.auth.loginPath` (03 § 4). |
| concreteness-web-delivery#3 | RTE-004, URL-002, URL-008 | fixed | :134, :164 | `status` now judges only the rows its own requests produce. Removed "retired paths 410" from URL-008; URL-008 now points to RTE-004 for the 410. |
| concreteness-web-delivery#4 | RTE-005 | fixed | :135 | |
| concreteness-web-delivery#5 | RTE-006 | fixed | :136 | |
| concreteness-web-delivery#6 | RTE-010 | fixed | :140 | Blocker. An element is removed only when it is an SE-109 gated block (shipgate's own observation) and the markup selector matches it. Any other element the selector matches is compared as normal, so markup cannot exempt anything (C10). |
| concreteness-web-delivery#7 | URL-001, IDX-001 | fixed | :157, :245 | Sitemap `<loc>` belongs to IDX-001 only. Channels changed to `http, html`. |
| concreteness-web-delivery#8 | URL-006 | adapted | :162 | Adapted three points. (1) For a programmatic hub, the hub's own `pagination.param`/`style` are used (consistency#52). (2) The series ends at the first non-200 response rather than "the first 404": a 5xx then becomes RTE-004's Empty-pagination `status-mismatch`, where before it was a silent 50-page walk. (3) The style-`path` URL is put in canonical form. |
| concreteness-web-delivery#9 | URL-008 | adapted | :164 | Proposed text, plus failure classes (`redirect-chain`, `status-mismatch`, `redirect-target`). |
| concreteness-web-delivery#10 | RTE-004, WCF-006 | adapted | :66 | `retired[].path` and `successor` must be wildcard-free. `**` and `{param}` are named explicitly. |
| concreteness-web-delivery#11 | MET-005 | adapted | :178, :64 (WCF-004) | Proposed text. `defaultOgImage` is now described as the builder's fallback value, and failure classes are listed. The `og:image` finding stays builder-owned and is never `notConfigured`. |
| concreteness-web-delivery#12 | MET-005 | fixed | :178 | New part `fetchers-edge` (W, edge). `fetchers` does not apply in the edge pass. The 04 § 2 item 5 wording is in xfile #6. |
| concreteness-web-delivery#13 | MET-009 | adapted | :182 | Proposed procedure, plus: spaces around `=` are removed, `initial-scale=1.0` counts as 1, and failure classes are listed. |
| concreteness-web-delivery#14 | MET-011 | fixed | :80 | |
| concreteness-web-delivery#15 | SCH-001, SCH-006, SE-106 | adapted | :204 | Added the *Primary entity* definition. Adapted: a second top-level node of a primary type that another node of the block references (e.g. an `Article`'s `video`) is not `duplicate-element`. Without this, every article with an embedded `VideoObject` would fail. SE-106 already cites "`{canonical}#primary` node (SCH-001)", so no xfile is needed. |
| concreteness-web-delivery#16 | SCH-001 | fixed | :204 | |
| concreteness-web-delivery#17 | SCH-003, SCH-001, PCF-003 | fixed | :201 | PCF-003 ("`schemaTypes` ⊆ the public-page types of web-delivery § 6") stays consistent. |
| concreteness-web-delivery#18 | SCH-004 | fixed | :213 | |
| concreteness-web-delivery#19 | SCH-006 | adapted | :226 | Says "CLDR subdivision name in the page locale" (the CLDR data set that has these names). |
| concreteness-web-delivery#20 | SCH-011 | fixed | :231 | |
| concreteness-web-delivery#21 | SCH-011 | fixed | :231 | |
| concreteness-web-delivery#22 | LNK-002 | adapted | :236 | Proposed text, plus: a non-HTML `public` target (PDF, image) needs only the 200, and a link to an alias host is `value-mismatch` (host). |
| concreteness-web-delivery#23 | LNK-003, LNK-005, IDX-001 | fixed | :237, :239, :245 | |
| concreteness-web-delivery#24 | IDX-001, SCH-006, SCH-007 | fixed | :245, :226, :227 | |
| concreteness-web-delivery#25 | IDX-002 | fixed | :246 | |
| concreteness-web-delivery#26 | IDX-004 | fixed | :248 | |
| concreteness-web-delivery#27 | IDX-006, IDX-007 | adapted | :250, :251 | Proposed text, plus failure classes. |
| concreteness-web-delivery#28 | IDX-010 | fixed | :263 | |
| concreteness-web-delivery#29 | IDX-013 | adapted | :266 | Proposed probe list, plus the `{path}` definition (no trailing slash; root → `/index.md`, `/index.txt`). |
| concreteness-web-delivery#30 | WCF-002, WCF-004, I18-002 | fixed | :62, :274 | WCF-002 now points to WCF-004 for `xDefault`. |
| concreteness-web-delivery#31 | I18-002, WCF-004 | adapted | :274, :64 | Names the registry as the "IANA Language Subtag Registry snapshot of the toolchain". The I18-002 test applies to `hreflang` values. The registry is listed under Ruleset data (WP-102). |
| concreteness-web-delivery#32 | CQ-003 | adapted | :289 | The proposal said "same-origin or not" without limit, which conflicts with TR-106 network limits. Adapted: URLs on a service origin or a `hosts` entry are requested; URLs on other hosts are listed in the coverage record and not requested. GET with ≤ 5 redirects. |
| concreteness-web-delivery#33 | KW-002, LNK-005 | fixed | :80 | `gazetteer/<country>.json` is already in BUILD_MAP WP-104 ("GeoNames"), so only the shape was missing. |
| concreteness-web-delivery#34 | KW-002, LNK-005, MET-013 | fixed | :309 | Also says that 04 § 15 *no entry* still applies to the stop-word list. |
| consistency#44 | RTE-007, RES-*, 04 § 4.5 | adapted | :137; xfile #1 | 04 side already applied (04-algorithms.md:230). RTE-007 now says remote fault stages are `skipped(remote)`, with the URLs not faulted listed in the coverage record. The resilience.md:28 edit is xfile #1 (it is also in the resilience fixer's findings). |
| consistency#45 | RTE-007, RES-001 | fixed | :137; xfile #2 | RTE-007 now covers "upstream refused or answering 503". The RES-001 and resilience.md:17 edits are xfile #2. |
| consistency#46 | URL-011 | fixed | :166 | An unresolved wildcard is now a blocking `missing-element` owned by `operator`. The 04:490 side was already applied. 04 § 1.2 already lists "URL-011 for an alias-host wildcard". |
| consistency#47 | TRS-001 | fixed | :302; xfile #3 | `business.json` `phones[].e164`/`emails[]` is the only oracle. If it is absent: blocking `missing-element`, owner `operator`. The 04 § 1.2 required-facts list entry is xfile #3. |
| consistency#49 | 04 § 15 no-entry severity | xfile (already applied) | 04-algorithms.md (algorithms fixer) | No web-delivery edit needed. CQ-007 (:293) already cites "04 § 15 *Page locale* (no entry)", which now carries the severity of the rule or part. |
| consistency#50 | URL-014 | fixed | :169 | `skipped(host-unsupported)` runs in the edge pass; partial when G8 is `SKIPPED` (04 § 1.6). |
| consistency#52 | indexable item 5, URL-001 | fixed | :157 | 04:485 side already applied. |
| consistency#53 | RTE-004, SE-112 | fixed | :126, :134 | Retired row and probe list now include literal-path `products.discontinued` entries without `successor`. The 04 item-4 side was already applied. |
| consistency#56 | `tracking-param-expansions.json` | fixed | :80, :161 | |
| consistency#57 | `search-agents.json` shape | xfile (orchestrator) | BUILD_MAP.md:136 | BUILD_MAP edits belong to the orchestrator (passB-notes #5). The web-delivery shape (:80, `[{ token, variant, userAgent }]`) is already the one the fix asks BUILD_MAP to adopt. |
| consistency#86 | RTE-004 soft-404 lookup | fixed | :134 | |
| consistency#87 | I18-007 `lingua` in WP-102 | xfile (orchestrator) | BUILD_MAP.md:110 | Orchestrator's (passB-notes #5). No web-delivery edit. |
| consistency#88 | adapter traps → RTE-008 | xfile (already applied) | spec/02-adapters.md | The 02 fixer has applied it (`MET-001 (`<title>`)` appears at both sites). RTE-008 (:138) is unchanged. |
| consistency#89 | URL-011 applicability | fixed | :166 | |
| consistency#92 | I18-010 channels | fixed | :282 | |
| consistency#93 | RTE-017 `button` | adapted | :153; xfile #4 | The probe's recording ("records the `a[href]` each click adds before the reload") is not in UX-006 today. RTE-017 now states the observation, and xfile #4 adds RTE-017 `button` to UX-006's "runs whenever" list along with the recording sentence. |
| consistency#94 | IDX-003 `_main/` | adapted | :247 | The 04:21 side was already applied. IDX-003 now also says that only a `_main/` with a valid `ci` signature counts, and otherwise the committer time stands. |
| coverage-visibility#3 | I18-011 (new) | adapted | :283; :36 (policy), :80 (ruleset shape), :64 (WCF-004), :102 map; :277 (I18-005 pointer); xfile #5 | Five adaptations. (1) Dropped the "adapter `request.geo`-style member" clause, which names no defined input; the header read goes through `requestSources` (03 § 6). (2) The proposal both excluded `geoRestrictions` countries and expected a 403/451 for them; now they are not requested at all. (3) Role `middleware` does not exist in 04 § 7.1 and became `api-handler`. (4) No edge part, because CDNs overwrite these headers. (5) The front-proxy pass-through for marked probes is xfile #5. I18-005's "IP-based redirects are not checked" now points to I18-011. |
| coverage-visibility#4 | MET-014 (new) | adapted | :197; :37 (policy), :66 (WCF-006), :104 map; xfile #6 | Three adaptations. (1) Instead of a new `skipped(external-host)` reason, hosts outside TR-106 declared hosts are not requested and are listed in the coverage record. (2) The edge pass is capped at 50 requests per origin, with the request list in xfile #6. (3) A missing `VideoObject` makes part `thumbnail` `notApplicable`. |
| coverage-visibility#9 | IDX-008 amend | fixed | :252 | Three Google fetchers added, plus pinned `honoursRobots: false` for ChatGPT-User and Perplexity-User. Reworded "at ruleset build time" so spec-lint `ruleset-unnamed` stays clean. Ruleset data change below. |
| coverage-real-use#5 | URL-015 (new) | adapted | :170; :80 (ruleset shape), :85 map; xfile #6 | Three adaptations. (1) The campaign query is built from every name in `campaign-params.json`, so the ruleset is the actual input; the proposal hard-coded six names. (2) URL-014 variants are repeated only when they answer with a redirect. (3) Intermediate `Location`s on alias hosts are also checked. "Redirects that intentionally strip parameters must do so on the client" was guidance, not a check, and is omitted. |

## Ownership rows
```
MET-014	*	WP-410	explicit (WP-410(b); coverage-visibility#4)
MET-014	channel:edge	WP-414	explicit (edge-pass media probes)
I18-011	*	WP-410	explicit (WP-410(c); coverage-visibility#3)
URL-015	*	WP-410	explicit (WP-410(a); coverage-real-use#5)
URL-015	channel:edge	WP-414	explicit (edge-pass host-identity and alias-host repeats)
MET-005	part:fetchers-edge	WP-414	explicit (edge half of former `fetchers`; concreteness-web-delivery#12)
```
The existing `MET-005 part:fetchers WP-414` row can stay, or move to WP-410 now that `fetchers` runs only in G4. That is the orchestrator's call; the build is correct either way.

## Ruleset data
- `geo-headers.json` (`{ headers, countries, packages }`, shape in web-delivery § 2): WP-104 **Crawlers and agents** (I18-011).
- `campaign-params.json` (`{ names: [string] }`, shape in web-delivery § 2): WP-104 **Crawlers and agents** (URL-015).
- `ai-agents.json`: add `Google-GeminiNotebook`, `Google-Pinpoint`, `Google-Read-Aloud` (`user-fetch`, `honoursRobots: false`); set `honoursRobots: false` for `ChatGPT-User` and `Perplexity-User`. WP-104 **Crawlers and agents** (IDX-008).
- `tracking-param-expansions.json`: shape is now `{ glob: [name…] }` (already listed in WP-104).
- `gazetteer/<country>.json`: already in WP-104; shape now defined in web-delivery § 2.
- IANA Language Subtag Registry snapshot (WCF-004 `locales`, I18-002 `hreflang`): toolchain data, WP-102. It belongs beside the CLDR and tz database pins.

## Policy keys added (key · type · default · file)
- `web-delivery.geoRestrictions` · string[] (ISO 3166-1 alpha-2, upper case; WCF-004) · `[]` · spec/packs/web-delivery.md:36
- `web-delivery.mediaNoindex` · string[] (URL patterns, 03 § 2.1; WCF-006) · `[]` · spec/packs/web-delivery.md:37

## spec-lint (last three lines)
```
spec-lint: {"requirements":575,"rules":556,"toolRequirements":19,"rulesWithParts":201,"errors":27,"warnings":67}
  errors by check: ownership=27
  warnings by check: ruleset-unsourced=64 ruleset-unnamed=3
```
Errors from this pass, all expected (rows the orchestrator hasn't added yet):
- `ownership`: URL-015 (web-delivery.md:170), MET-014 (:197) and I18-011 (:283) have no owning work package. The rows above fix them.
- `ruleset-unsourced` warnings: `geo-headers`, `campaign-params` (web-delivery.md:80, :170, :283).

No web-delivery `ruleset-unnamed` warning remains. The other 24 ownership errors and the remaining warnings belong to other packs being edited in parallel (AEO-015, SE-010/011/115/129, SEC-076..079, UX-025..027, TPL-008, AGT-011 part `behaviour`, and others).
