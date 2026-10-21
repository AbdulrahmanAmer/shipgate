# Resolution — formats-integrations — pass A — round 07

Inputs: `concreteness-formats-integrations.md` rows 1–30 (all), `consistency.md` rows whose Location names 03 or 05 (12, 13, 22, 29, 36, 49, 68, 70, 71, 73, 77, 84, 85, 86, 96, 102, 103, 105, 106, 109, 110, 112, 116, 117, 118, 119, 120, 122, 123, 124, 125, 126, 127, 128, 129, 135), plus the orchestrator note on consistency#13 (every Operator-owned source must be a lock input, or a rule must stop treating it as one). Cross-file requests: `xfile/from-formats-integrations.md` §§ 1–25.

**Operator-owned sources (orchestrator note).** Resolved by one definition in 03 § 8 (*Operator-owned sources*, 03:298): a file is an oracle only when it is a lock input under `quality/` or an `appliedMigrations` file; seeded rows only when a locked seed file inserted them and no other statement wrote them before the read. Seed files under `quality/` became lock inputs (03:296, 03:105). Sources that stay agent-writable are named as **not** Operator-owned, with the rule that must stop using them: seed files outside `quality/` and `run` seeds, new migrations and service-written rows (UX-020 `stock`/`social-proof` `db`: unmapped); `merchantFeed`/`agenticFeeds` outside `quality/data/` (UX-020 `feed`: unmapped); programmatic `dataset`/`retired` outside `quality/data/` (CFG-001, xfile § 3); `testing.flows`/contracts/fixtures outside their `quality/` dirs (TST-007, xfile § 4). ux.md:54/:56 already cite 03 § 8 *Operator-owned sources*. 04 must log seed/start-up writes to make the row rule decidable (xfile § 1).

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness#1 | 05 § 3.2 git deny patterns (Blocker) | fixed | 05:132, 05:141 | `-f*\|-[!-]*f*`, `-d*\|-[!-]*d*`, `-n*\|-[!-]*n*`, `-D*\|-[!-]*D*`; notation rule (two alternatives per flag), fail-closed note for attached values, deny/pass conformance fixtures (incl. `git branch -D main` / `-d feature`). Hand-checked each fixture against 03 § 2.4. |
| concreteness#2 | 03 § 1 vs § 12 sidecars | fixed | 03:9 | Baseline files other than `manifest.json` carry no `formatVersion`; `cycles.json` exempt from `items`. |
| concreteness#3 | lock hashing CRLF | adapted | 03:11, 03:297 | Rule placed in § 1 (*File hashes*, applies spec-wide) and cited from § 8. Text extension list extended with source-code types used by migration formats (`.ts .py .rb .php .prisma …`) and extension-less files; download checksums stay raw. |
| concreteness#4 | 03 § 4 `command`/`header`/`none` | adapted | 03:159–161 | As proposed, plus `timeoutSec` default 60, run at 04 § 4.2 step 6, cookie `domain` default; empty rendered header → `BLOCKED(seed-contract)`; `none` with non-empty `accounts` → CFG-001 (instead of "ignored", which would hide a misconfiguration). |
| concreteness#5 | 03 § 10 flow keys | fixed | 03:331 | Id pattern + stem equality, reserved `_login`, `service` default, CFG-001 cases (incl. unknown `journey`), order "within a stage" (04 § 4.2 runs flows in stages). |
| concreteness#6 | 03 § 10 text comparison | fixed | 03:371 | Case-sensitive NFC + whitespace collapse; `regex` mode defined; `contains` list = every entry; PDF text layer; `unsupported-download-type`. |
| concreteness#7 | 03 § 10 `waitFor`/`stubNetwork`/`upload` | fixed | 03:346, 03:347, 03:361 | `body` optional, default `""`. |
| concreteness#8 | 03 § 7.1 keychain names | fixed | 03:271–272; 05:47 | Keychain service/accounts, Linux fallback files, `--key <fingerprint>`, `ambiguous-key` exit 3. |
| concreteness#9 | 03 § 7.3 `cache.dir` | adapted | 03:281 | Default `<cache dir>/shipgate` (`dirs::cache_dir()`, matching TR-001 "user cache"), layout `toolchain/…`, `downloads/…`. Gate results are **not** moved: 04 § 16 keeps them in `quality/out/cache/<gate>/` (proposed `results/` would contradict 04 § 16). |
| concreteness#10 | 03 § 3.1 `$schema`/`policyVersion` | fixed | 03:53–54 | |
| concreteness#11 | 03 § 8 entry formats | fixed | 03:297 | `appliedMigrations` uses `data-api.db.migrations.dir`, else the adapter's `migrations.dir` (04 § 4.2 step 4 override). Example `sha256` value now prefixed (03:292). |
| concreteness#12 | 03 § 12 field values | adapted | 03:427–428 | Values taken from the raw HTTP response with refactor § 1 tokens applied; normalised main text matches AEO-012 (NFKC, `<time>` and visible dates removed); `kind` defined; `thirdParty[].event` uses ruleset `analytics-vendors`/`ux.analyticsMatchers` (refactor § 2) instead of a hard-coded GA4/Meta/GTM list. |
| concreteness#13 | 03 § 14 business types | adapted | 03:453 | As proposed, plus `closes: "24:00"`, `clients/press[].url`, `certifications[].evidence`; unknown keys CFG-001 except `formatVersion`/`$schema`. |
| concreteness#14 | 03 § 17 finding / arrays | fixed | 03:521–522, 03:531 | Example finding gains `part`, `channel`, `failureClass`; element shapes of `warnings` (with the codes used in the spec), `waiversApplied`, `overridesActive`, `dependenciesAdded`. |
| concreteness#15 | 03 § 17 SARIF/JUnit/summary | fixed | 03:533, 03:535, 03:536 | Output files always written; SARIF `result` mapping (adds `status` to `properties`); JUnit `failure` content. |
| concreteness#16 | 03 § 18 locale detection | fixed | 03:544 | |
| concreteness#17 | 03 § 19 `snapshots.json`, archives | fixed | 03:548 | Also rejects a `release` ≠ running version; symlink escape rejected. |
| concreteness#18 | 05 § 1 flags, `check`, `--hook`, `--timeout` | fixed | 05:13–14, 05:22 | `--fingerprint` added to repeatable flags. |
| concreteness#19 | 05 § 1 re-lock list | adapted | 05:45 | `init` signs at its own `lock` steps (sub-steps don't re-lock), so § 2 needs no change; `conformance` moved to "signs without re-locking" (its result is now a self-signed file, 03 § 6, consistency#110); `codegen` signs nothing; failed re-lock behaviour defined. |
| concreteness#20 | 05 § 1 `report-fp`, `doctor --bundle` | fixed | 05:42, 05:67 | Production hosts = `production.origins` + `production.hosts`; `browser` channel included; paths outside repo → `⟦path⟧`. |
| concreteness#21 | 05 § 1 `<ext>`, multi-service | adapted | 03:253; 05:65–66 | `codegenExt` adapter field added. Per-service `quality/generated/<service id>/` only when several services have codegen; single-service paths unchanged, and family types stay at `quality/generated/types/<family>.<ext>` so the round-06 `types-from-policy` decision and DAT-001 `types` stay valid. |
| concreteness#22 | 05 § 2.1 presets | adapted | 05:107–108, 05:111 | Presets name real `features` values; "EU" = `eu-gdpr`, `eu-eaa`, `de`, `at`. Did **not** narrow other kinds to `["organization","breadcrumb"]`: every kind gets the pack-default list (narrowing would silently drop coverage); the rows say which entries `init --new` never removes. |
| concreteness#23 | 05 § 3.3 install/merge/check | fixed | 05:164 | Timeouts derived from `timeBudgets` (+5 s, consistent with 04 § 8 "host timeout − 5 s"); drift = lock hash mismatch of the hook file. |
| concreteness#24 | hook output envelopes | adapted | 03:498–507 | Table in 03 § 16 for all six hosts (Claude Code rows exact; others from the 05 § 3.3 signal names, confirmed by WP-101); per-row conformance test. Dropped the proposed `stopRepeated` special case (consistency#117: `stopRepeated` is informational). |
| concreteness#25 | 05 § 5, § 7 install/assets/self-update | fixed | 05:192, 05:217–219 | Release host = GitHub Releases (already the 05 § 7 choice, so no Operator decision is open). |
| concreteness#26 | 05 § 8 seats/tokens | fixed | 05:228–229 | |
| concreteness#27 | 05 § 4 MCP `waitSec`/`reportUri` | fixed | 05:183 | |
| concreteness#28 | 03 § 2.2 glob semantics | fixed | 03:32 | |
| concreteness#29 | 03 § 3.2 `path`/`url`, `trailingSlash` | fixed | 03:79, 03:90 | `trailing-slash-assumed` listed among report warning codes (03 § 17). |
| concreteness#30 | 03 § 11 `goal` | fixed | 03:385 | `baseline` must also hold a validly signed manifest. |
| consistency#12 | CQ-010 fetch-store writer | rejected (orchestrator's) | — | Fix targets BUILD_MAP/ownership only; 03 § 15 and 05 § 3.3 already define the writer (03:477, 05:153). |
| consistency#13 | UX-020 "Operator-owned" sources ↔ lock | adapted + xfile | 03:298, 03:296, 03:105, 03:456; xfile §§ 1–4 | See the paragraph above. ux.md already updated by its fixer to cite 03 § 8. |
| consistency#22 | stub-scan vs identifiers | rejected (orchestrator's) | — | BUILD_MAP § 4.1 item 7 only. |
| consistency#29 | LOC-001 vs required addresses | xfile | xfile § 6 | 03:455 already says these addresses use LOC-001 containment; the rule text is search-engines'. |
| consistency#36 | `uk-consumer` scope | fixed | 05:107 | "(order-button wording, price indication, drip pricing: PRV-023, PRV-026)". |
| consistency#49 | missing feed owner | adapted | 03:456, 03:458 | Builder-owned, operator only outside `writeScope` (as search-engines.md:61–62 already reads); added that only a feed under `quality/data/` is an Operator-owned source. xfile § 25 notes the "04 § 14" citation should be 04 § 15. |
| consistency#68 | `remote` metadata, parts | fixed + xfile | 03:174, 03:195; xfile § 13 | `parts[].remote?` (default: the rule's); 04 § 15 list via xfile. |
| consistency#70 | SEC-067 signup-flow cut | xfile | xfile § 7 | Rule text is security's. |
| consistency#71 | `smtp.enabled` default | fixed | 03:109 | Defined by step kinds (`expectEmail`, `openEmailLink`) and the listed rules. |
| consistency#73 | logout journey | fixed (+ note) | 03:325, 03:332 | `logout` added to the enum; SEC-028 already reads it (xfile § 8, with an ownership note). |
| consistency#77 | `api-status` reference | fixed + xfile | 03:399; xfile § 24 | REF-004 keeps the baseline; API-004 uses the latest released contract. |
| consistency#84 | static part severities | adapted + xfile | 03:174; xfile § 9 | 03 § 5 comment states the rule; splits are security's/04's. |
| consistency#85 | `tokenTtlVar` units/consumers | fixed + xfile | 03:153; xfile § 10 | |
| consistency#86 | `requestSources` | fixed + xfile | 03:254; xfile § 11 | |
| consistency#96 | unused `idempotencyKey`/`upstreamMs` | fixed + xfile | 03:464; xfile § 12 | data-api.md:40 already has no `idempotencyKey`. |
| consistency#102 | command timeout | fixed | 03:86–87 | `timeoutSec` default 900; each command mapped to the rule that owns its failure (BLD-001..005, DB-001 `apply`, TST-011). |
| consistency#103 | toolchain cache protection | fixed | 05:127; 03:281 | |
| consistency#105 | `init --new` sequencing | fixed | 05:113 | |
| consistency#106 | REF-011 with remote baseline | fixed + xfile | 03:430; 05:113; xfile § 14 | |
| consistency#109 | ARC-010 owner | xfile | xfile § 23 | 05:121 unaffected. |
| consistency#110 | conformance result format | adapted + xfile | 03:259 | File at `quality/conformance/<id>.json` (committed, so CI can verify it; a state-dir file would leave CI without a tier), self-signed, not a lock input (no circularity). Validity matches 02:19 (both hashes, else tier 3). 01 § 5.2 row via xfile § 16. |
| consistency#112 | `inventory` actor | xfile | xfile § 17 | 05:25 already says "anyone (licence-free)". |
| consistency#116 | ROL-003 CLI syntax | xfile | xfile § 19 | 05:55 positional `<family>` kept. |
| consistency#117 | hook event mapping, `stopRepeated` | fixed | 05:14, 05:153; 03:483 | |
| consistency#118 | `check` outside hook mode | fixed | 05:14, 05:22 | |
| consistency#119 | `decisionsNeeded.kind` | fixed | 03:470 | Adds `environment`, `lock` with their meaning. |
| consistency#120 | debt expiry for † | fixed | 03:316; 05:59 | |
| consistency#122 | health semantics | xfile | xfile § 20 | 03 § 3.4 already matches the proposed text; only 04 changes. |
| consistency#123 | `specVersion` | fixed | 03:514 | `7.5.0` (SPEC.md:4). |
| consistency#124 | telemetry list | fixed | 05:241 | |
| consistency#125 | review entries per rule | fixed + xfile | 03:532; xfile § 18 | |
| consistency#126 | REF-001 remote `commit` | xfile | xfile § 15 | |
| consistency#127 | TST-007 lock coverage | xfile | xfile § 4; 03:298 | 03 § 8 lists such paths as non-oracles. |
| consistency#128 | TST-008 browsers | xfile | xfile § 5 | |
| consistency#129 | `--resume` | xfile | xfile § 21 | 05:21 unchanged. |
| consistency#135 | CQ-010 cross-reference | xfile | xfile § 22 | |

