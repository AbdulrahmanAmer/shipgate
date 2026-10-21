# Resolution — data-refactor-arch-aeo-ops-testing-resilience — pass A — round 07

Inputs: `concreteness-data-refactor-arch-aeo-ops-testing-resilience.md` rows 1–29; `consistency.md` rows whose Location names one of my files (25–28, 51–53, 65, 68, 75–82, 96–100, 106, 109, 111, 113–115, 122, 126–128, 133); `coverage-real-use.md` row 16 (RES-008; the only coverage gap in my packs — `coverage-visibility.md` has none). Consistency rows 10, 15, 16 (ownership.tsv / BUILD_MAP) are the orchestrator's and are not listed. Cross-file edits: `xfile/from-data-refactor-arch-aeo-ops-testing-resilience.md` (X1–X6, Y1–Y2, Z1, S1). Line numbers are those of the files after this pass.

Outcome "counter-side" = the row names my file only as the other side of the seam; the edit it asks for lies wholly in a file whose fixer has the row as primary Location. I checked my side and it needs no edit; no xfile request was filed, to avoid a duplicate edit.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness#1 | ARC-002 | fixed | architecture.md:47 | Transitive reachability over the file import graph (type-only excluded, literal dynamic `import()` included); finding shows the shortest import path. |
| concreteness#2 | API-006, API-009 | fixed | data-api.md:54, :57 | Path equality after 04 § 10 normalisation (query stripped, trailing slash removed) or path-template match (03 § 2.1); empty `idempotentPosts`/`raceSensitive` → `notApplicable`; unknown `example` id → `notConfigured(examples)` (examples are Operator-owned). |
| concreteness#3 | DB-003 `rewrite` | adapted + xfile | data-api.md:63; xfile X6; orchestrator note | MySQL eligibility by probe: the same `ALTER TABLE` on an empty `CREATE TABLE … LIKE` copy with `ALGORITHM=INSTANT`, else `INPLACE, LOCK=NONE` (the proposal's "copy at `planRows` rows" dropped: eligibility depends on structure, not rows, and an empty copy keeps the probe cheap and deterministic). Rule now also names MySQL `MODIFY`/`CHANGE COLUMN`. `safe-type-changes` shape → Ruleset data below (BUILD_MAP is orchestrator-owned). |
| concreteness#4 | DB-008 | fixed + xfile | data-api.md:68; xfile X4 | Body as proposed, plus failure class `pattern-match`. 04 § 13 DB-008 entry → X4. |
| concreteness#5 | DB-011 `emulator` | fixed | data-api.md:71 | `access-denied-wrongly` for a refused owner get; `access-allowed` for a non-refused unauthenticated/other-uid access. |
| concreteness#6 | JOB-002 / `jobs[].idempotencyKey` | fixed | data-api.md:40 | Key removed from the example. 03 § 14 already shows it removed (another fixer). |
| concreteness#7 | REF-004 | fixed | refactor.md:52 | Body as proposed; status may be the `to` of a matching `api-status`; removal accepted only with `api-field-removed` and current major ≥ its `contractVersion` major (03 § 11); classes `status-mismatch`, `schema-violation`, `value-mismatch`. |
| concreteness#8 | `asset-hashes` token | adapted | refactor.md:22 | Proposed pattern used a lookahead, which Rust `regex` (03 § 6: regexes are Rust syntax) doesn't support. Written as the leftmost match of `[.-]([A-Za-z0-9_-]{8,})\.<ext>$` normalised only when the run contains a digit; worked examples given. |
| concreteness#9 | REF-005 `budget` | fixed | refactor.md:53 | Median of `performance.lighthouse.runs` per URL, max over the route group; bytes summed per URL; `p95` as PRF-011 measures it (the proposal's "04 § 6.3 API load" is host calibration, not load); TR-111 `skipped(slow-host)` for timing metrics only. |
| concreteness#10 | ARC-001 | fixed | architecture.md:14, :46 | Own layer and packages always importable; undeclared `mayImport` name fails CFG-001; example's `data-client` removed. |
| concreteness#11 | ARC-005 vs ARC-006 | fixed + xfile | architecture.md:51; xfile Y1, X5 | `db-client` → `dbClientApis` (client construction); `queryApis` stays ARC-005's. 03 § 6 row → Y1; 04 § 13 ARC-006 line → X5. |
| concreteness#12 | ARC-007 | adapted | architecture.md:52 | As proposed, but "runs on every `deps`-channel change (04 § 7)" replaced by "runs in G1 whenever the diff changes a manifest or lockfile, and on every full run" (04 § 7 is `brief`; `deps` → G1 is 04 § 1.1). Class `forbidden-value`. |
| concreteness#13 | ARC-004 | fixed | architecture.md:49 | "Files counted: as ARC-001, excluding files of role `config` (04 § 7.1)." |
| concreteness#14 | AEO-001 | fixed | answer-engines.md:29 | `max-snippet` 0–49 fails; `-1` and ≥ 50 pass. |
| concreteness#15 | AEO-002 | fixed | answer-engines.md:30 | Merged with consistency#133: compared nodes = root-URL `Organization` (or homepage subtype) or nodes sharing the homepage `@id`; one `@id` per origin (SCH-001 `{origin}/#organization`), one `name`/`logo` across origins; deeper-path and own-`url` `LocalBusiness` nodes excluded; `sameAs` compared after 04 § 10 normalisation. |
| concreteness#16 | AEO-007 | fixed | answer-engines.md:35 | `notConfigured(indexNow.keyPath)`, owner `operator`. |
| concreteness#17 | AEO-014 `hidden-text` | fixed | answer-engines.md:43 | Scope = anywhere in `<body>`; exemptions, 30-word element threshold and the CNT-009/SE-123 slices kept. |
| concreteness#18 | OPS-002 | fixed | ops.md:29 | `(?i)\b(<name>)\b.{0,20}?\d+\.\d+` over database engines (`postgres`/`postgresql`/`pg` equivalent) and direct-dependency names ≥ 3 characters (ARC-007 manifest sections); class `leak`. |
| concreteness#19 | OPS-004 | fixed | ops.md:31 | Link clause as proposed; "preview hosts" = `web-delivery.aliasHosts` + resolved adapter `defaultAliasHosts` (URL-011); classes for the plain-text-part and sender clauses added. |
| concreteness#20 | OPS-003 `event` | fixed + xfile | ops.md:30; xfile X2 | As proposed, plus class `missing-element` for a 5xx without a provider request. 04 § 4.5 user list → X2. |
| concreteness#21 | OPS-012 | fixed + xfile | ops.md:39; xfile X1 | In-flight request defined as proposed (first operation by path bytes then method); classes `runtime-error`. Added: own mutating stage (it stops the service and may send a write) → 04 § 4.2 step 8 chain X1. |
| concreteness#22 | TST-001 | adapted | testing.md:23 | Added as part `asserts` (P0 · cfg; channel `cfg` added to the rule) so the G0 flow-shape check and the G6 run are separately addressable; action-step list completed from 03 § 10 (`dblclick`, `check`, `uncheck`, `submitEmpty`). |
| concreteness#23 | TST-003 | fixed | testing.md:25 | As proposed; channel `graph` added (test import graph). |
| concreteness#24 | TST-006 | fixed | testing.md:28 | Token-occurrence candidates ordered by (path bytes, line, column), candidate key stated, PRNG stream `mutation`, 3 × timeout → killed (detected). |
| concreteness#25 | TST-008 | fixed | testing.md:30 | `skipped(no-browser)` per browser without a managed build; launch failure → `command-failed`. Merged with consistency#128. |
| concreteness#26 | TST-009 | fixed | testing.md:31 | Failed same-origin request defined by resource type and status ≥ 400 / network failure; `expectApi`-matched requests exempt; class `runtime-error`. |
| concreteness#27 | RES-001 | fixed | resilience.md:21 | As proposed (≤ 50 per service, stream `res-001`; 5xx with `errorShape` body, or unchanged response); plus timeout = `pageMs`, and services without a contract use the `api`-surface URLs of `fault-20`. Merged with consistency#98. |
| concreteness#28 | `resilience.timeouts.upstreamMs` | fixed + xfile | resilience.md:26; xfile Y2 | New part RES-006 `bound` (literal timeout > 0 and ≤ `upstreamMs`). Literal units differ by library (`requests` takes seconds), so adapter `httpClientApis` gains `timeoutUnit` (Y2). Merged with consistency#96. `upstreamMs` is also read by RES-008. |
| concreteness#29 | OPS-010 / `ops.env.example` | fixed | ops.md:18 | One file name for every service, relative to `services[].path`; missing file → `notConfigured(ops.env.example)` for OPS-010 and ARC-015. |
| consistency#25 | AEO-014 `hidden-text` (Blocker) | fixed | answer-engines.md:43 | Condition (b): page total of non-exempt hidden text ≥ 100 words (each text node once) is a finding, so splitting into < 30-word elements no longer passes. Text inside hidden `<a href>` (SE-123) and CNT-009's scope not counted. CNT-009 side already applied by the programmatic fixer (same 100-word total). |
| consistency#26 | AEO-014 `hidden-text` vs SE-109 | adapted + xfile | answer-engines.md:43; xfile S1 | Paywall ownership added, but gated on the signed `search-engines.features` containing `paywalled-content` — the proposal keyed the exemption on JSON-LD the agent writes (STANDARD C10). Same gate applied to `agent-parity` (matching RTE-010 as already edited by the web-delivery fixer). SE-109 mirror → S1. |
| consistency#27 | AEO-014 `agent-parity` | fixed | answer-engines.md:45 | Text difference moved to part `text-diff` (W · http) with a decidable condition (agent text equals neither Chrome text). |
| consistency#28 | AEO-014 `agent-parity` (cloaking scope) | fixed | answer-engines.md:45 | Head signals compared as in RTE-014 where the two Chrome responses agree; also `Location` and no redirect following, matching RTE-010 as edited. RTE-010 side already on disk. |
| consistency#51 | SE-110 vs AEO-006 | counter-side | — | Fix is in search-engines.md SE-110. AEO-006 (answer-engines.md:34) already owns cross-source agreement; no edit. |
| consistency#52 | SE-004 vs AEO-012 | counter-side | — | Fix is in SE-004. AEO-012 (answer-engines.md:40) already states "Owner of 'dates move only with content'". |
| consistency#53 | IDX-003 vs AEO-012 | counter-side | — | Fix is in IDX-003 (web-delivery). AEO-012's condition is unchanged by it. |
| consistency#65 | SE-006 vs AEO-009 `pdf` | fixed (my mirror) | answer-engines.md:37 | AEO-009 `pdf` now owns title equality and names SE-006 for `rel=alternate` pairing/canonical/`noindex`. SE-006 side is the search fixer's (primary Location). |
| consistency#68 | `remote` metadata (TST, OPS) | counter-side | — | Fix is the central list in 04 § 15 and the 03 `parts` schema (algorithms/formats fixers). Rules I added this pass state `remote` themselves where relevant (RES-008 `remote: write`). |
| consistency#75 | API-001..003 mutating stage | fixed | data-api.md:49, :50, :51 | Non-GET/HEAD/OPTIONS requests run in a mutating stage. 04 § 4.2 step 8 side already on disk. |
| consistency#76 | API-003 (c) vs SEC-023/SEC-030 | fixed | data-api.md:51 | Anonymous 401/403; other-tenant 403/404 (refusal itself: SEC-021/SEC-023); kinds (a)/(e) on SEC-030 fuzz requests reported by SEC-030 `behaviour` only. |
| consistency#77 | API-004 declared | fixed | data-api.md:52 | Three declaration forms as proposed; major-bump requirement for removals/narrowing/new required inputs; `api-field-added` never needed. 03 § 11 `api-status` row already on disk. |
| consistency#78 | 02 § 6 API-004 gate | counter-side | — | Fix is in 02-adapters.md (already on disk). API-004 is `contract` channel (G2), unchanged. |
| consistency#79 | API-007 | fixed | data-api.md:55 | Non-JSON request media types excluded (SEC-032 `size`). |
| consistency#80 | API-001 bundle strings | fixed | data-api.md:49 | Part `bundle-only` (W · build, `orphan`); `build` added to the channels. |
| consistency#81 | API-008 `stale` | fixed | data-api.md:56 | Command runs in a temporary copy of the working tree (as `treeHash`); its `output` there is compared. |
| consistency#82 | `db` gate, DB-001 prerequisite | fixed (my mirror) | data-api.md:61 | DB-001 `apply` states the `blocked(prerequisite: DB-001)` effect; 04 § 1.1 and § 1.5 sides already on disk. |
| consistency#96 | unused `upstreamMs`, `idempotencyKey` | fixed | resilience.md:26; data-api.md:40 | See concreteness#28 and #6. |
| consistency#97 | resilience applicability | fixed | resilience.md:17 | Per-rule applicability sentence (RES-001 database; RES-002/007 dependency host; RES-003 `degradable`; RES-004 browser script host; RES-008 form key; RES-005 no fault ran; RES-006 always). |
| consistency#98 | RES-001 vs RTE-007 | fixed | resilience.md:21 | See concreteness#27. RTE-007 mirror already on disk. |
| consistency#99 | RES-003 vs RTE-007 | fixed + xfile | resilience.md:23; xfile X2 | "refused or answering 503"; probe URLs added to `fault-20`; RTE-007 doesn't judge them (RTE-007 side already on disk). 04 § 4.5 sample addition → X2. |
| consistency#100 | RES-004 stage/mechanism | fixed | resilience.md:24 | Points to its own stage (04 § 4.2 step 8) and the § 6.1 refusal; both 04 sides already on disk. |
| consistency#106 | REF-011 with remote baseline | fixed + xfile | refactor.md:50; xfile Z1 | REF-011 removed from the remote-baseline list with the reason; 05 § 2.1 → Z1; 03 § 12 side already on disk. |
| consistency#109 | ARC-010 vs AGT-001/003 | fixed | architecture.md:55 | Diff-time weakening reported only by AGT-001 (protected keys, 05 § 3.1) and AGT-003; ARC-010 reports the diff-base state (owner `operator`). Verified 05 § 3.1 protects `strictness[]` pointers. |
| consistency#111 | UX-009 vs REF-009 | fixed (my mirror) | refactor.md:57 | REF-009: "UX-009 does not run when a signed `quality/refactor.json` exists or `--against` is given". UX-009 side is the ux fixer's. |
| consistency#113 | TST-011 outcome | fixed | testing.md:33 | `notApplicable`, matching CFG-002 (01-core). |
| consistency#114 | TST-004 `egress` timing | fixed | testing.md:26 | Part names the G1 proxy start and `skipped(reduced)`; 04 § 4.6 side already on disk. |
| consistency#115 | ARC-008 `scope: repo` | counter-side | — | Fix is 04 § 13 Scope list (already on disk). |
| consistency#122 | health semantics vs OPS-010 | counter-side | — | Fix is in 04 § 4.1. OPS-010 (ops.md:37) already reads `verifyEnv.health.<service>.timeoutSec` "after BLD-005", consistent with the proposed text. |
| consistency#126 | REF-001 remote baseline `commit` | fixed | refactor.md:49 | "the `commit` condition does not apply to a remote baseline". |
| consistency#127 | TST-007 lock coverage | adapted | testing.md:29 | Paths spelled out per key (`testing.flows`; `data-api.contracts[].path`, `examples`, `released` under `quality/contracts/`; flow `upload` files under `quality/fixtures/`); `schema-violation` owned by `operator`. |
| consistency#128 | TST-008 browsers | fixed | testing.md:30 | Each matched flow runs in its own `browsers` ∪ `crossBrowser.browsers` (the proposal hard-coded firefox/webkit; the policy key already lists them). |
| consistency#133 | AEO-001..004 cross-refs | fixed | answer-engines.md:29–32 | AEO-001 `large-preview` yields to SE-103 `preview` (SE-103 mirror already on disk); AEO-002 per-origin `@id` (with concreteness#15); AEO-003 adds `NewsArticle`; AEO-004 uses Snowball stemming with `stop-words.json`, tokens unsorted. |
| coverage-real-use#16 | RES-008 (new) | fixed + xfile | resilience.md:13, :28; xfile X1, X3 | Added as proposed, adapted: the egress fault is applied to the outcome stub (04 § 4.6 makes outcome hosts always stubbed, so "the egress proxy answering 500" means the stub); `false-success` is not a 04 § 9.1 class → `value-mismatch`; `formFallback` semantics made decidable (scalar increases / message reached the sink); `db:` keys `notApplicable`. New policy key `resilience.formFallback`. 04 stage chain → X1; sink/stub behaviour → X3. |

