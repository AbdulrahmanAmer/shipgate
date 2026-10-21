# Resolution — core-adapters-ux — pass A — round 06

Files: spec/01-core.md, spec/02-adapters.md, spec/packs/ux.md. Cross-file edits: `audit/rounds/06/xfile/from-core-adapters-ux.md` (C1–C9).

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-core-adapters-ux#1 | UX-015 | adapted + xfile | ux.md:42; xfile C2 | Auditor text applied. Adapted: a price id that differs from `providerId` is not on its own a failure when the amount matches (the rule accepts either match), so the builder-owned `value-mismatch` is "no line item matching either way". UX-015 added to the 04 § 1.2 required-facts list (C2). |
| concreteness-core-adapters-ux#2 | UX-001 / UX-006 | fixed | ux.md:30, :34 | Form discovery covers buttons anywhere in the document; the click probe also clicks footer/aside/dialog buttons, judged by the dead test. |
| concreteness-core-adapters-ux#3 | § 5.4, TR-103 | adapted + xfile | 01-core.md:120, :251; ux.md:40, :41, :47, :56; xfile C3, C4 | Adapted: "later of reference time and wall clock" is used for dates that must not have passed yet (expiries, activation dates such as UX-013 `green`). For dates that must already have happened (`consentedOn`, `confirmedOn`), the *earlier* clock applies, so a forward-dated commit can't make them pass. Wall-clock outcomes are never served from the cache (01 § 5.4; 04 § 16 via C4). |
| concreteness-core-adapters-ux#4 | TR-103 | fixed | 01-core.md:252 | ChaCha8 seeded with SHA-256(lock digest ‖ label); labels and Fisher–Yates procedure defined; use sites listed. |
| concreteness-core-adapters-ux#5 | TR-111 | adapted | 01-core.md:268 | The performance fixer already split PRF-001 into `lcp`, `cls`, `tbt`, `seo` (script bytes moved to PRF-010) and gave CRW-001 its slow-host sentence (performance.md:34, programmatic.md:232). TR-111 now names those parts (`lcp`, `tbt` skipped; `cls`, `seo`, PRF-010 always run) instead of the auditor's `script-bytes`/`seo-score` names. PRF-002 `main` and `probe` named. Also covers xfile requests from-privacy-a11y-perf X7 and from-programmatic-search X5 (pass B will record them). |
| concreteness-core-adapters-ux#6 | TR-111 | fixed | 01-core.md:270 | |
| concreteness-core-adapters-ux#7 | TR-112 | fixed | 01-core.md:265 | Roles from 04 § 7.1 plus `**/*.{md,mdx,markdoc}`. |
| concreteness-core-adapters-ux#8 | TR-112 | adapted | 01-core.md:266 | The accessibility statement *is* backed by a rule: PRV-017 (`legalPages.accessibility`, with `eu-eaa`, privacy.md:63). Kept it, citing PRV-017, instead of removing it. |
| concreteness-core-adapters-ux#9 | § 5.5 | fixed | 01-core.md:123 | 03 § 9 example already has the three arrays (formats fixer); 05 § 1 already gives exit 2 for a refused `debt add`. Added that `debt add` refreshes the arrays. |
| concreteness-core-adapters-ux#10 | § 10.2 Auditor | fixed + xfile | 01-core.md:241; xfile C5 | `auditTargets` added to the 03 § 17 report example via C5. |
| concreteness-core-adapters-ux#11 | CFG-002 | adapted | 01-core.md:132 | The proposed "`build`/`typecheck` when the adapter declares a default" is vacuous after defaults, and "`coverage` when TST-011 applies" is circular (TST-011 applies only when `coverage` is set). Replaced by: required `start`/`migrate`/`snapshot`; adapter-default commands can't be removed (`null`/`""` is a finding); every other absent command makes its rule `notApplicable` (BLD-001..004, TST-011). |
| concreteness-core-adapters-ux#12 | CFG-006 | fixed | 01-core.md:136 | Failure class `schema-violation` added. |
| concreteness-core-adapters-ux#13 | CFG-009 | fixed | 01-core.md:139 | |
| concreteness-core-adapters-ux#14 | AGT-006 | fixed | 01-core.md:191, :196 | AGT-001 now excludes the AGT-006 paths. Channels `html` and `data` dropped (no check behind them; invented page facts are owned by the facts-oracle rules and the programmatic oracle). Ownership row `AGT-006 channel:html` must go (see below). |
| concreteness-core-adapters-ux#15 | AGT-005 | fixed | 01-core.md:195 | `url-remove`, `api-status`, `flow` exist in 03 § 11. |
| concreteness-core-adapters-ux#16 | AGT-011 | fixed | 01-core.md:200 | `envReadApis` exists (03 § 6); test files = role `test` (04 § 7.1). |
| concreteness-core-adapters-ux#17 | AGT-009 | fixed | 01-core.md:199 | |
| concreteness-core-adapters-ux#18 | 02 § 2 | fixed | 02-adapters.md:19 | |
| concreteness-core-adapters-ux#19 | 02 § 2, § 3 | fixed + xfile | 02-adapters.md:55, example :32–33; xfile C6 | 03 § 6 already had `priority` and "all given members must match" for `detect`; it lacked `role`, added via C6. Explicit adapter lists: an addon first, or two primaries, fails CFG-002. |
| concreteness-core-adapters-ux#20 | 02 § 4 | fixed + xfile | 02-adapters.md:62; xfile C7 | Same per-rule tier cap appears in 03 § 6 `regexSinks`, so C7 corrects it there too. |
| concreteness-core-adapters-ux#21 | 02 § 5 traps | adapted | 02-adapters.md:69–88, :90 | Each trap now says what is observed and which rule it guards (inline `→ ID`; the sentence after the table ties it to `guards: [<ID>]`). Auditor mapping corrected where it was wrong: RTE-012 is reproducible builds, so non-literal segment config and `cacheComponents` exports guard BLD-004 (Next fails the build on them); `params` read without `await` guards RTE-006; `middleware.*`/`proxy.*` kept as an entry-point note, not a trap. Hosted-builder script bloat → PRF-010 (byte budgets moved there). |
| concreteness-core-adapters-ux#22 | UX-020 `timer` | adapted + xfile | ux.md:52, :61; 01-core.md:251; xfile C1 | Adapted: `clock.install` at T and T+60 s would show a false `reset` for any server-rendered countdown (the server uses the real clock). Now uses two reads ≥ 60 s of real wall-clock time apart (one wait per run). Deadline formula, resolution, `reset`/`unbacked` thresholds, `parse-error`, and `countdown-markers` shape defined. Wall-clock dependence listed in TR-103. `timer` added to the 04 § 1.2 facts-oracle list (C1). |
| concreteness-core-adapters-ux#23 | UX-020 `social-proof` | fixed | ux.md:16, :54, :61 | Added the `{ db, query }` source check (number equality) as well as `hosts`; `social-proof-widgets` entry shape defined. |
| concreteness-core-adapters-ux#24 | UX-019 `marks` | fixed | ux.md:47 | `validUntil` uses the expiry clock (01 § 5.4); failure classes given. |
| concreteness-core-adapters-ux#25 | UX-019 `logo-wall` | fixed | ux.md:48 | Names are normalised the same way as the image text. |
| concreteness-core-adapters-ux#26 | UX-020 `stock` | fixed | ux.md:61 | |
| concreteness-core-adapters-ux#27 | UX-005 | fixed | ux.md:33 | Shape defined in UX-005; adapter `errorPageFingerprints[]` shares it. |
| concreteness-core-adapters-ux#28 | UX-010 | fixed | ux.md:38 | |
| concreteness-core-adapters-ux#29 | UX-008 | adapted | ux.md:36 | The adapter `bundleManifest` has no polyfill marking, so the exclusion goes by the package a module comes from (source maps or `bundleManifest`): `core-js`, `regenerator-runtime`, `@babel/runtime`, `tslib`, any package with `polyfill` in its name. The CSS half also gets a decision procedure. |
| concreteness-core-adapters-ux#30 | UX-009 | fixed | ux.md:37 | |
| concreteness-core-adapters-ux#31 | UX-015 | fixed + xfile | ux.md:42; xfile C8 | |
| concreteness-core-adapters-ux#32 | 02 § 2 | fixed | 02-adapters.md:17, :23 | |
| concreteness-core-adapters-ux#33 | 02 § 6 | fixed | 02-adapters.md:94 | |
| concreteness-core-adapters-ux#34 | CFG-009 | fixed | 01-core.md:139 | Parts `main` P0, `existing-site-unprotected` P1 (operator, edge), `rebuild-check-off` W, `launch-checks-off` W. |
| concreteness-core-adapters-ux#35 | CFG-004 | fixed | 01-core.md:134 | |
| concreteness-core-adapters-ux#36 | UX-004 | fixed | ux.md:32 | Parts `links`, `contact-path`. |
| concreteness-core-adapters-ux#37 | UX-003 note | fixed | ux.md:63 | |
| concreteness-core-adapters-ux#38 | UX-005 / UX-021 / UX-006 | adapted | ux.md:33, :55, :34 | RTE-004 defines the "Unknown URL" case but no probe URL, so UX-005 sets one: mount root + `sg-probe-404/sg-probe-404`. UX-021 and UX-006 as proposed. |
| coverage-r05-carryover#2 | UX-022 (new) | adapted + xfile | ux.md:56; 01-core.md:120; xfile C2, C9 | Adapted for STANDARD C10: the proposal used `quality/audit/review.json`, which the Auditor (an agent) writes, so an agent could confirm its own forms. Confirmations now live in Operator-owned, lock-covered `quality/approvals/launch-forms.json` (format via C9). Channel `edge` instead of `review`, because 04 § 1.7 makes review-only rules W, which would lose the P1. Form key built from Operator-owned flows. Applies with `project.stage: "live"` + `edge.production: true`; the "no IDX-011/SEC-065 blockers" precondition was dropped because those failures block the run anyway. Operator-owned `missing-element` gets added to the required-facts list (C2), so the run ends in an `operator-owned` handoff. |
| lint.json (round 06) warnings for 01-core / 02-adapters / ux | — | rejected (none) | — | lint.json has 19 warnings and none is in these three files (all are in performance, privacy, search-engines, security, web-delivery). The current lint run also shows no warning in these files. |
| DECISIONS D-002 | § 10.1 Done | fixed | 01-core.md:232 | Done = a `verify` without a partial cause; cached results count only with an equal environment hash. 04 § 16 still says `--no-cache` for the definition-of-done run; that line belongs to the algorithms fixer (D-002). D-001, D-003, D-004 don't touch these files. |

