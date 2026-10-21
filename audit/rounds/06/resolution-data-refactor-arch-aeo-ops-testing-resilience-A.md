# Resolution — data-refactor-arch-aeo-ops-testing-resilience — pass A — round 06

Inputs: `concreteness-data-refactor-arch-aeo-ops-testing-resilience.md` rows 1–68; `coverage-r05-carryover.md` row 4 (REF-014); `lint.json` warnings for these files (none: all 19 round-06 lint warnings are in other packs). Cross-file edits: `xfile/from-data-refactor-arch-aeo-ops-testing-resilience.md` (X1–X12). Line numbers are those of the files after this pass.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness#1 | API-006 | fixed + xfile | data-api.md:54; xfile X1 | Rule body as proposed (parts `replay`, `key-required` W; mutating stage; `remote: write`; `notConfigured(examples)`). 04 § 4.2 step 8 order → X1. |
| concreteness#2 | REF-002 (+003/004/005/010/012) | xfile | refactor.md:50 (references the table); xfile X6 | The `kind` → fields → coverage table belongs in 03 § 11 (format file); requested verbatim, with REF-014 added to `url-remove`. REF-002 now points to "what each `kind` covers: 03 § 11". |
| concreteness#3 | DB-012, refactor § 2, ARC-013, AEO-013, AEO-014, OPS-009, TST-010 | adapted | data-api.md:72; answer-engines.md:42; testing.md:32; Ruleset data below | Shapes go to BUILD_MAP WP-104 via "Ruleset data" (orchestrator-owned). Matching semantics that decide pass/fail are also stated inline: DB-012 (case-insensitive identifiers, email globs), AEO-014 `ai-addressed` (NFKC, case-fold, whitespace collapse, substring, locale fallback), TST-010 (same normalisation, equality, fallback). |
| concreteness#4 | DB-012 | fixed | data-api.md:72 | Ruleset `password-hash-patterns` with the six regexes. New ruleset (below). |
| concreteness#5 | API-001 | fixed | data-api.md:49 | As proposed; adapter field written `routes.discover` (03 § 6 `routes` object). |
| concreteness#6 | API-003 | fixed | data-api.md:51 | As proposed; `retry-after` part kept. |
| concreteness#7 | API-004 | fixed | data-api.md:52 | `notApplicable` with no released contract; "Declared" defined (`refactor.json` entry or `CHANGES.md` `## <new major>` entry); "release notes file" removed. |
| concreteness#8 | API-005 | fixed | data-api.md:53 | As proposed. |
| concreteness#9 | API-007 | fixed + xfile | data-api.md:20, :55; xfile X1 | New key `data-api.maxBodyBytes` (default 1048576); mutating stage; `remote: write`. 04 § 4.2 step 8 → X1. |
| concreteness#10 | API-008 | adapted + xfile | data-api.md:15, :56; xfile X10 | Parts `stale` (cmd) and `hand-copied` (ast); channels now `contract, cmd, ast`. Adapted: without `clientTypes` only `stale` is `notConfigured`; `hand-copied` still applies (the proposal made the whole rule `notConfigured`, which would weaken it). "Contract schema name" defined (OpenAPI `components.schemas`, GraphQL types, JSON Schema `$defs`). `clientTypes` shown as a comment (no default) + 03 § 3.5 "No default" → X10. |
| concreteness#11 | DB-001 | fixed | data-api.md:61 | Parts `apply`, `drift`; `noAdapterSupport` without `schemaDriftCommand`. |
| concreteness#12 | DB-003 | fixed + xfile | data-api.md:63; xfile X2 | Five named parts (all P1), new ruleset `safe-type-changes`; ORM formats use DB-006 attribution; step-4 statement logging → X2. |
| concreteness#13 | DB-004 | fixed | data-api.md:64 | As proposed. |
| concreteness#14 | DB-006 | fixed + xfile | data-api.md:66; xfile X2, X7 | As proposed. Per-file apply via the existing adapter `migrations.applyCommand`; `destructiveMigrationApis` → 03 § 6 (X7); statement logging in 04 § 4.2 step 4 (X2). |
| concreteness#15 | DB-007 | fixed | data-api.md:67 | Parts `fk-index`, `pk`. |
| concreteness#16 | DB-009, DB-011 | fixed | data-api.md:69, :71 | Parts `edge-functions` (DB-009), `rules` and `emulator` (DB-011). |
| concreteness#17 | DB-011 | fixed | data-api.md:71 | Owner refusal = builder finding `access-denied-wrongly`; `notConfigured(owned)` only for missing/unknown `ownerField` values. |
| concreteness#18 | JOB-001 | fixed | data-api.md:76 | As proposed. |
| concreteness#19 | JOB-002 | fixed | data-api.md:77 | As proposed; part `vacuous` (W). |
| concreteness#20 | JOB-003 | fixed + xfile | data-api.md:78; xfile X7 | As proposed; `jobRetryArgs` → 03 § 6 as `[ApiRef & { arg, unboundedDefault }]` (X7). |
| concreteness#21 | REF-001 | fixed | refactor.md:49 | Trigger = signed `refactor.json` or `--against`; baseline manifest `commit` = diff base (04 § 5). |
| concreteness#22 | REF-002 | fixed | refactor.md:21–27 | "Normalisation tokens" list after the policy block, as proposed, plus `json.ignorePaths`. |
| concreteness#23 | REF-002 vs REF-003…012 | fixed | refactor.md:50 | REF-002 scoped to `routes.jsonl`, `db/schema.sql`, `db/policies.json`; every other baseline file has a named owner. REF-014 added to the remote-baseline list. |
| concreteness#24 | REF-003 | fixed | refactor.md:51 | As proposed; part `links`. |
| concreteness#25 | REF-005 | fixed | refactor.md:15, :53 | `tolerance.inpMs` (50) and `cssBytesPct` (3) added; parts `budget`, `a11y`, `security` (all P2); `budget`/`header` allowedChanges coverage noted. |
| concreteness#26 | REF-006, REF-012 | fixed | refactor.md:29, :54, :62 | "Flow normalisation" in § 1 (generator names checked against 03 § 10); REF-012 references it. REF-006 also says which step fields are compared, and that a `flow` entry covers them. |
| concreteness#27 | REF-007 | fixed | refactor.md:55 | As proposed. |
| concreteness#28 | REF-008 | fixed | refactor.md:56 | > 50 files or > 2,000 lines. |
| concreteness#29 | REF-009 | fixed + xfile | refactor.md:57; xfile X8 | pixelmatch semantics, viewport sizes, capture conditions; manifest `visual[{ routeGroup, url }]` → 03 § 12 (X8). |
| concreteness#30 | REF-010 | adapted | refactor.md:59 | Only URLs recorded with 200 must be kept. Adapted: the proposal said recorded 3xx URLs belong to REF-011, but REF-011 judges declared redirect sources (`redirects.jsonl`), not crawl-recorded 3xx routes, so nothing would check them. REF-010 now passes a recorded 3xx URL only when it redirects in one hop (301/308) to its mapped recorded `location` or its `url-move` target. 404/410: `notApplicable`, listed. |
| concreteness#31 | REF-011 | fixed | refactor.md:61 | `Location` resolved, mapped and normalised per 04 § 10. |
| concreteness#32 | REF-013 | fixed | refactor.md:63 | No `serviceworkers.jsonl` → main part `notApplicable`. |
| concreteness#33 | ARC-001 | adapted | architecture.md:46 | 04 § 7.1 has no `module` role; used `source` (the generic role) instead. Otherwise as proposed. |
| concreteness#34 | ARC-002 | fixed | architecture.md:47 | Part `bundle` (build); `noAdapterSupport` without source maps/`bundleManifest`. |
| concreteness#35 | ARC-003 | fixed | architecture.md:48 | SCC identity, subset rule, failure class `cycle`, `skipped(no-main)`. |
| concreteness#36 | ARC-004 | fixed | architecture.md:49 | Part `schema` via adapter `validatorApis`; `notConfigured(envModule)`. |
| concreteness#37 | ARC-005 | fixed | architecture.md:50 | As proposed. |
| concreteness#38 | ARC-006 | fixed + xfile | architecture.md:51; xfile X7 | Key → API-family map; unknown keys fail CFG-001; `formatterApis`, `urlBuilderApis` → 03 § 6 (X7). |
| concreteness#39 | ARC-008 | xfile | xfile X4 | 04 § 13 key → `architecture.<service>.entryPoints`. Pack text already uses the per-service key. |
| concreteness#40 | ARC-009 | adapted | architecture.md:54 | While this pass ran, the algorithms fixer rewrote 04 § 13 ARC-009 with exact patterns (URL, PSL hostname, UUID, file-name exclusions) **and** SEC-050 `provider-pattern` patterns. Copying the auditor's patterns would have contradicted § 13, so the pack now references the § 13 patterns and settles the overlap the finding raised: a literal SEC-050 also reports goes to SEC-050 only. No 04 edit needed. |
| concreteness#41 | ARC-010 | fixed | architecture.md:55 | Owner `operator` when the pointer is off on the diff base too; `builder` when the diff turns it off, removes it or adds a weakening override; `noAdapterSupport` without `strictness[]`. |
| concreteness#42 | AEO-002 | adapted | answer-engines.md:30 | Adapted: the proposal required an `Organization` node on **every** indexable page, a new requirement that Google's guidance doesn't support (homepage markup is enough). Now: the homepage of each public origin must have one, and every own-site `Organization` node (url/@id on a service origin) shares `@id`/`name`/`logo`, so third-party Organization nodes (publishers, clients) aren't caught. Declared-value checks, logo fetch/robots/≥112×112 and `notConfigured(organization)` as proposed. The edge `sameAs` HEAD check is kept as part `same-as-reach` (W · edge); the proposal had dropped it. `http` channel added (logo fetch). |
| concreteness#43 | AEO-003 | fixed | answer-engines.md:31 | Behaviour without `pagePattern`; part `same-as` (W). |
| concreteness#44 | AEO-004 | adapted | answer-engines.md:32 | KW-003 normalisation written out as KW-003 states it (NFKC, lowercase, stop words removed, light stemming). It isn't called a "ruleset", because spec-lint flags unnamed ruleset mentions and the stop-word files have no names yet (another pack's open item). |
| concreteness#45 | AEO-005 | fixed | answer-engines.md:33 | Definitions apply to both parts; new ruleset `attribution-phrases.json`. |
| concreteness#46 | AEO-006 | fixed | answer-engines.md:34 | Pairwise agreement; site time zone = `web-delivery.timeZone` (exists, web-delivery.md:17). |
| concreteness#47 | AEO-007 | fixed | answer-engines.md:35 | As proposed. |
| concreteness#48 | AEO-008 | adapted + xfile | answer-engines.md:36; xfile X11 | The search-engines fixer already defined SE-008's challenge page as "ruleset `error-pages` fingerprints". Instead of a new `challenge-page-markers` ruleset, AEO-008 uses the same fingerprints plus the `cf-mitigated: challenge` header. X11 adds the header to SE-008 so both rules share one definition. |
| concreteness#49 | AEO-009 | adapted | answer-engines.md:37 | Measuring rendered area needs layout, so the `<canvas>`/iframe condition is a browser-channel check on browser-sampled pages; the long-alt image condition stays html. `browser` channel added; ownership slice below. Part `pdf` (W) as proposed. |
| concreteness#50 | AEO-010 | fixed | answer-engines.md:38 | As proposed. Of the original "not images" clause, only the AEO-009 near-empty-`<main>` case is decidable; the text now says so instead of claiming coverage. |
| concreteness#51 | AEO-014 | adapted | answer-engines.md:42–43 | As instructed: the inline lists are replaced by "04 § 15 hidden content" and "04 § 15 disclosure exemption". The § 15 text (already written by the algorithms fixer) covers every former AEO-014 condition and exemption, including dialog/popover, menus, carousel, template and noscript, so nothing is lost. ΔE is gone (§ 15 same-colour item 7). Ownership boundary (CNT-009, SE-123) as proposed. |
| concreteness#52 | AEO-014 | adapted | answer-engines.md:43, :45 | "Own text" → text content incl. descendants, ≥ 30 UAX #29 words. Bingbot UA: `rules/features/bing.json` has no user-agent field (search-engines.md:79 schema), so it can't be the source. Used `search-agents.json` (desktop Bingbot and Chrome), the file the web-delivery fixer introduced for RTE-010 this round. Skeleton hash = RTE-010 part `behaviour`'s. |
| concreteness#53 | OPS-002 | fixed | ops.md:29 | As proposed. |
| concreteness#54 | OPS-003, OPS-011 | fixed | ops.md:24, :30 | New ruleset `error-reporting-providers.json`; provider hosts; `errorReporting: null` → `notApplicable`; OPS-003 part `event` (http, database-down fault). `http` channel added. |
| concreteness#55 | OPS-005 | fixed | ops.md:32 | New ruleset `unsubscribe-labels.json`. |
| concreteness#56 | OPS-006 | fixed | ops.md:33 | Parts `spf`, `dkim`, `dmarc`. No selectors → part `dkim` is a W finding that asks for selectors (it isn't skipped). |
| concreteness#57 | OPS-007 | fixed | ops.md:34 | As proposed. |
| concreteness#58 | OPS-009 | fixed | ops.md:36 | As proposed. |
| concreteness#59 | OPS-010 | fixed | ops.md:37 | As proposed (`runtime-error`). |
| concreteness#60 | OPS-013 | fixed | ops.md:40 | As proposed. |
| concreteness#61 | TST-004 | fixed + xfile | testing.md:26; xfile X7 | Parts `order`, `sleep`, `egress` (W); `testReport` → 03 § 6 (X7). |
| concreteness#62 | TST-006 | fixed | testing.md:28 | Operator list and sampling unit (mutants) as proposed. |
| concreteness#63 | RES-001…RES-005 | fixed + xfile | resilience.md:16; xfile X3, X9 | `notApplicable` with no dependencies; 04 § 4.5 marker → `dependency: true` (X3); `dependency` purpose removed from 03 § 3.3 (X9). |
| concreteness#64 | RES-002 | fixed + xfile | resilience.md:21; xfile X3 | Hold = `pageMs` + 5,000 ms. Meanwhile the algorithms fixer wrote `upstreamMs` + 5,000 ms in 04 § 4.5. That lets a service with no timeout pass whenever `pageMs` ≥ `upstreamMs` + 5,000, so X3 asks to change it to `pageMs` + 5,000. **Open until pass B** (the two files disagree until X3 is applied). |
| concreteness#65 | RES-003 | fixed | resilience.md:22 | As proposed (`web-delivery.parity.minOverlap`, 04 § 12). |
| concreteness#66 | RES-004 | fixed | resilience.md:23 | As proposed. |
| concreteness#67 | RES-005 | fixed | resilience.md:24 | As proposed. |
| concreteness#68 | RES-006 | fixed + xfile | resilience.md:25; xfile X7 | Part `retry`; `httpClientApis` entries become `ApiRef & { timeoutArg?, clientFactory? }` in the 03 § 6 table (X7; the formats fixer turned § 6 into a table this round, so the request is written as table rows). |
| coverage-r05-carryover#4 | REF-014 (new) | fixed + xfile | refactor.md:43, :50, :64; xfile X6, X8 | New REF-014 · P1 · baseline, http. The remote baseline didn't record image URLs, so § 2 now records per-route `images[]` (`<main>` img/srcset/picture sources, `og:image`, image-sitemap `<image:loc>`) and 03 § 12 gets the field (X8). Exemptions: images only on routes REF-010 doesn't keep, and `url-remove` matches (X6 table notes it). Cap 2,000 per origin (lock-digest PRNG). Added to REF-002's remote-baseline list. |
| lint.json (round 06) | — | rejected (none in scope) | — | The 19 warnings are all in performance, privacy, search-engines, security and web-delivery; none is in these seven files. |
| DECISIONS.md D-001…D-004 | — | rejected (not applicable) | — | D-001 (budget exhaustion, 04 § 8), D-002 (cache keys), D-003 (SEC-024 CSRF), D-004 (SEC-064 lifetimes). None touches a rule in these packs (REF-005 "budget" means performance budgets, not 04 § 8 run budgets), so nothing was applied. |

