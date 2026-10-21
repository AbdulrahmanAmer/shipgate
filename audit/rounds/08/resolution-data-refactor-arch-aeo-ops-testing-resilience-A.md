# Resolution — data-refactor-arch-aeo-ops-testing-resilience — pass A — round 08

Files edited: spec/packs/data-api.md, refactor.md, architecture.md, answer-engines.md, ops.md, testing.md, resilience.md. Cross-file edits: `audit/rounds/08/xfile/from-data-refactor-arch-aeo-ops-testing-resilience.md` (items X1–X10). Several consistency rows' 01/03/04/security/web-delivery halves were already present in those files when checked (other fixers ran in parallel); they are marked "already applied" with the text that now covers them. Line numbers are the line of the rule (or policy key) in the edited file.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness#1 | API-001…009 | adapted | data-api.md:46 | Operator default taken (no SPEC.md decision-log conflict). Adapted: `graphql` and `jsonschema` entries are also read by API-008 `hand-copied` (GraphQL type names, `$defs`), not only `stale`. |
| concreteness#2 | API-001 | fixed | data-api.md:54 | |
| concreteness#3 | API-003 | adapted | data-api.md:56; xfile X7 | "First entry (declaration order)" → first id in byte order (`accounts` is a JSON object; consistency#110). Ops without path params get no other-tenant request. No owned id from harvesting (Builder-produced responses) → blocking `missing-element` owned by `operator`, not `notConfigured` (C10 escape); from the ownership file → `notConfigured(security.ownership)`. |
| concreteness#4 | API-004 | fixed | data-api.md:57 | Major-bump clause now cites kinds (1)–(3) (as before: removals, narrowing, new required). Class `contract-violation`. |
| concreteness#5 | API-002 | fixed | data-api.md:55 | |
| concreteness#6 | API-006 | fixed | data-api.md:59 | |
| concreteness#7 | API-008 | fixed | data-api.md:61 | |
| concreteness#8 | API-009 | adapted | data-api.md:62 | Barrier on the final byte of each request (works for requests without a body too). |
| concreteness#9 | DB-001 | fixed + xfile | data-api.md:66; xfile X1 | `dbTypes` adapter field requested in 03 § 6; `noAdapterSupport` only when neither `schemaDriftCommand` nor `dbTypes`. |
| concreteness#10 | DB-002 | fixed | data-api.md:67 | |
| concreteness#11 | DB-003 | fixed | data-api.md:68 | `safe-type-changes` shape defined. |
| concreteness#12 | DB-004 | fixed | data-api.md:69 | |
| concreteness#13 | DB-007 | fixed | data-api.md:72 | Class added (row 17). |
| concreteness#14 | DB-003, DB-009 | fixed | data-api.md:48 | |
| concreteness#15 | DB-011 | fixed | data-api.md:76 | |
| concreteness#16 | JOB-001 | fixed | data-api.md:81 | Blocker closed: cron equality declares only name/path/command-less sources with a 1:1 match. |
| concreteness#17 | several | fixed | data-api.md:54, :57, :59, :60, :62, :72, :82; refactor.md:63; testing.md:28 | Classes per the row. |
| concreteness#18 | REF-002 | fixed | refactor.md:42 | |
| concreteness#19 | REF-002 | adapted | refactor.md:52 | Operator default (W) taken. Dropped "raise to P1 with `ruleOverrides`": 03 § 3.1 `ruleOverrides[].state` is only `off\|warn\|experimental-on`, so it can't raise a severity. Local baselines only (remote baselines judge only REF-001/010/013/014). |
| concreteness#20 | REF-003 | fixed | refactor.md:53 | |
| concreteness#21 | REF-004 | fixed + xfile | refactor.md:41, :54; xfile X3 | |
| concreteness#22 | REF-004/005/006/012 | fixed + xfile | refactor.md:54, :55, :56, :64; xfile X8 | |
| concreteness#23 | REF-005 | fixed + xfile | refactor.md:55; xfile X4 | |
| concreteness#24 | REF-009 | adapted | refactor.md:59 | A flat ratio 1.0 would make a covering `visual` entry useless. Now: size change without a covering entry → `visual-diff`; with one → pad right/bottom, padded pixels differ, the entry's `maxDiffRatio` applies. |
| concreteness#25 | REF-010 | fixed | refactor.md:61 | 04 § 2 item 5 already reads "20 recorded remote-baseline URLs drawn with the lock-digest PRNG (§ 15, stream id `REF-010`) plus every recorded `url-move` source"; no xfile needed. |
| concreteness#26 | REF-010 | fixed | refactor.md:62 | |
| concreteness#27 | REF-011 | fixed | refactor.md:63 | |
| concreteness#28 | REF-002/006/012 | fixed | refactor.md:29, :31 | |
| concreteness#29 | REF-013 | fixed | refactor.md:65 | |
| concreteness#30 | TST-006, REF-010, OPS-006 | adapted | testing.md:28; refactor.md:61; ops.md:35, :16; xfile X5 | TST-006 uses consistency#25's names (`main` P1, `untested-file` W). REF-010 `depth` P1 / `depth-covered` W. OPS-006 `notConfigured(email.dkimSelectors)`, owner `operator`; `dkimSelectors` added to the pack's policy block (key already in 03 § 3.5). |
| concreteness#31 | ARC-001 | fixed | architecture.md:46 | |
| concreteness#32 | ARC-005 | adapted + xfile | architecture.md:50; xfile X2 | Kept PascalCase(`e`) (multi-word entities). The proposal made the UI-file check conditional on `dataAccess`, which drops a check (weakening); it is now part `ui-query` (P1) that applies with or without `dataAccess`; only the entity check is `notConfigured(dataAccess)`. |
| concreteness#33 | ARC-008 | fixed | architecture.md:53 | Class `orphan`. |
| concreteness#34 | ARC-009 | fixed | architecture.md:54 | |
| concreteness#35 | ARC-011 | fixed | architecture.md:56 | |
| concreteness#36 | AEO-001 | fixed | answer-engines.md:29 | |
| concreteness#37 | AEO-002, AEO-009 | fixed | answer-engines.md:30, :37 | |
| concreteness#38 | AEO-006, AEO-012 | fixed | answer-engines.md:34 | New ruleset `date-labels.json` (Ruleset data); "byline element" = class or id containing `byline` (as 04 § 15 *Visible dates*). |
| concreteness#39 | AEO-014 | fixed | answer-engines.md:44 | Blocker closed. |
| concreteness#40 | OPS-001 | fixed | ops.md:30 | Class `leak`. |
| concreteness#41 | OPS-005 | adapted | ops.md:34 | Added: an email no flow step triggered (job runs) uses the page locale of the service's `/`. |
| concreteness#42 | OPS-005 `postal` | fixed + xfile | ops.md:34; xfile X7 | |
| concreteness#43 | OPS-007 | fixed | ops.md:36 | |
| concreteness#44 | OPS-009 | fixed | ops.md:38 | `runtime-pins` shape defined; class `inconsistent-set`. |
| concreteness#45 | TST-001 | fixed | testing.md:23 | |
| concreteness#46 | TST-002 | fixed | testing.md:24 | |
| concreteness#47 | TST-010 | fixed | testing.md:32 | |
| concreteness#48 | RES-001/002/004 | fixed | resilience.md:21, :22, :24 | |
| consistency#20 | OPS-010 | fixed | ops.md:19, :39 | Blocker closed: missing example file = blocking builder-owned `missing-element`; start probe still runs. |
| consistency#22 | OPS-010 ↔ 04 § 5 | xfile — already applied | 04 § 5 *Hook sessions* | 04 now reads "git-ignored `.env*` files (never the tracked `.env.example`, `.env.sample`, `.env.template` or `.env.dist`, which OPS-010 requires the Builder to keep current)". |
| consistency#23 | ops § 1 | fixed | ops.md:26 | Worded without "ruleset-id value" (spec-lint `ruleset-unnamed`). |
| consistency#24 | OPS-006 | adapted | ops.md:35 | Took concreteness#30's `notConfigured(email.dkimSelectors)` instead of a W `dkim-selectors` part: 04 § 1.8 says an input whose absence makes the part undecidable gives `notConfigured`. Both remove the input-dependent severity. |
| consistency#25 | TST-006 | fixed | testing.md:28 | |
| consistency#26 | TST-007 | fixed | testing.md:29 | Also `data-api.firebase.seed` (consistency#69). |
| consistency#42 | RES-008 | fixed | resilience.md:28 | 04 § 1.2 half already applied ("RES-008 when …" is in the required-facts list). |
| consistency#43 | RES-008 | fixed | resilience.md:28 | 04 § 4.2 step 8 half already applied (delivery faults now "per form key of this run's G6 UX-001 form inventory", before load). |
| consistency#44 | RES-008 | fixed | resilience.md:28 | 04 § 4.5 half already applied ("Remote services have no local process … `skipped(remote)`"). |
| consistency#45 | RES-001 | fixed | resilience.md:17, :21 | RTE-007 half already applied in web-delivery.md (RTE-007 "upstream refused or answering 503"). |
| consistency#55 | AEO-014 | fixed | answer-engines.md:43 | SE-109 half belongs to the search-engines fixer. |
| consistency#64 | REF-010 | fixed | refactor.md:61 | 04 § 2 item 5 half already applied (see concreteness#25). |
| consistency#66 | `data-api.db` | fixed | data-api.md:25 | 01:133, 04 § 4.2 step 4 and 03 § 8 halves already applied. |
| consistency#69 | DB-011 | fixed | data-api.md:38, :76; testing.md:29 | |
| consistency#71 | OPS-001 | fixed | ops.md:30 | SEC-074 half already applied (security.md SEC-074 "http, browser"). |
| consistency#73 | OPS-002/003 ↔ 04 § 4.5 | xfile — already applied | 04 § 4.5 | 04 now reads "In the database-down stage, OPS-002 also requests each `endpoint: true` health URL and OPS-003 `event` also sends the API-002 example and generated requests". |
| consistency#75 | TST-008 ↔ 04 § 4.2 | xfile — already applied | 04 § 4.2 step 8 | 04 now reads "G6 flows with `mutates: true` (03 § 10; each, once per browser of its `browsers` ∪ TST-008 `testing.crossBrowser.browsers` …, every run its own stage". |
| consistency#77 | JOB-002 | fixed | data-api.md:82 | |
| consistency#91 | RES-008 | fixed | resilience.md:28 | `db` channel and `gates: [G6]`. |
| consistency#113 | DB-011 toolchain | xfile — already applied | 01 TR-001; 03 § 19 | 01 TR-001 and 03 § 19 now list "the Firebase emulator suite (with a JRE) where builds exist". |
| coverage-real-use#19 | OPS-015 (new) | adapted | ops.md:44 | Added. Product mapping via new ruleset `eol-products.json`; ranges count as their lowest admitted version; cycle = first k version components. The `eol-dates` snapshot is a 03 § 19 data item shipped with every release, so the proposed `skipped(no-snapshot)` (an agent could skip `fetch`) is not used. |
| coverage-real-use#20 | OPS-016 (new) | adapted + xfile | ops.md:45, :22; xfile X6, X9, X10 | Added with `ops.domain.minDaysValid`. `notApplicable` without `edge.production`. Registries that publish no `expiration` event (e.g. some ccTLDs) and failed lookups get `skipped(no-rdap)` + W review item instead of a false finding; the `status` clause still applies. |
| coverage-visibility#7 | AEO-015 (new) | adapted | answer-engines.md:46 | Added. Middle = index ⌊n/2⌋; the scroll exemption was dropped because `0 ≤ top < innerHeight` already holds for first-screen elements. |