## Ownership rows
None. No new rule IDs or parts in 03/05.

## Ruleset data
None new.

## Policy keys added (key · type · default · file)
- `services[].commands.<name>.timeoutSec` · integer (seconds) · `900` · 03 § 3.2
- `verifyEnv.auth.command` object form `timeoutSec` · integer · `60` · 03 § 4
- flow `journey` value `logout` · enum member · — · 03 § 10
- rule metadata `parts[].remote` · `read\|write\|none` · the rule's `remote` · 03 § 5
- adapter `codegenExt` · string · required when `codegen` non-empty · 03 § 6
- adapter `requestSources` · ApiRef[] · `[]` · 03 § 6
- user config `cache.dir` default · path · `<cache dir>/shipgate` · 03 § 7.3
- CLI `--key <fingerprint>` (Operator commands) · string · the only key · 05 § 1 / 03 § 7.1
- report `decisionsNeeded.kind` values `environment`, `lock` · enum · — · 03 § 15
- file `quality/conformance/<id>.json` · Operator-signed JSON · — · 03 § 6

## spec-lint
`node tools/trace/spec-lint.mjs` (last three lines):
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":30,"warnings":64}
  errors by check: ownership=23 channel-infra=7
  warnings by check: ruleset-unsourced=64
```
None of the 30 errors comes from 03/05. `ownership` (23): new rule IDs added this round by other fixers (A11-030, PRV-029..037, DAT-018, CRW-004, RES-008, SE-128, LOC-004, SEC-074/075, UX-023/024, RTE-016/017, URL-014, I18-010) awaiting orchestrator rows in `trace/ownership.tsv`. `channel-infra` (7): DAT-006 → WP-502, SE-002/SE-501 → WP-411, SCH-006/SCH-010/TRS-002 → WP-410 lack BUILD_MAP dependencies (orchestrator's; consistency#4 made this check an error). `ruleset-unsourced` warnings are ruleset files named by other packs, pending WP-104 rows.
