# Resolution — formats-integrations — pass A — round 06

Inputs: `concreteness-formats-integrations.md` rows 1–53 (all), `coverage-r05-carryover.md` row 1 (xfile parts for 03 § 15, 03 § 16, 05 § 3). DECISIONS D-001 (budget handoff kind) and D-002 (cache `hit` only for the same environment hash) applied in 03 § 15 / § 17. D-003, D-004 concern security rules only, so they don't touch 03/05.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness#1 | 05 § 3.2 Git / env tampering (Blocker) | adapted | 05:124–142 | All Git patterns rewritten as 03 § 2.4 argv patterns with `git *` (catches `git -C …`): forced/mirror/delete/prune pushes, short-flag clusters (`-[!-]*f*`, `-[!-]*d*`), `+`/`:` refspecs, `--no-verify`, `-c`/`-c<key>`/`--config-env` `core.hooksPath`, `git config … core.hooksPath`, commit `-…n…` clusters, `branch -D {baseBranch}`. Config keys compared case-insensitively. `setsVerifierVar` adds `HUSKY`, `HUSKY_SKIP_HOOKS`, `LEFTHOOK`, `LEFTHOOK_EXCLUDE`, `SKIP`, `PRE_COMMIT_ALLOW_NO_CONFIG` and also `GIT_CONFIG_*`/`GIT_CONFIG_PARAMETERS`/`GIT_DIR` (env-based `core.hooksPath` injection, same bypass class), and covers `unset`. |
| concreteness#2 | 03 § 1 `$schema`/`formatVersion` | adapted | 03:9 | `formatVersion` required on object JSON files; `$schema` written by shipgate and validated when present (the existing lock/debt/rollout examples have no `$schema`, so making it mandatory would invalidate them). Third-party formats listed as exempt; absent `formatVersion` in Operator-authored inputs = 1; array files become `{ $schema?, formatVersion, items }` (applied in 03 § 15, § 19). |
| concreteness#3 | 03 § 2.1 URL grammar | fixed | 03:24–27 | Productions, segment matching, specificity and tie, service resolution as proposed. |
| concreteness#4 | 03 § 2.2 globs | adapted | 03:30 | Set semantics; case-sensitive everywhere. Casing resolution extended to untracked and not-yet-existing files (parent dirs' canonical casing), so `QUALITY/x` on Windows can't bypass protection. |
| concreteness#5 | 03 § 2.4 / 05 § 3.2 command matching | fixed | 03:40–42; 05:124–142 | Matching, `*` token, glob syntax, `when:` predicates, `allow` scope. 05 § 3.2 restated as argv patterns plus predicates `prodHost`, `protectedTarget`, `writeApi`, `setsVerifierVar`. |
| concreteness#6 | 03 § 3.1 `verifier` / 05 § 6 | fixed | 03:52; 05:39, 05:194 | Cargo `semver::VersionReq`; `.shipgate-version` = running binary's exact version; `verifier-range-mismatch` exit 3. |
| concreteness#7 | 03 § 3.4 Waiver | fixed | 03:111 | `part?`, per-kind `pattern`, `expires` ≤ 365 days after lock `createdAt`; † rules waivable only in waivable parts. Reference written as 01 § 5.4 (the auditor's "01 § 118" is line 118 of that section). |
| concreteness#8 | 03 § 3.2 `commands` shell | fixed | 03:83 | Value set, word splitting, operator rejection (CFG-002), resolution, invocation per shell, `cwd`, string = object default. |
| concreteness#9 | 03 § 3.3 host registry | fixed + xfile | 03:94–95; xfile §2 | Defaults, host-pattern grammar, union on multiple matches; `dependency` boolean removed (purpose `dependency`, matching 04 § 4.5). Resilience comment fix requested via xfile. |
| concreteness#10 | 03 § 3.4 health readiness | fixed | 03:104 | |
| concreteness#11 | 03 § 4/§ 10 login parameterisation | fixed | 03:152, 03:342–343 | `<ID>` mapping (collisions → CFG-001), generators, current-account tokens, TOTP (base32 secret). Unset credential variable → `notConfigured(verify.env:…)`; `verify.env` changes are P0 AGT-001 (04 § 5), so this isn't an agent escape. |
| concreteness#12 | 03 § 4 `verifyBackdoor` | fixed | 03:154–155 | Also: 2xx without a session cookie → `BLOCKED(seed-contract)`. |
| concreteness#13 | 03 § 5 metadata schema | fixed | 03:188 | Required/defaults as proposed; `groupKey` component vocabulary added. |
| concreteness#14 | 03 § 6 adapter manifest | fixed | 03:196–243 | Field/type/required/default table; `ApiRef`, `Marker`, `Pointer` types; duplicate `queryApis[]` removed; addon requirements stated. |
| concreteness#15 | 03 § 7 key encodings | fixed | 03:252, 03:256, 03:264 | Export import compatibility stated. |
| concreteness#16 | 03 § 8 lock digest | fixed | 03:277 | `verify.env` line is appended last. |
| concreteness#17 | 03 § 8 host hook config inputs | fixed | 03:276 | |
| concreteness#18 | 03 § 9 debt item | fixed | 03:294 (example l.287–292) | Fingerprint includes `part` (consistent with 04 § 9.4); `addedAt`, `reason`; `debt record` never extends expiry. Example also gains 01 § 5.5's `packs`/`stableRules`/`notConfigured` arrays (written by the core fixer), fence changed to `jsonc`. |
| concreteness#19 | 03 § 10 step encoding | fixed | 03:313 | `optional: true` = W evidence and continue (flows are Operator-owned, so no agent escape). |
| concreteness#20 | 03 § 10 viewport/browsers/persist | fixed | 03:309–311 | `orientation: both` defined; names shared with refactor `visual.viewports`. |
| concreteness#21 | 03 § 10 step outcomes | fixed | 03:344–346 | Finding is emitted under the rule that ran the flow, with a screenshot. |
| concreteness#22 | 03 § 11 `allowedChanges` kinds | fixed | 03:360–376 | Table for all 13 kinds; `budget` also allows `p95` for API endpoints (else API latency changes couldn't be declared). |
| concreteness#23 | 03 § 12 normalisation / masks | fixed | 03:397–398, 03:399 | Manifest gains `masks` and `formatVersion`. |
| concreteness#24 | 03 § 12 counts/budgets/cycles | fixed | 03:399 | |
| concreteness#25 | 03 § 13 inventory bytes | fixed | 03:412 | Absent `locale` sorts as empty string. |
| concreteness#26 | 03 § 14 released contracts / CHANGES.md | fixed | 03:421 | Two files for one version → CFG-006. |
| concreteness#27 | 03 § 14 payment-scripts `url` | fixed | 03:427 | `*` also stops at `.` so it stays inside one host label. |
| concreteness#28 | 03 § 14 business.json formats | fixed | 03:423 | `ratings[].best?` added to the shape (the format referenced it); `country` ISO 3166-1 alpha-2, E.164, date fields. |
| concreteness#29 | 03 § 14 page approvals | fixed | 03:432 | Expired approval ignored. |
| concreteness#30 | 03 § 15 handoff shape | fixed | 03:439 | `kind: "budget"` only for operator-owned budget blocks (D-001). |
| concreteness#31 | 03 § 15 dependencies.json | fixed | 03:441 | Now an `items` object (row 2); AGT-009 match key (`ecosystem`, `name`, `version`). |
| concreteness#32 | 03 § 16 / 05 § 3.3 host mapping | adapted | 03:450–466; 05:145 | Table placed in 03 § 16 (BUILD_MAP WP-101 says it updates "03 § 16 mappings"; the coverage row asks for the same place); 05 § 3.3 references it. Marked "to be confirmed by WP-101". Adds stdin transport, malformed-payload → deny/block. |
| concreteness#33 | 03 § 17 report vocabularies, SARIF/JUnit | fixed | 03:488–491 | `cache: hit` only for the same environment hash (D-002); `summary.md` contents added. |
| concreteness#34 | 03 § 18 indexed-state labels | fixed | 03:498 | Ruleset `gsc-indexed-states.json`; unknown export locale → `notConfigured(indexing-export-locale)` (Operator-provided export). |
| concreteness#35 | 03 § 19 toolchain manifest | fixed | 03:502 | Platform set, mirror rewrite, signed `snapshots.json`, npm fetched at `fetch` time (contradiction with 05 § 8 removed). |
| concreteness#36 | 05 § 1 operational precedence/env | fixed | 05:10 | Policy removed from the chain; env names listed; other `SHIPGATE_*` inputs named. |
| concreteness#37 | 05 § 1 exit codes | fixed | 05:61–67 | Adds `codegen --check` and `debt add` refusal = 2 (01 § 5.5, written by the core fixer this round). |
| concreteness#38 | 05 § 3.3 host ids | fixed | 05:145 | |
| concreteness#39 | 05 § 1 Operator command arguments | fixed | 05:43–57 | Adds `keys export/import`, `debt add`, `hooks install` defaults; `keys show` made anyone (prints public material only). |
| concreteness#40 | 05 § 1 `codegen` output | adapted | 05:59 | `types-from-policy` writes `quality/generated/types/<family>.<ext>` + `business.<ext>`, matching programmatic DAT-001 `types` (not `policy.d.ts`). Staleness: DAT-001 `types` for families; new `codegen --check` (exit 1) for the rest, instead of an unowned CI `stale` finding. |
| concreteness#41 | Operator-command lists (05 § 1, § 3.2, 01) | fixed + xfile | 05:69, 05:142; xfile §1 | § 3.2 is the single source (adds `debt rotate`, `keys` minus `show`, exceptions `init --draft`, `migrate --check`, `codegen --check`, `baseline --ci`); 01 § 7 replacement requested. |
| concreteness#42 | 05 § 2 `init` on initialised repo | fixed | 05:75 | |
| concreteness#43 | 05 § 2.1 preset packs | adapted | 05:93–103 | Table adopted as the orchestrator default (no decision-log entry contradicts it). Adds: unsupplied required pack keys left out and listed (lock fails CFG-001/006 until set); `uk-consumer` for ecommerce (coverage carry-over #3); every preset pack not enabled → W `pack-disabled` on every run, so removal is never silent. |
| concreteness#44 | 05 § 3.1 lint-config keys | fixed | 05:121; 03:225 | Adapter field `lintGates[]` added to 03 § 6; every `package.json` under a service path and the root. |
| concreteness#45 | 05 § 3.2 hosted-builder / indexing deny | fixed | 05:129 | Ruleset `write-apis.json` with shape; predicate `writeApi`; `/ping?sitemap=` included; Naver/Seznam IndexNow endpoints added. |
| concreteness#46 | 05 § 3.3 Antigravity ellipsis | fixed | 05:153 | Explicit list, marked "to be confirmed by WP-101". |
| concreteness#47 | 05 § 3.3 git hook install target | fixed | 05:154 | Also `.husky/pre-push`. |
| concreteness#48 | 05 § 4 MCP schemas | fixed | 05:164–175 | Error shape; `status` state `none`; MCP never makes the stop decision. |
| concreteness#49 | 05 § 5 `_main` storage | fixed | 03:70; 05:185–187 | Policy key `ci.mainBaseline`; no artifact → `skipped(no-main)` as 03 § 12. |
| concreteness#50 | 05 § 8 licence format | adapted | 05:213 | Shape, signature, vendor keys, file location as proposed. Features: v1 defines only `core` (auditor's own default when no tiering is planned; the spec plans none); unknown features ignored for forward compatibility. |
| concreteness#51 | 05 § 8 licence outcomes | adapted | 05:214–221 | Adopted except that `check --hook pre` keeps enforcing § 3.1/§ 3.2 on an invalid licence: the proposed "allow and warn" would switch off protected-path and deny-list enforcement whenever a licence lapses, i.e. weaken protection. `brief`/`mcp` exit 2. Seats recorded in `<state dir>/shipgate/seats.json`, warn only. |
| concreteness#52 | 03 § 7.3 / 05 § 1, § 9 config dir, update | fixed | 03:261; 05:41, 05:227 | Also defines `<state dir>`, which 03 § 15 and 04 use without a definition. |
| concreteness#53 | 03 § 3.4 `dbEnv`, seed order, units | fixed | 03:101–102, 03:108 | |
| coverage-r05-carryover#1 | CQ-010 xfile parts: 03 § 15 store, 03 § 16 mapping, 05 § 3 recording | adapted | 03:446, 03:450–466; 05:119, 05:145, 05:227 | Store path adapted to the existing state-dir layout: `<state dir>/shipgate/<repo-id>/fetches/<sessionId>.jsonl` (proposal: `fetches/<repo-id>/<session-id>.jsonl`); shape, 200,000-char and 50 MB caps, oldest-first eviction as proposed, plus per-session dedupe by `textHash`. Normalised event gains `tool: "fetch"` and `fetched[]`; Claude Code PostToolUse matcher extended to `WebFetch\|WebSearch\|mcp__.*`. Added protection of `<state dir>/shipgate/**` (05 § 3.1) so an agent can't delete the store to reach CQ-010's `skipped(no-fetch-store)`. Fetch store named in 05 § 9 data inventory. Note to web-delivery fixer in xfile §3. |

