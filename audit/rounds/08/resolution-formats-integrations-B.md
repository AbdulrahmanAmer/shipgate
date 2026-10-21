# Resolution — formats-integrations — pass B — round 08

Inputs: every request in `audit/rounds/08/xfile/from-*.md` whose target is `spec/03-formats.md` or `spec/05-integrations.md`. That is 39 rows: algorithms 5 new + 9 mirror rows, core-adapters-ux 8, data-refactor-arch-aeo-ops-testing-resilience 6, privacy-a11y-perf 5, programmatic-search 5, plus the orchestrator's `dev fixture` note. `from-security.md`, `from-web-delivery.md` and this group's own outbox `from-formats-integrations.md` hold no request addressed to 03 or 05. Settled decisions from `audit/rounds/07/passB-notes.md` were applied: #4 (03 § 8 is the single *Operator-owned sources* definition, which X6/X7 below edit in place) and #5 (requests to CHANGES/BUILD_MAP/ownership/tools were skipped; the algorithms outbox's orchestrator rows #51/#60/#65 are not mine). Line numbers are after this pass.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-algorithms#New-05§1 | 05 § 1 subset / `--changed` scope | adapted | 05:12 | Subset-run sentence added as proposed. For `--changed` the text points to the 04 § 8 `verify --changed` row (04:302) instead of copying its gate list, so there is only one definition (passB-notes #2). The proposed copy matched 04:302 today; only "G8 always `SKIPPED(scope)`" is kept inline. |
| xfile-algorithms#New-03§6 | `generatedPatterns` row | adapted | 03:245 | Placed after `bundleManifest`, as asked. The proposed "excluded from treeHash" was unconditional, but 04:312 (§ 8.1) only lists a path that did not exist before G3 and exists after it. The row now says the patterns are "added to the built-in list of 04 § 8.1, which decides when such a path enters `generated.json` and leaves treeHash". The globs are relative to the service path (§ 2.2). |
| xfile-algorithms#New-03§3.4 | `databases[].migrateExternal` | adapted | 03:105 | As proposed (default `false`, 04 § 4.2 step 1a, matches 04:197), plus `migrateExternal: true` with `provider: "embedded"` → CFG-001, so the value can't be meaningless. |
| xfile-algorithms#New-03§3.1 | `baseBranch` resolution | adapted | 03:60 | The outcome is named `blocked(no-base)` (04 § 5), the form 04:545 uses. "04 § 5 `no-base`" was not used because no such token exists. The resolution order matches 04:248. |
| xfile-algorithms#New-03§5 | groupKey `locale` component | rejected (already fixed) | 03:199 | Pass A (consistency#106) already lists "`migrationFile`, `table`, `locale`". The request says no further edit is needed once that lands. |
| xfile-algorithms#Mirror-66 | 03 § 8 migrations dir | rejected (already fixed) | 03:312 | Already reads "`data-api.db.migrations.dir` for the service named by `data-api.db.service`" (pass A). |
| xfile-algorithms#Mirror-67 | `smtp.enabled` | rejected (already fixed) | 03:111 | Pass A. |
| xfile-algorithms#Mirror-99 | hub inventory `locale`/sort | rejected (already fixed) | 03:459, 03:462 | Pass A. |
| xfile-algorithms#Mirror-103 | coverage counts `blocked` | rejected (already fixed) | 03:540, 03:553 | Pass A. |
| xfile-algorithms#Mirror-104 | warning codes | rejected (already fixed) | 03:553 | Pass A. |
| xfile-algorithms#Mirror-105 | repo-id | rejected (already fixed) | 03:498 | Pass A: cites 04 § 15 *repo-id*. |
| xfile-algorithms#Mirror-106 | groupKey components | rejected (already fixed) | 03:199 | Pass A. |
| xfile-algorithms#Mirror-112 | licence handoff vs Builder work first | rejected (already fixed) | 05:252 | Pass A: "subject to 04 § 1.9 *Builder work first*". |
| xfile-core-adapters-ux#1 | `builderAssets` row | adapted | 03:259 | Placed after `errorPageFingerprints`, as asked. Matching uses § 2.2 glob semantics on `<host><path>`, not § 2.1: § 2.1 URL patterns are path-only (they start with `/`) and can't hold a host. The host is lower-cased and port, scheme and query are dropped, because § 2.2 is case-sensitive. This is the same convention as *Image sources* `match` (03:478). Matches 02:88. |
| xfile-core-adapters-ux#2 | `business.json` `incentive` | fixed | 03:473 | Shape and value format as proposed; matches ux.md:81–82 (UX-027). |
| xfile-core-adapters-ux#3 | § 3.5 ux row | fixed | 03:137 | Added `trackingIds` (ux.md:22: "no default"). The other three keys were already there (consistency#82, pass A). |
| xfile-core-adapters-ux#4 | `smtp.enabled` default | rejected (already fixed) | 03:111 | Text is identical to the request (pass A, consistency#67). |
| xfile-core-adapters-ux#5 | § 8 lock inputs migrations dir | rejected (already fixed) | 03:312 | Pass A (consistency#66). |
| xfile-core-adapters-ux#6 | § 19 Firebase emulator toolchain | rejected (already fixed) | 03:570 | Pass A (consistency#113): "the Firebase emulator suite with its JRE (for the platforms where a build exists; DB-011 `emulator`)". |
| xfile-core-adapters-ux#14 | 05 § 2.1 launch-check list | rejected (already fixed) | 05:125 | Already reads "(IDX-011, URL-011, SEC-065, UX-022, REF-010 when replacing a site)" (pass A, consistency#108). |
| xfile-core-adapters-ux#15 | PreToolUse matcher + `verify.env` reads | rejected (already fixed) | 05:167, 05:138 | Matcher already has `Read\|Grep\|Glob`, and the *Read-protected* rule denies `read` events on the `secretsFrom` file (pass A, consistency#111). |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#1 | `dbTypes` row | adapted | 03:265, 03:264 | Placed after `schemaDriftCommand`, as asked. `command` is a § 3.2 command *value*, with `cwd` relative to the service. The `schemaDriftCommand` row said `{db.url}` was "valid only here", which would have made DB-001's `dbTypes` example (data-api.md:66) invalid. It now says "valid only here and in `dbTypes[].command`", and `dbTypes` reuses the same `{db.url}` / `{db.<id>.url}` resolution, including CFG-002 for an ambiguous `{db.url}`. |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#2 | `ApiRef` `"callee:<n>"` | adapted | 03:207, 03:236 | As proposed, with the architecture.md:50 example (`prisma.invoice.findMany` → `callee:1`). Added: `"callee:<n>"` on any role other than `queryApis` `entity` → CFG-002, so the form is decidable everywhere `ApiRef` is used. |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#3 | `api.jsonl` `account` | fixed | 03:432 | Matches refactor.md:41. |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#4 | `budgets.json` `urls` | fixed | 03:436 | |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#5 | § 11 `text` row, REF-010 `depth-covered` | fixed | 03:412 | Matches refactor.md REF-010 part `depth-covered` (W). |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#6 | ops `domain.minDaysValid` | fixed | 03:139 | Matches ops.md:22 (default 60). |
| xfile-privacy-a11y-perf#X3 | `hosts[]` `country`, `transfer` | adapted | 03:99 | As proposed, with `country` stated as upper case (as ISO 3166-1 alpha-2 is written and as `transfer-adequacy.json` lists it, privacy.md:152). |
| xfile-privacy-a11y-perf#X4 | `manufacturers[].pagePaths`; `legal` representatives and DMCA agent | adapted | 03:473, 03:474 | Shape, formats and the containment sentence as proposed. Added a format for `.name` of all three new objects (non-empty strings), which the request left open. Matches privacy.md:126 (PRV-025 `pagePaths`), :155 (PRV-038), :170 (PRV-042). |
| xfile-privacy-a11y-perf#X5 | *Product compliance* file | adapted | 03:479 | Inserted after *Image sources*. Tightened so it can be decided: "first matching entry **in array order**"; `sku:<glob>` uses § 2.2 semantics; an entry needs **exactly one** of `values`/`notRegulated` (both present would be ambiguous for PRV-040 `register`); `values` keys of another regime → CFG-001. `class` is "exactly as printed on the label, e.g. `B` or `A++`", because not every product group has moved to the A–G scale. Matches privacy.md:159 (PRV-040). |
| xfile-privacy-a11y-perf#X6 | flow `journey: "subscribe"` | fixed | 03:340 | Matches privacy.md:168 (PRV-041 `confirm`). |
| xfile-privacy-a11y-perf#X9 | § 3.5 privacy keys | rejected (no edit requested) | 03:130 | The request itself says "no edit needed": § 3.5 lists only required and no-default keys, and the five new privacy keys have defaults in the pack block. |
| xfile-programmatic-search#X4 | `historyApis` | fixed | 03:236 | Inserted after `redirectApis`, as proposed; matches search-engines.md:88 (SE-129 `source-hint`). |
| xfile-programmatic-search#X5 | § 3.5 `priorityField` | fixed | 03:126 | Matches programmatic.md:150 and :64. |
| xfile-programmatic-search#X6 | § 8 live-snapshot outcome | adapted (mostly already fixed) | 03:313 | Pass A (consistency#21) already named "programmatic live snapshot: one blocking `missing-element` per family owned by `operator`". The remaining part of the request was applied: "programmatic dataset: CFG-001" → "programmatic `dataset`/`retired` paths: CFG-001", plus a "programmatic § 6 *live*" pointer. |
| xfile-programmatic-search#X7 | `commands.snapshot` no oracle | adapted + xfile | 03:88, 03:313; xfile § 8 | Took the request's second option and dropped `snapshot` from `commands`. A grep of all spec files finds no reader and no run step for it; 04:406 and 01 CFG-002 dropped it this round, so the key had no semantics. Also removed from the BLD-004 timeout list (03:88) and from the § 8 non-Operator-owned list (03:313). An unknown `commands` key is CFG-001, so the key can't be used as an oracle. 03:88 says there is no `snapshot` command and names `family.snapshot` as the only source. programmatic.md:261 still says "a service `commands.snapshot` is never an oracle source": replacement text is in `xfile/from-formats-integrations.md` § 8 (pass B additions) for the orchestrator. |
| xfile-programmatic-search#X8 | § 13 hub item order pointer | fixed | 03:460 | Matches programmatic.md:257 *Hub items*. |
| orchestrator-note#dev-fixture | 05 § 1 `dev fixture`, `rule --list` (BUILD_MAP § 4.1 item 5, WP-209) | fixed | 05:9, 05:26, 05:27, 05:80, 05:250 | `rule --list [--ruleset]`: lists the implemented rules of a ruleset, sorted by id. `dev fixture <dir>`: developer-only, hidden from `--help`, usage text and completions; runs one fixture (a directory with `expected.json`) as `verify --no-cache` without lock, signature or trust checks; writes no report, verdict record, handoff or cache entry, so it can't pass a stop hook or CI. Exit codes: 0 / 3 / 3 `not-a-fixture`. JSON shapes as BUILD_MAP § 4.1 item 5 plus `formatVersion` (05 § 1 convention); `part` = `main` when a finding has none. Global `--json` = `--format json`, the flag BUILD_MAP uses. Both commands are licence-free. **Decision for the orchestrator:** licence-free means an unlicensed user could use `dev fixture .` as a free finding list (no verdict, no seal). Making it licensed would make trace-check need a licence once WP-1001 lands. I chose licence-free; change both lines in 05:250 if the Operator wants otherwise. |