Counts (concreteness 68 + carryover 1 = 69 findings): fixed 44 · fixed + xfile 12 (incl. REF-014) · adapted 9 · adapted + xfile 2 · xfile only 2. Plus 2 rejected meta-rows (lint, decisions: nothing in scope to apply). Every input row has an outcome.

## Ownership rows
```
REF-014	*	WP-801	remote-baseline image URLs (capture in baseline --from-remote, check in G7)
AEO-009	channel:browser	WP-608	rendered-area check for <canvas>/cross-origin iframes (clears channel-infra warning)
```

## Ruleset data
WP-104 bullets, with the shapes that row #3 asked for. Files new this pass are marked **new**.
- **Content checks:** `autoIdPatterns` — `string[]` of Rust-regex patterns matched against the whole `id` (AEO-013); `attribution-phrases.json` **new** — `{ "<BCP 47 language>": string[] }`, NFKC + case-fold + whitespace collapse, substring, fallback `ll-CC` → `ll` → `en` (AEO-005).
- **Round-6 data:** `ai-addressed-phrases.json` — `{ "<BCP 47 language>": string[] }`, same normalisation, substring; `en` list applied on every page (AEO-014).
- **Round-2 security/privacy/UX data:** `cancel-labels.json` — `{ "<BCP 47 language>": string[] }`, same normalisation, equality, fallback `ll-CC` → `ll` (TST-010); `user-tables`, `password-columns` — `string[]`, case-insensitive against unquoted identifiers, optionally schema-qualified; `default-emails` — `string[]` globs over lower-cased addresses (DB-012); `password-hash-patterns` **new** — `string[]` Rust regexes (DB-012).
- **UX and analytics:** `analytics-vendors` — `[{ vendor, hostPattern, pathPattern?, event: { in: query|body|form, key } }]` (refactor § 2, REF-012); `unsubscribe-labels.json` **new** — `{ "<BCP 47 language>": string[] }`, same normalisation, substring of link text (OPS-005).
- **Code and tooling:** `classNameFunctions` — `string[]` of callee names (ARC-013); `runtime-pins` — `[{ runtime, files: [{ glob, read: json-pointer|toml-key|yaml-key|whole-file|line-regex, at }], hostConfigs: [{ host, file, read, at }], ciInputs: [{ action, versionInput, fileInput? }] }]` (OPS-009); `safe-type-changes` **new** — `{ postgres: [{ from, to, condition? }], mysql: [...] }` type-change pairs allowed on `largeTables` (DB-003); `error-reporting-providers.json` **new** — `{ "<provider>": { hosts: [hostPattern], sdkPackages: [string] } }` for sentry, bugsnag, rollbar, honeybadger, datadog, newrelic, posthog (OPS-003, OPS-011).
- Used, not new here: `search-agents.json` (introduced by the web-delivery fixer for RTE-010; AEO-014 `agent-parity` reads its desktop Bingbot and Chrome entries); `error-pages` fingerprints (AEO-008, shared with SE-008).