## Ownership rows
None. No new rule IDs or parts in 03/05. (`codegen --check` and the `pack-disabled`/`unused-allowance` warnings are tool behaviour, not rules.)

## Ruleset data
- `write-apis.json` — `[{ vendor, host, methods, pathPattern?, productionOnly }]`, hosted-builder write APIs + IndexNow endpoints + `indexing.googleapis.com` (05 § 3.2) — WP-104 bullet **"Builder deny list"**: replace "hosted-builder publish APIs (05 § 3.2)" with "`write-apis.json` (hosted-builder write APIs, IndexNow endpoints, Google Indexing API; 05 § 3.2)".
- `gsc-indexed-states.json` — `{ <locale>: [label] }` (03 § 18, ROL-003) — WP-104 main row item "Search Console 'indexed' state labels per locale (ROL-003)": name the file.
- `fetch-tools.json` — `[{ host, tool: regex, url: JSON pointer, text: JSON pointer }]`, MCP browser/fetch tools whose results go into the session fetch store (03 § 16, CQ-010) — WP-104 bullet **"Code and tooling"**. (WP-101 should confirm host tool names when it observes live hook runs.)

## Policy keys added (key · type · default · file)
- `ci.mainBaseline` · `"artifact"\|"commit"` · `"artifact"` · 03 § 3.1
- `verifyEnv.health.<service>.url` · path · `"/"` (was the unlabelled default) · 03 § 3.4
- `waivers[].part` · string · every waivable part · 03 § 3.4
- `waivers[].expires` · `YYYY-MM-DD` · required, ≤ lock `createdAt` + 365 days · 03 § 3.4
- `hosts[]` defaults stated (`server`/`browser`/`essential` · bool · `false`); `hosts[].dependency` **removed** (use purpose `dependency`) · 03 § 3.3
- Flow keys (Operator files, not policy): step `timeoutMs` · int · 10000; step `optional` · bool · `false`; `orientation` default `portrait` · 03 § 10
- Adapter manifest field `lintGates` · `[{ config, pointer }]` · `[]` · 03 § 6
- User config (not policy) `update.check` · bool · `false` · 03 § 7.3

## spec-lint (last three lines)
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":142,"errors":5,"warnings":73}
  errors by check: ownership=5
  warnings by check: ruleset-unsourced=68 channel-infra=5
```
Errors, all outside 03/05 and expected (orchestrator rows not yet added): `REF-014`, `SEC-067`, `UX-022`, `CQ-010` have no owning WP (new rules from the coverage carry-over, other fixers); `AGT-006 channel:html (ownership.tsv:31)` is a pre-existing ownership.tsv row. Warnings from my files, expected until WP-104 lists them: `ruleset-unsourced` for `fetch-tools` (03:458), `gsc-indexed-states` (03:498), `write-apis` (05:129).