## Ownership rows
```
UX-022	*	WP-414	edge-pass check of quality/approvals/launch-forms.json; form keys derived from WP-602 flows (WP-609 owns the ux pack, but its deps don't reach WP-414, so channel-infra would warn)
```
- Remove: `AGT-006	channel:html	WP-410	resolved` (AGT-006 now has only the `diff` channel; the lint error below is caused by this row).
- CFG-009 new parts need no rows: `existing-site-unprotected` is on the `edge` channel (existing `CFG-009 channel:edge WP-414` row), and `rebuild-check-off`/`launch-checks-off` are `cfg` (the `*` row, WP-203).
- UX-004 parts `links`/`contact-path` and UX-020 `timer` sub-conditions stay with the `*` rows (WP-609).

## Ruleset data
No new ruleset files. Shapes now defined for files already sourced in BUILD_MAP WP-104 (the orchestrator may want to copy the shapes into those bullets):
- `stock-count-phrases`, `countdown-markers`, `social-proof-widgets` — WP-104 "Round-4 data" (shapes: ux.md § 3).
- `trust-marks.json` — WP-104 "Round-3 data" (entry shape + dHash threshold: ux.md UX-019).
- `error-pages` — WP-104 "UX and analytics" (fingerprint shape: ux.md UX-005).