## Ownership rows
```
AEO-015	*	WP-608	R08 new: fragment deep-link probe (browser)
OPS-015	*	WP-703	R08 new: end-of-life versions (eol-dates snapshot WP-401; eol-products ruleset WP-104)
OPS-016	*	WP-703	R08 new: RDAP domain registration expiry
OPS-016	channel:edge	WP-414	R08 new: RDAP lookups run in the edge pass
```
New parts with no separate row (covered by the rule's `*` owner): REF-002 `added`, REF-010 `depth-covered`, ARC-005 `ui-query`, TST-006 `untested-file`, AEO-015 `hash`/`scroll`/`visible`, OPS-015 `soon`/`eol-unknown`.

## Ruleset data
- `date-labels.json`: per locale `{ "<locale>": { "updated": [string], "published": [string] } }` (AEO-006, AEO-012). WP-104 "Round-7 named files" style bullet (new "Round-8 named files", per-locale).
- `eol-products.json`: `{ "<runtime id, verifyEnv.databases engine or package name>": "<product>" }` (OPS-015). WP-104 "Code and tooling" bullet.
- `eol-dates`: data snapshot (03 § 19 `purpose: "data"`, `refresh: "fetch"`), built from endoflife.date, `{ "<product>": [{ cycle, eol }] }` (OPS-015). WP-401 data snapshots (not WP-104).
- Shapes now defined for existing files (no new BUILD_MAP entry): `safe-type-changes` (DB-003), `runtime-pins` (OPS-009).

## Policy keys added (key · type · default · file)
- `data-api.db.service` · service id string · required when several services exist (CFG-006), else the only service · data-api.md:25
- `ops.email.dkimSelectors` · string[] · `[]` · ops.md:16 (already listed in 03 § 3.5; now shown in the pack block)
- `ops.domain.minDaysValid` · integer (days) · `60` · ops.md:22 (03 § 3.5 entry requested, xfile X6)
- Adapter fields (03 § 6, xfile): `dbTypes` `[{ command, output }]` · default `[]` (X1); `queryApis` `args` role `entity` with `"callee:<n>"` form (X2).

## spec-lint
```
spec-lint: {"requirements":575,"rules":556,"toolRequirements":19,"rulesWithParts":201,"errors":27,"warnings":64}
  errors by check: ownership=27
  warnings by check: ruleset-unsourced=64
```
Errors and warnings from this group, all expected until the orchestrator adds the rows above:
- `ERROR [ownership] AEO-015 (spec/packs/answer-engines.md:46) has no owning work package`
- `ERROR [ownership] OPS-015 (spec/packs/ops.md:44) has no owning work package`
- `ERROR [ownership] OPS-016 (spec/packs/ops.md:45) has no owning work package`
- `WARN [ruleset-unsourced]` for `date-labels` (answer-engines.md:34) and `eol-products` (ops.md:44): pending the BUILD_MAP WP-104 entries above.

The other 24 errors and the remaining warnings are in files outside this group (new IDs and ruleset files of the parallel fixers).