## Ownership rows
None (no new rule IDs or parts). `dev fixture` and `rule --list` are WP-209 deliverables already named in BUILD_MAP § 4.1 item 5 and the WP-209 goal; 05 § 1 is otherwise owned per BUILD_MAP § 5.

## Ruleset data
None. (`quality/data/product-compliance.json` is an Operator data file, not ruleset data. PRV-040's `regulated-product-regimes.json` is the privacy fixer's to source.)

## Policy keys added (key · type · default · file)
- `verifyEnv.databases[].migrateExternal` · bool · `false` · 03 § 3.4
- `services[].commands.snapshot` · **removed** (unknown key → CFG-001) · — · 03 § 3.2
- `hosts[].country` · ISO 3166-1 alpha-2 · none · 03 § 3.3
- `hosts[].transfer` · `"adequacy"|"dpf"|"scc"|"bcr"|"derogation"` · none · 03 § 3.3
- `ux.trackingIds` · listed under § 3.5 no-default · — · 03 § 3.5
- programmatic family `priorityField` · listed under § 3.5 no-default (default `null`) · `null` · 03 § 3.5
- ops `domain.minDaysValid` · integer days · `60` · 03 § 3.5
- adapter `generatedPatterns` · glob[] · `[]` · 03 § 6
- adapter `builderAssets` · glob[] · `[]` · 03 § 6
- adapter `dbTypes` · `[{ command, output }]` · `[]` · 03 § 6
- adapter `historyApis` · ApiRef[] · `[]` · 03 § 6
- `ApiRef.args` value `"callee:<n>"` (only `queryApis` `entity`) · string · — · 03 § 6
- flow `journey` value `subscribe` · enum value · — · 03 § 10
- baseline `api.jsonl` `request.account` · string \| null · — · 03 § 12
- baseline `budgets.json` `routeGroup.urls` · string[] · — · 03 § 12
- `business.json` `ratings[].incentive`, `testimonials[].incentive` · `"none"` \| non-empty array · none · 03 § 14
- `business.json` `manufacturers[].pagePaths` · URL pattern[] · absent · 03 § 14
- `business.json` `legal.euRepresentative`, `legal.ukRepresentative` `{ name, address, email }`; `legal.dmcaAgent` `{ name, address, email?, phone? }` · object · absent · 03 § 14
- `quality/data/product-compliance.json` · new Operator-owned file · absent · 03 § 14
- CLI: `rule --list [--ruleset <YYYY.MM[.N]>]`, `dev fixture <dir>` (hidden), global `--json` · — · 05 § 1
- exit-3 error id: `not-a-fixture` · — · 05 § 1

## spec-lint
`node tools/trace/spec-lint.mjs` (last three lines):
```
spec-lint: {"requirements":575,"rules":556,"toolRequirements":19,"rulesWithParts":201,"errors":0,"warnings":0}
  errors by check: none
  warnings by check: none
```
That is the second run, after all edits. The first run, during this pass, showed `warnings: 1` (`ruleset-unsourced=1`, not from 03/05). It cleared while other fixers were editing in parallel.