## Ownership rows
```
RES-008	*	WP-703	R07 new: delivery-fault replays of UX-001 form keys (UX-022 form key; flows WP-602, already a WP-703 dependency)
```
New parts on existing rules stay with the rule's `*` owner: API-001 `bundle-only` (WP-701), TST-001 `asserts` (WP-607), RES-006 `bound` (WP-703), AEO-014 `text-diff` (WP-412, http).

## Ruleset data
- WP-104 `safe-type-changes` (changed shape): `{ postgres: [{ from: <type regex>, to: <type regex> }] }` — drop `condition?` and the `mysql` key (MySQL is judged by the DB-003 probe, 04 § 4.2 step 4).
No new ruleset files.

## Policy keys added (key · type · default · file)
- `resilience.formFallback` · `[{ key: string (UX-022 form key), db: { db, sql } } | { key, email: string }]` · `[]` · spec/packs/resilience.md (RES-008)
- Adapter manifest (03 § 6, via xfile Y1/Y2, not policy): `dbClientApis` · ApiRef[] · `[]`; `httpClientApis[].timeoutUnit` · `"ms"|"s"` · `"ms"`.
Removed: `data-api.jobs[].idempotencyKey` (example; 03 § 14 already removed).

Not done here (outside my files): `spec/CHANGES.md` entries for these amendments (STANDARD asks for them; the orchestrator owns that file).

## spec-lint (after this pass)
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":30,"warnings":64}
  errors by check: ownership=23 channel-infra=7
  warnings by check: ruleset-unsourced=64
```
(Other fixers were still writing in parallel; counts moved between runs.) Errors from my files: 1 — `[ownership] RES-008 (spec/packs/resilience.md:28) has no owning work package` (expected; row above for the orchestrator). The other 22 ownership and 7 channel-infra errors and all warnings are in other fixers' files (new PRV/UX/SEC/A11/RTE/URL/DAT/CRW rules, DAT-006). Lint warnings in my files: 0.
