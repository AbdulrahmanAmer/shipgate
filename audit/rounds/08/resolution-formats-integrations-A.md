# Resolution — formats-integrations — pass A — round 08

Inputs: `concreteness-formats-integrations.md` rows 1–35 (all); `consistency.md` rows ≥ 20 whose Location names 03 or 05: 21, 26, 27, 47, 58, 61, 63, 66, 67, 68, 69, 82, 89, 99, 100, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113. Settled decisions applied: `audit/rounds/07/passB-notes.md` (03 § 8 is the single *Operator-owned sources* definition; requests to CHANGES/BUILD_MAP/ownership/tools skipped). Line numbers are those after this pass.

Operator-decision defaults taken (orchestrator note on concreteness #13, #14, #18, plus #32): all five bundle readers; one discoverer id per 02 § 5 v1 adapter; all five CI providers; `$schema` domain `schemas.shipgate.dev`. Each can be trimmed without touching other text.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness#1 | Built-in deny list, global options before the verb (Blocker) | fixed | 05:141, 05:150–155, 05:159 | `*` inserted after the binary in every verb entry (deploy/infra, databases, publishing, secrets, shipgate Operator verbs). Notation sentence added. Fixtures added: denied `terraform -chdir=x apply`, `kubectl -n prod delete pod p`, `npm --registry x publish`, `shipgate --repo . lock`; passed `terraform plan`, `kubectl get pods`, `shipgate --repo . verify`. Each fixture hand-checked against 03 § 2.4 (`*` = zero or more tokens, trailing tokens allowed). |
| concreteness#2 | Base-branch deletion entry | adapted | 05:150, 05:141 | As proposed, plus `-M*`/`-[!-]*M*` (force move). Dropped `--delete=*` (git takes no `=` value there). Written without the outer parentheses, matching the other entries. Fixtures: denied `-d main`, `-D main`, `--delete main`, `-m main old`; passed `-d feature`, `-D feature`, `git branch main`. Hand-checked: `--merged main` and `--contains main` pass (`[!-]` rejects `--`). |
| concreteness#3 | Hard reset to remote | adapted | 05:150, 05:141 | Two entries (either option order); added `@{push}`; notation states that `@{u}` etc. are literal tokens, not placeholders. Fixtures: denied `git reset --hard origin/main`, `git reset origin/main --hard`, `git reset --hard @{u}`; passed `git reset --hard HEAD~1`. |
| concreteness#4 | `start` vs `timeoutSec` | fixed | 03:88 | `start` removed from the timeout-kill list. The process runs until its stage or run ends; readiness is bounded by `health.timeoutSec`; an early exit is a builder-owned BLD-005 `command-failed`. |
| concreteness#5 | Specificity ties with regex params | adapted | 03:30 | The proposed text was self-contradictory ("first differing position … unless an earlier position orders them"). Replaced with a structural **overlap** test that never intersects regexes: constrained params rank equal, and two constrained params at one position always overlap. A literal overlaps a constrained param iff the regex matches it. `**` alignment, method and service rules included. Proposed fixtures kept, plus `/p/{id:[0-9]+}/edit` vs `/p/{slug:[a-z]+}/view` → valid. |
| concreteness#6 | `verifyEnv.auth` defaults | adapted | 03:158 | Defaults as proposed, with 3 changes. (1) `loginPath` users corrected: SEC-003, SEC-021, UX-018 and the web-delivery `app` row read it, not SEC-018/SEC-028 (grep). (2) A missing `flow` file is CFG-001 only without `verifyBackdoor`, because with a backdoor `_login.json` is optional (03:162). (3) "First account" / iteration order = byte order of the ids. This also serves consistency#110. |
| concreteness#7 | `keys init` | adapted | 05:57 | As proposed, plus: a passphrase mismatch exits 3, and `--key` selects which trusted key authorises when there are several. |
| concreteness#8 | Step index | fixed | 03:351, 03:382, 03:417, 03:431 | One definition (0-based decimal string, `<outer>.<inner>`); groupKey, `flows.jsonl` `index: string`, refactor `flow.steps: string[]`, form key all cite it. ux.md / resilience.md pointers: xfile §§ 3–4. |
| concreteness#9 | Payment-script wildcard | fixed | 03:474 | Host `*` = one label; path `*` = one segment, dots allowed; fixtures added. |
| concreteness#10 | `coverage.<svc>.rules[]` shape | fixed | 03:549 | Every evaluated rule, sorted, `{ id, outcome, reason?, input?, experimental? }`; counts = entries by outcome. Merged with consistency#103. |
| concreteness#11 | Licensed vs licence-free | adapted | 05:249, 05:24, 05:27 | Two lists as proposed; `keys show` folded into `keys *`; `init` is licensed except `--draft`. The "(licence-free)" notes in the § 1 Who column were removed so § 8 is the only list. |
| concreteness#12 | `security.json`, `db/policies.json` shapes | adapted | 03:441, 03:442, 03:9 | `security.json` as proposed (`probes[].id` = `<rule>#<part>`). For `db/policies.json`, refactor § 2 (refactor.md:42) already defines a flat shape `[{ db, schema, table, name, command, roles, qual, withCheck }]`. The proposed nested shape would contradict it, so 03 types that shape's fields instead (`command` enum, sorted `roles`, collapsed expressions; `[]` without policies). 03 § 1 now exempts `db/policies.json` from the array-to-`items` rule, as it does `cycles.json`. |
| concreteness#13 | `bundleManifest` format | adapted | 03:244, 03:209–214 | Operator default: all five readers. Shape `[{ glob, reader }]` with yield `{ routes, sources }` (what PRF-010 and ARC-002 `bundle` consume). Formats with no route map yield one `/**` route of entry chunks. |
| concreteness#14 | Built-in ids | adapted | 03:209–214, 05:19 | 02 § 5 names no ids, so 03 lists them: one discoverer per v1 adapter, plus `crawl-sitemap` and `declared`. Also listed: `fileMap` ids, redirect readers and server-function discoverers (`orpc-router` added for the existing `orpc` kind). `cloudflare-redirects` was dropped because Cloudflare Pages uses the `_redirects` format (`netlify-redirects`). Unknown id → CFG-002. `doctor --adapters` added. |
| concreteness#15 | `portBinding: config` | fixed | 03:226 | |
| concreteness#16 | `schemaDriftCommand` | adapted | 03:262 | `{db.url}` is defined only inside `schemaDriftCommand` and not added to the § 3.2 `env` list, where it would be ambiguous for multi-database services; `{db.<id>.url}` is also accepted. An entry that selects several databases → CFG-002. Owner `builder`. The DB-001 example stays valid (xfile § 7, information only). |
| concreteness#17 | `init` questions, host detection | adapted | 05:101, 05:103, 05:99, 05:18 | Order and defaults as proposed. The database default is concrete (`main`, `postgres`, newest toolchain version, `embedded`). Unsupplied required keys are listed as unconfigured inputs (as § 2.1). CLI names: `cursor-agent` and `antigravity` instead of the unverified `cursor`/`agy`, marked "confirmed by WP-101". Step 11 provider detection = the § 5 File column. `--yes` flag added. |
| concreteness#18 | CI templates | adapted | 05:205–213, 05:203 | Operator default: all five providers, in a table. GitLab gets no MR note (`CI_JOB_TOKEN` can't post notes): `summary.md` goes to the log and artifacts. Bitbucket and CircleCI have no cross-pipeline artifact download, so `init` writes `ci.mainBaseline: "commit"` there. A policy with `"artifact"` on them → `skipped(no-main)`. |
| concreteness#19 | `migrate` target ruleset | fixed | 05:41 | `--ruleset` flag added; `--check` writes nothing. |
| concreteness#20 | Non-verify `--format json` | adapted | 05:79 | Shapes as proposed, with array outputs wrapped in objects with `formatVersion` (03 § 1 array rule). Fallback `{ formatVersion, exitCode, message }` for other commands. `--format sarif` elsewhere → exit 3 `unsupported-format`. |
| concreteness#21 | `waitFor { url }` | fixed | 03:361, 03:382 | `{ urlEquals }` / `{ urlMatches }`; `waitFor` polls every 100 ms like expect steps. |
| concreteness#22 | `verify.env` "not locked" vs digest | fixed | 03:308, 03:312 | Locked by hash only. Absent file = hash of zero bytes (full digest written). Merged with consistency#61. |
| concreteness#23 | Launch-form key grammar | fixed | 03:481 | |
| concreteness#24 | `fileRoles` order | fixed | 03:229 | Ordered array, first match wins. 02 § 3 example: xfile § 1. |
| concreteness#25 | `.shipgate-version` bytes | fixed | 03:13 | Exact bytes written, readers strip whitespace, non-SemVer → CFG-008. CFG-008 text: xfile § 5. CI step cites the strip rule (05:201). |
| concreteness#26 | `conformance` exit code | fixed | 05:75 | |
| concreteness#27 | `baseline --from-remote`, default id | adapted | 05:63 | As proposed, plus a `_main` exception: `baseline --ci --id _main` replaces `_main/` on every base-branch run and would otherwise hit `baseline-exists`; the id regex alone would also reject `_main`. A created `refactor.json` gets `goal: "replatform"`, as § 2.1 step 4 and 03 § 11 say. |
| concreteness#28 | `manifest.json` field types | fixed | 03:440 | Remote baseline: `commit` `null`, `services` `[]`. |
| concreteness#29 | `schemaRef` | adapted | 03:467 | Pointer into the contract API-002 validates against, not "latest released". Absent = the schema the contract declares for that operation/status/media type. The proposed "absent → only status and jsonPath" would weaken API-002's "body schema" check, so it was not adopted. |
| concreteness#30 | SARIF `tool.driver` | fixed | 03:553 | |
| concreteness#31 | `expiringSoon`, `handoff` shapes | fixed | 03:549 | `part` is `null` for a waiver without `part`. |
| concreteness#32 | `$schema` value | adapted | 03:9 | No schema-name list exists for most files, so shipgate writes `$schema` only into `policy.json` and the `business.json`/flow templates (`<kind>` = `policy`/`business`/`flow`). Every other written file has none. Readers ignore the value. The domain is an Operator decision (default as proposed). |
| concreteness#33 | `expectEmail` timeout | fixed | 03:349, 03:382 | |
| concreteness#34 | `inventory` flags/output | fixed | 05:27 | |
| concreteness#35 | `business.json` required keys | fixed | 03:470 | Also types `emails` entries as email addresses (needed by consistency#47's `emails[]` oracle). |
| consistency#21 | live-mode oracle ↔ 03 § 8 | adapted | 03:310 | 03 § 8, the single definition, now names `commands.snapshot` output and live-snapshot rows not written only by locked seeds as non-Operator-owned, with the outcome "one blocking `missing-element` per family owned by `operator`". The programmatic.md / 04:406 / 01:133 edits are the programmatic, algorithms and core fixers' (their files lead the Location). |
| consistency#26 | TST-007 ↔ `security.ownership` | adapted | 03:310 | 03:310 already excluded "fixture paths outside `quality/fixtures/`"; it now names `security.ownership` explicitly. The TST-007 text is the testing fixer's. |
| consistency#27 | 03 § 3.5 security defaults | fixed | 03:129 | |
| consistency#47 | TRS-001 ↔ Operator-owned sources | adapted | 03:310, 03:470 | 03 § 8 gives a homepage `Organization` `telephone` as an example of a non-oracle; `emails` entries typed. The TRS-001 and 04:35 text belongs to the web-delivery and algorithms fixers. |
| consistency#58 | LOC-004 / DAT-018 review targets | adapted | 03:550 | Targets listed undrawn, outside the 20; the Auditor answers each for that rule only. The LOC-004/DAT-018 text belongs to the programmatic-search fixer. |
| consistency#61 | lock digest ↔ CI (Blocker) | fixed | 03:312, 05:10, 05:203 | `SHIPGATE_VERIFY_ENV` CI setting. The template writes the file before `verify`; a mismatch → invalid lock, `decisionsNeeded` kind `lock`. |
| consistency#63 | untracked git hook files in lock | fixed | 03:308, 05:173 | Only git-tracked hook files are locked. `hooks check` compares expected entries for every hook file and lock hashes for locked ones. |
| consistency#66 | `data-api.db` ↔ services | fixed | 03:309 | Depends on the data-api fixer adding `data-api.db.service` (same row). |
| consistency#67 | SMTP sink presence | fixed | 03:111 | Default `true`; `false` rejected (CFG-001) under the listed uses. 01:149 belongs to the core fixer. |
| consistency#68 | page locale ↔ pack enablement | rejected | — | Nothing to change in 03/05: 03:64 ("enabled iff its key exists") and 03:123 are correct as written. The fix is 04:470 (`und` locale), the algorithms fixer's (04 leads the Location). |
| consistency#69 | DB-011 seed ↔ Operator-owned | adapted | 03:310 | 03 § 8 names data-api `firebase.seed` outside `quality/fixtures/` as non-Operator-owned. The data-api.md text belongs to the data fixer. |
| consistency#82 | ux "no default" keys | fixed | 03:137 | |
| consistency#89 | URL-011 applicability | rejected | — | No 03/05 change needed: 05:124 already scopes launch checks to `project.stage: "live"`. The fix is URL-011's text in web-delivery.md (web-delivery fixer). 05:124 also gained SEC-065/UX-022 (#108). |
| consistency#99 | hub inventory `locale` / sort | fixed | 03:456, 03:459 | 04:470 page-locale clause belongs to the algorithms fixer. |
| consistency#100 | `facets.*` default | fixed | 03:124 | |
| consistency#102 | report `specVersion` | fixed | 03:532 | `7.6.0` = SPEC.md:4 today; the orchestrator bumps both if the version changes this round. |
| consistency#103 | coverage counts | fixed | 03:536, 03:549 | `blocked` added; `experimental` defined (merged with concreteness#10). |
| consistency#104 | warning codes | fixed | 03:549 | All four codes confirmed in 04:184, :246, :308. |
| consistency#105 | repo-id twice | fixed | 03:494 | Cites 04 § 15 *repo-id* (04:476). |
| consistency#106 | groupKey components | fixed | 03:199 | `migrationFile`, `table`, `locale`. |
| consistency#107 | git `-d main` | fixed | 05:150 | Same edit as concreteness#2. |
| consistency#108 | launch-check list | fixed | 05:124 | 01:140 belongs to the core fixer. |
| consistency#109 | SPEC.md decision log `dependency` | xfile | xfile § 6 | SPEC.md is not in {FILES}. |
| consistency#110 | PRF-011 "first account" | adapted | 03:158 | General rule in 03 § 4: account order = id byte order. PRF-011 text belongs to the perf fixer. |
| consistency#111 | `verify.env` reads | adapted | 05:166, 05:170, 05:137, 03:507 | Claude Code PreToolUse adds `Read\|Grep\|Glob`; Antigravity adds `view_file`. New *Read-protected* rule: read events on the `secretsFrom` file are denied for every role, with the honest limit that shell reads can't be stopped. 03 § 16 maps Grep/Glob `tool_input.path`. 01:99 belongs to the core fixer. |
| consistency#112 | licence handoff vs Builder work first | fixed | 05:251 | |
| consistency#113 | Firebase emulator toolchain | fixed | 03:566 | 01:143 belongs to the core fixer. |

## Ownership rows
None (no new rule IDs or parts).

## Ruleset data
None.

## Policy keys added (key · type · default · file)
- adapter `bundleManifest` · `[{ glob, reader }]` (was glob[]) · `[]` · 03 § 6
- adapter `fileRoles` · `[{ glob, role }]` (was object) · required · 03 § 6
- adapter `schemaDriftCommand` · § 3.2 command value \| null (placeholders `{db.url}`, `{db.<id>.url}`) · `null` · 03 § 6
- flow step `waitFor` · `{ urlEquals }` \| `{ urlMatches }` (replaces `{ url }`) · — · 03 § 10
- refactor `allowedChanges[kind=flow].steps` · string[] (§ 10 step indices; was int[]) · every step · 03 § 11
- `verifyEnv.auth.*` · defaults stated (no new keys) · absent `auth` ≡ `{ strategy: "none", accounts: {} }` · 03 § 4
- `verifyEnv.smtp.enabled` · bool · `true` (was conditional) · 03 § 3.4
- `business.json` `name` · string · required · 03 § 14
- inventory `hub` line `locale` · BCP 47 tag · — · 03 § 13
- report `coverage.<svc>.blocked` · int; `rules[].reason`, `rules[].experimental` · — · 03 § 17
- CLI: `init --yes`, `migrate --ruleset <YYYY.MM[.N]>`, `doctor --adapters`, `keys init --label <text>`, `inventory --family <id>` · — · 05 § 1
- CI setting `SHIPGATE_VERIFY_ENV` · string (file content) · — · 05 § 1, § 5
- exit-3 error ids: `ruleset-not-embedded`, `baseline-exists`, `unsupported-format` · — · 05 § 1

## spec-lint
`node tools/trace/spec-lint.mjs` (last three lines):
```
spec-lint: {"requirements":575,"rules":556,"toolRequirements":19,"rulesWithParts":201,"errors":27,"warnings":64}
  errors by check: ownership=27
  warnings by check: ruleset-unsourced=64
```
None of the 27 errors comes from 03/05. 26 are new rule IDs that other fixers added this round and that still need orchestrator rows in `trace/ownership.tsv`: A11-031..033, AEO-015, OPS-015/016, PRV-038..042, TPL-008, SE-010/011/115/129, SEC-076..079, UX-025..027, URL-015, MET-014, I18-011. The 27th is AGT-011 part `behaviour`, which needs a `part:` row (owner WP-608). The `ruleset-unsourced` warnings are ruleset files named by other packs that still need WP-104 rows. Neither 03 nor 05 names any of them.
