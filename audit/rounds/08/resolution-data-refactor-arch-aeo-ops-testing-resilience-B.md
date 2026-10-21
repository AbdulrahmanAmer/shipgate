# Resolution — data-refactor-arch-aeo-ops-testing-resilience — pass B — round 08

Inputs: every request in `audit/rounds/08/xfile/from-*.md` whose target is in spec/packs/data-api.md, refactor.md, architecture.md, answer-engines.md, ops.md, testing.md, resilience.md. `from-data-refactor-arch-aeo-ops-testing-resilience.md`, `from-privacy-a11y-perf.md` and `from-programmatic-search.md` contain no request targeting these files (programmatic-search lists consistency#55's answer-engines half as "not re-requested"; it was fixed in pass A, answer-engines.md:43). Each row was checked against the current text; most were consistency rows already in this group's pass-A input and applied there.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-algorithms#mirror-42 | RES-008 required-facts | rejected — already fixed | resilience.md:28 | Pass A: "else a blocking `missing-element` finding owned by `operator` for that key, naming the flow and \"no success expectation after the submitting step\" (04 § 1.2 required-facts rules; flows are Operator-owned), never `notConfigured`." |
| xfile-algorithms#mirror-43 | RES-008 form keys from G6 | rejected — already fixed | resilience.md:28 | "Form keys are the G6 UX-001 result of the same run (as UX-022): when G6 did not run or is `BLOCKED`, RES-008 is `blocked(prerequisite: G6)` and never passes on an empty key list." |
| xfile-algorithms#mirror-44 | RES-008 remote services | rejected — already fixed (adapted in pass A) | resilience.md:28 | "Remote services: `skipped(remote)` (04 § 4.5: no local process, SMTP sink or outcome stub reaches their dependencies), keys listed in the coverage record; `remote: write`." |
| xfile-algorithms#mirror-64 | REF-010 edge sample | rejected — already fixed | refactor.md:61 | "At the edge it checks 20 recorded URLs drawn with the lock-digest PRNG (04 § 15, stream id `REF-010`, candidate key = normalised URL) plus every recorded URL with a `url-move` entry, at most 200 URLs per origin (04 § 2 item 5)." |
| xfile-algorithms#mirror-66 | `data-api.db.service` | adapted | data-api.md:25, :48 | Key present since pass A (`"service": "api", // … required when several services exist (CFG-006), else the only service`). Added in pass B: a **Validation** (CFG-006 `schema-violation`) paragraph, because CFG-006 (b) only enforces cross-checks listed in 01 or in a pack's own `Validation:` paragraph and data-api had none — the value must be a `services[]` `id` (03 § 3.2); absent with > 1 service is a finding naming `data-api.db.service`; one service → defaults to it. This is the key 01 CFG-002, 03 § 8 (03:309) and 04 § 4 step 4 (04:200) cite. |
| xfile-algorithms#mirror-24 | OPS-006 `dkim` severity | rejected — already fixed (adapted in pass A) | ops.md:35 | "no selectors declared → part `dkim` is `notConfigured(email.dkimSelectors)`, owner `operator`". Removes the input-dependent severity (04 § 1.8) as the row asks; same warning weight as the proposed W part, so no weakening. |
| xfile-algorithms#mirror-25 | TST-006 parts | rejected — already fixed | testing.md:28 | "…of part `main` (P1) when a test imports the mutated file …, or of part `untested-file` (W) when no test imports it." |
| xfile-algorithms#mirror-45 | RES-001 dependency faults | rejected — already fixed | resilience.md:17, :21 | :21 "Dependency unavailable, API surface …re-sent in each 04 § 4.5 fault stage other than `delayed` (database stopped; each `dependency` host refused or answering 503) … (the request does not depend on the faulted dependency)"; :17 "RES-001 needs a database (`verifyEnv.databases`) or a dependency host". |
| xfile-algorithms#mirror-71 | OPS-001 channels | rejected — already fixed | ops.md:30 | "- **OPS-001** · P0 · http, browser —". |
| xfile-algorithms#mirror-91 | RES-008 `db` channel, gates | rejected — already fixed | resilience.md:28 | "- **RES-008** · P1 · http, browser, db —" and "Metadata `gates: [G6]` (the `formFallback` `db` query runs after the faulted flow)." |
| xfile-core-adapters-ux#21 | ops.md `errorReporting.provider` (consistency#23) | rejected — already fixed (adapted in pass A) | ops.md:26 | "unknown values are a CFG-006 `schema-violation` (a value that is no key of the pinned `error-reporting-providers.json`)" — worded without "ruleset-id value" to satisfy spec-lint `ruleset-unnamed`. |
| xfile-core-adapters-ux#22 | RES-008 form keys (consistency#43) | rejected — already fixed | resilience.md:28 | Same text as mirror-43. |
| xfile-core-adapters-ux#23 | `data-api.db.service` (consistency#66) | rejected — already fixed | data-api.md:25 | Same as mirror-66 (Validation paragraph added there). |
| xfile-formats-integrations#4 | RES-008 form key → 03 § 10 step index | fixed | resilience.md:28 | "(UX-022 definition: `<flow id>#<index of the submitting step>→<outcome>`)" → "(UX-022 definition: `<flow id>#<step index>→<outcome>`, step index per 03 § 10)". 03 § 10 *Step index* exists (03:351). |
| xfile-formats-integrations#7 | DB-001 `drift` `{db.url}` (information only) | fixed | data-api.md:68 | Optional citation taken: "`drizzle-kit check`; `{db.url}`: 03 § 6 `schemaDriftCommand`), run against the migrated database". |
| xfile-security#X6 | TST-007 `security.ownership` (consistency#26) | rejected — already fixed | testing.md:29 | "`security.ownership` and `data-api.firebase.seed` under `quality/fixtures/` (flow `upload` paths outside `quality/fixtures/` are CFG-001, 03 § 10)". |
| xfile-web-delivery#1 | RES-008 remote services (consistency#44) | rejected — already fixed | resilience.md:28 | Same text as mirror-44. |
| xfile-web-delivery#2 | RES-001 dependency faults (consistency#45) | rejected — already fixed | resilience.md:17, :21 | Same text as mirror-45. |

## Ownership rows
None (no new rule IDs or parts in pass B).

## Ruleset data
None.

## Policy keys added (key · type · default · file)
None new. `data-api.db.service` (added in pass A) now has its CFG-006 validation stated: service id (03 § 3.2 `id`) · required when `services[]` has > 1 entry, else the only service · data-api.md:25, :48.

## spec-lint
```
spec-lint: {"requirements":575,"rules":556,"toolRequirements":19,"rulesWithParts":201,"errors":0,"warnings":0}
  errors by check: none
  warnings by check: none
```