## Policy keys added (key · type · default · file)
- `ux.socialProofSources` · `[{ widget: <social-proof-widgets id>, route?: pattern, source: { hosts: [host] } | { db, query } }]` · no default (was untyped `[]`) · spec/packs/ux.md
- Adapter manifest `role` · `"primary" | "addon"` · required · spec/03-formats.md § 6 (xfile C6; example in 02-adapters.md)
- Not a policy key, a new Operator file: `quality/approvals/launch-forms.json` · `{ formatVersion, forms: [{ key, result, confirmedOn, note? }] }` · absent = no confirmations · spec/03-formats.md § 14 (xfile C9), used by UX-022

## spec-lint (last three lines)
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":142,"errors":5,"warnings":73}
  errors by check: ownership=5
  warnings by check: ruleset-unsourced=68 channel-infra=5
```
Errors from this group, both expected and waiting on orchestrator rows: `AGT-006 channel:html (ownership.tsv:31) is not a channel of the rule [diff]` (remove the row) and `UX-022 (spec/packs/ux.md:56) has no owning work package` (add the row above). The other three ownership errors (REF-014, SEC-067, CQ-010) belong to other groups' new rules. None of the 73 warnings is in 01-core, 02-adapters or ux. The count moves between runs because other fixers are editing at the same time.
