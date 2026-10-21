# Resolution — formats-integrations — pass B — round 07

Inputs: every request in `audit/rounds/07/xfile/from-*.md` whose target is `spec/03-formats.md` or `spec/05-integrations.md` (24 rows; `from-formats-integrations.md` is this group's own pass-A outbox and holds none addressed to 03/05), plus `audit/rounds/07/passB-notes.md`.

**passB-notes applied to 03/05.** #1/#2: 03 and 05 hold no definition of *indexable page* or *page locale* and no "PARTIAL with a `reduced-environment` handoff" text for an unsupported locale (grep `indexable|page locale|reduced-environment` over both files: only 05:198 reduced runs, which is the `verifyEnv.reduced` case, unrelated); the `coverage.unsupportedLocales` request is rejected on #1 (row below). #3: 03 § 10 `logout` line now says a missing logout flow is a missing Operator input, SEC-028's `missing-element` owned by `operator` (03:333). #4: the new *Image sources* entry cites § 8 *Operator-owned sources* instead of restating it (03:460). #5: nothing in my inputs targets CHANGES/BUILD_MAP/ownership/tools.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-algorithms#X4 | 03 § 17 finding `absorbed` | fixed | 03:525, 03:534 | Example gains `"absorbed": []`; prose: rule ids or `RULE#part`, sorted by bytes, `[]` when none; matches 04:357 *Dedupe*. |
| xfile-algorithms#X5 | 03 § 6 `matcherWidening` | fixed | 03:255 | Row after `requestSources`, as proposed; 04:421 AGT-004 already cites "03 § 6". |
| xfile-core-adapters-ux#X9 | 03 § 14 `business.json` `terms` | fixed | 03:455 | Shape copied verbatim from ux.md:60 (UX-023); value formats added (non-negative integer counts, `minDays` ≤ `maxDays`, booleans, unique `shipping[].id`, `freeOver` as `prices[]`, `uptimePercent` decimal string 0–100). UX-023 added to the "missing key means none exist" list. |
| xfile-core-adapters-ux#X10 | 03 § 14 Image sources | fixed | 03:460 | Shape identical to ux.md:64 (UX-024): `formatVersion: 1`, `match` glob over host+path or `sha256:<64 hex>`, first match wins; field formats added; cites § 8 *Operator-owned sources* (passB-notes #4). |
| xfile-core-adapters-ux#X11 | 03 § 17 `coverage.unsupportedLocales` | rejected | — | Superseded by passB-notes #1 and 04:466 (*No entry*): a page locale with no ruleset entry is "one blocking finding per (rule, locale), failure class `missing-element`, owned by `operator`, groupKey rule + `locale:<tag>`" — the report already carries it as findings, and the run ends in an `operator-owned` handoff, not PARTIAL. A separate report list would be a second, drifting record. ux.md:73 still cites `coverage.unsupportedLocales`; under passB-notes #1 the ux fixer replaces that sentence with "04 § 15 page locale". |
| xfile-core-adapters-ux#X12 | 03 § 17 `auditTargets` | fixed | 03:535 | Now "04 § 15, stream id `audit-targets`, candidate key = the route-group id or the changed-file path … from their union"; the per-(rule, target) review entry was already applied in pass A. Matches 01:241 and 04:451. |
| xfile-core-adapters-ux#X13 | 03 § 6 conformance result | rejected (already fixed) | 03:259 | Pass A already wrote it: "**Conformance result:** `quality/conformance/<id>.json` (Operator-signed, protected by `quality/**`, committed so CI can check it) …"; "signed with the lock" no longer occurs in § 6 (grep). Location `quality/conformance/` kept (the request allows it; 02:103 cites "the conformance file of 03 § 6"). |
| xfile-core-adapters-ux#X14 | 03 § 9 debt `expires` for † | rejected (already fixed) | 03:316 | Already reads "`debt record` sets `expires` = record date + 90 days on new items of `†` rules/parts (`null` on others), and `debt add` requires `--expires` (≤ 90 days ahead) …". |
| xfile-core-adapters-ux#X15 | 05 § 3.1 cache dir protected | rejected (already fixed) | 05:127 | Already reads "the toolchain cache `cache.dir/**` (default `<cache dir>/shipgate/**`, 03 § 7.3)". |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#Y1 | 03 § 6 `dbClientApis` | fixed | 03:225 | As proposed; matches architecture.md:51 ARC-006. |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#Y2 | 03 § 6 `timeoutUnit` | fixed | 03:226 | As proposed; matches resilience.md:26 RES-006 `bound`. |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#Z1 | 05 § 2.1 step 4 REF-010/013/014 | rejected (already fixed) | 05:113 | Already reads "so every `verify` runs G7 and REF-010/013/014 (REF-011 is `notApplicable` against a remote baseline, 03 § 12; 04 § 1.6)". |
| xfile-privacy-a11y-perf#X4 | 03 § 14 `legal` keys + formats | adapted | 03:455, 03:456 | Shape and formats as proposed; added formats for the keys the request left open (`registerNumber`, `vatId`, `representative`, `mailOrderNumber`, `icpNumber`, `psbNumber`, `publicationDirector`, `cnpj`, `abn`, names: non-empty strings as the page must show them). LOC-001 containment line extended to `legal.registeredOffice` and `legal.host.address` (PRV-030 FR `host`, GB `registeredOffice`, privacy.md:125). |
| xfile-privacy-a11y-perf#X5 | 03 § 3.3 `hosts[].name` | fixed | 03:97 | As proposed; privacy.md PRV-031 already reads "a `hosts[]` entry has no `name` is a blocking `missing-element` owned by `operator`". |
| xfile-privacy-a11y-perf#X6 | 03 § 14 merchant feed shipping country | fixed | 03:458 | As proposed. |
| xfile-privacy-a11y-perf#X7 | 03 § 3.5 privacy `dsa.ugcSelectors` | fixed | 03:128 | No-default column, as proposed (privacy.md:49). |
| xfile-privacy-a11y-perf#X8 | 05 § 2.1 `ecommerce` row | adapted | 05:107 | Kept the row's decidable "when the answers include `<jurisdiction>`" form instead of "when Brazil … is chosen": `br-consumer` ← `br-lgpd` (PRV-035), `au-consumer` ← `au-privacy` (PRV-034, PRV-026), `in-ecommerce` ← `in-dpdp` (PRV-033); jurisdiction ids from privacy.md:10–19. `uk-consumer` wording kept from pass A (consistency#36). |
| xfile-programmatic-search#X4 | 03 § 13 `schema.values`, hub `lastmod?`, fixture inventory | fixed | 03:439, 03:440–442, 03:446 | As proposed; matches programmatic.md:137 (PCF-003), :252 (*Hub `lastmod`*), :255/:275 (`SHIPGATE_INVENTORY_DIR`, fixture pass). |
| xfile-programmatic-search#X5 | 03 § 3.5 programmatic `rights`, new keys | adapted | 03:124, 03:137 | `rights` placed in the **No default** column, not "Required keys": the Required column means CFG-001/006 fail without it, while programmatic.md:220 DAT-018 part `rights` makes a missing value a blocking `missing-element` owned by `operator` (required-facts). The "Additional keys" sentence added as proposed (`offerField`, `sources.<id>.rights`/`.attribution`/`.attributionFragment`, `sitewideLinkAllow`). |
| xfile-programmatic-search#X6 | 03 § 14 missing-feed owner | rejected (already fixed) + citation | 03:458 | Pass A already wrote "owned by `builder`, reassigned to `operator` only when the path lies outside the Builder's `writeScope`" (agentic feeds: "owned as for the merchant feed"). Citation tightened "04 § 15 *Owners*" → "04 § 15 *Owners of BLOCKED gates*" (the request's "04 § 14" is the wrong section; 04 § 14 is rulesets). |
| xfile-security#X1 | 03 § 10 `logout` journey | adapted | 03:325, 03:333 | Enum already has `logout` (pass A). The 03:333 bullet now says a logout flow runs as its non-`null` `account` after that account has logged in, and (passB-notes #3) that a missing logout flow is an Operator input, so SEC-028's `missing-element` is owned by `operator`. Put in the `journey: "logout"` bullet rather than after "`_login.json` is the login flow." so the flow semantics stay in one place. |
| xfile-security#X3 | 03 § 4 `tokenTtlVar` comment | fixed | 03:153 | As proposed (security.md:63 *Lifetime variables*). |
| xfile-web-delivery#4 | 03 § 6 `randomApis`, formatter roles | adapted | 03:203, 03:225, 03:227 | `randomApis` as proposed. Formatter roles: the proposed "`timeZone` as the option key of argument 1" didn't fit `ApiRef.args` (`{ <role>: <0-based index> }` only), so `ApiRef.args` now also takes `"<index>.<key>"` (property of an object-literal argument) and the examples use it (`"timeZone": "1.timeZone"`, `"currency": "1.currency"`). Matches web-delivery.md:137 (RTE-011) and :272 (I18-006). |
| xfile-web-delivery#5 | 03 § 6 `config` standard settings | fixed | 03:220 | As proposed, plus `i18n.defaultLocale` typed (BCP 47 tag); matches web-delivery.md:59 WCF-003. |

Counts: fixed 13 · adapted 5 · rejected 6 (5 already fixed — core-adapters-ux X13, X14, X15, data Z1, programmatic X6 (with a citation fix); 1 superseded by passB-notes #1 — core-adapters-ux X11) · xfile 0. Total 24 rows.

## Ownership rows
None. No new rule IDs or parts in 03/05.

## Ruleset data
None new. (`quality/data/image-sources.json` is a project file, Operator-owned, not ruleset data.)

## Policy keys added (key · type · default · file)
- `hosts[].name` · string · none (no default) · 03 § 3.3
- `privacy.dsa.ugcSelectors` · CSS selector[] · no default (listed) · 03 § 3.5 (defined in privacy.md)
- `programmatic.families[].offerField` · string \| null · `null` · 03 § 3.5 (defined in programmatic.md PCF-003)
- `programmatic.sources.<id>.rights` · enum `owned|licensed|public-domain|open:<SPDX>|facts-only` · no default · 03 § 3.5 (DAT-018)
- `programmatic.sources.<id>.attribution` · string \| null · none · 03 § 3.5 (DAT-018)
- `programmatic.sources.<id>.attributionFragment` · `staticFragments` key · `attribution-<id>` · 03 § 3.5 (DAT-018)
- `search-engines.sitewideLinkAllow` · `[host | { host, anchor }]` · `[]` · 03 § 3.5 (SE-128)
- Adapter manifest (not policy): `dbClientApis` ApiRef[] `[]`; `randomApis` ApiRef[] `[]`; `httpClientApis[].timeoutUnit` `"ms"|"s"` `ms`; `matcherWidening` `[{ from, to }]` `[]`; `ApiRef.args` value form `"<index>.<key>"` · 03 § 6
- `business.json` (not policy): `legal.{registeredOffice, registerCountry, host, publicationDirector, cnpj, grievanceOfficer, dpo, abn}`, `terms` · 03 § 14

## spec-lint
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":0,"warnings":65}
  errors by check: none
  warnings by check: ruleset-unsourced=64 ruleset-unnamed=1
```
0 errors. No warning names 03-formats.md or 05-integrations.md (`node tools/trace/spec-lint.mjs | grep -E "03-formats|05-integrations"` returns only the summary line). The 65 warnings are ruleset files in pack texts not yet in BUILD_MAP WP-102/WP-104 (orchestrator's) and one `ruleset-unnamed` at privacy.md:57.