## Policy keys added (key · type · default · file)
- `data-api.maxBodyBytes` · integer (bytes) · `1048576` · spec/packs/data-api.md:20
- `data-api.contracts[].clientTypes` · `{ command: string, output: path }` · none (absent → API-008 `stale` `notConfigured`) · spec/packs/data-api.md:15 (03 § 3.5 "No default" via X10)
- `refactor.tolerance.inpMs` · number (ms, absolute) · `50` · spec/packs/refactor.md:15
- `refactor.tolerance.cssBytesPct` · number (%, relative) · `3` · spec/packs/refactor.md:15
- `ops.errorReporting.provider` · now constrained to `error-reporting-providers.json` keys or `null` (no new key) · spec/packs/ops.md:24

## spec-lint (after this pass)
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":142,"errors":5,"warnings":73}
  errors by check: ownership=5
  warnings by check: ruleset-unsourced=68 channel-infra=5
```
Mine and expected (waiting on orchestrator rows):
- ERROR `REF-014 (spec/packs/refactor.md:64) has no owning work package` → ownership row above.
- WARN ruleset-unsourced: `attribution-phrases`, `safe-type-changes`, `password-hash-patterns`, `error-reporting-providers`, `unsubscribe-labels` → Ruleset data above; `search-agents.json` (answer-engines.md:45) → web-delivery fixer's file, sourced by the orchestrator.
- WARN ruleset-unsourced: `budgets.json`, `a11y.json`, `security.json` (refactor.md:50, :53) are false positives (03 § 12 baseline files, not rulesets) → xfile X12 (add them to spec-lint `PRODUCT_FILES`).
- WARN channel-infra `AEO-009 channel browser → WP-412` → ownership slice above.
Not mine (other groups' files): AGT-006 ownership, SEC-067, UX-022, CQ-010 ownership errors; the remaining ruleset-unsourced and channel-infra warnings.
