# Resolution — security — pass A — round 07

Inputs: all 26 rows of `concreteness-security.md`; the 23 rows of `consistency.md` whose Location names `spec/packs/security.md` (68–74, 76, 79, 82–95); coverage-real-use #4 and #15 (pack security). `coverage-visibility.md` has no security rows (grep: no `SEC-`/`security ·` entries). Line numbers are for `spec/packs/security.md` after this pass.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-security#1 | SEC-028 | adapted + xfile | security.md:109; xfile X1, X2 | Merged with consistency#73: logout = flows with `journey: "logout"` (a new journey value, not a reserved `_logout.json`, so it uses the existing journey mechanism REF-013 also relies on). Kept #1's strength: no logout flow → builder-owned blocking `missing-element` (not #73's `notConfigured`). Added a pre-flow 2xx check so an already-dead session can't pass. The probe URL is the first `auth: required` group the account may access. 03 journey enum and TST-010 → xfile. |
| concreteness-security#2 | SEC-018 | fixed | security.md:99 | "Password-set inputs" defined; `maxlength` part and the no-flow outcome as proposed. |
| concreteness-security#3 | SEC-064 | adapted + xfile | security.md:152; xfile X4 | The effective value is the env variable's value when set, else the declared `<kind>Sec` (marked `unverified`), not "the smaller of the two": with "smaller", a declared 1 h and an app running 10 years would pass. Fails when the effective or the declared value exceeds the maximum. Unknown → operator-owned `missing-element` (required-facts, 04 § 1.2 → X4). `auth.strategy: "none"` → `notApplicable`. |
| concreteness-security#4 | SEC-023/036/037/043/044/048/057 | adapted | security.md:62 | Definition added as proposed, except SEC-023's B set: "every account ≠ X" would make a same-tenant colleague's legitimate read of an `owner: "tenant"` resource a finding. B is now every account the route's `owner` excludes (different tenant for `tenant`, ≠ X for `user`). |
| concreteness-security#5 | SEC-064/029/037/044 | adapted | security.md:47, :63, :110, :115, :142, :151 | The 03 fixer already applied consistency#85 ("holds the lifetime as integer seconds"), so the proposed `varUnit` key would contradict it. Adopted integer seconds as the only format and defined it once in shared definitions (*Lifetime variables*); other formats need an Operator wrapper in the service `env`. No `varUnit` key added. |
| concreteness-security#6 | SEC-067 | fixed | security.md:156 | Applies to every `saas` project; no signup flow → builder-owned blocking finding. |
| concreteness-security#7 | SEC-067 | adapted | security.md:156 | Merged with consistency#70: an explicit **cut point** (before the first `openEmailLink`, whole flow if none); the remaining steps run after the `gate` probe. |
| concreteness-security#8 | SEC-024 | fixed | security.md:105 | |
| concreteness-security#9 | SEC-007 | adapted | security.md:79 | As proposed, plus: `\u0000` written as `%00` (it is a query value); the oversized route is the lexicographically first write route; GET probes run in the read-only stage; 413 status cross-referenced to API-007. |
| concreteness-security#10 | SEC-005, SEC-050 | fixed + xfile | security.md:77, :160; xfile X8 | The 04 § 13 SEC-050 bullet is aligned via X8. |
| concreteness-security#11 | SEC-049, SEC-026 | adapted | security.md:18, :144 | Shape and six entries as proposed, plus `algorithm` per entry, `timestampHeader?`, `raw` = UTF-8 bytes, `jsonPath` list joined with `:` (Lemon Squeezy), and how `duplicate` rewrites the id and timestamp. |
| concreteness-security#12 | SEC-048/065/059/058/072/053/025 | fixed | security.md:143, :154, :133, :90, :177, :163, :106 | One shape sentence per file. The `cache-hit-headers.json` examples are now regexes. |
| concreteness-security#13 | SEC-012 | fixed | security.md:88 | |
| concreteness-security#14 | SEC-010 | fixed | security.md:85 | New part `hsts` (P1; channels http, edge). |
| concreteness-security#15 | SEC-019, SEC-029 | fixed | security.md:61, :100, :110 | "Default P" in shared definitions. |
| concreteness-security#16 | SEC-033 | fixed | security.md:114 | |
| concreteness-security#17 | SEC-037 | fixed | security.md:115 | |
| concreteness-security#18 | SEC-015 | fixed | security.md:92 | |
| concreteness-security#19 | SEC-013 | fixed | security.md:89 | |
| concreteness-security#20 | SEC-030 | fixed | security.md:111 | |
| concreteness-security#21 | SEC-025 | fixed | security.md:106 | Merged with the consistency#84 split (`rate-limit` / `rate-limit-edge`). |
| concreteness-security#22 | SEC-018 | fixed | security.md:99 | The text names the file (`the build of ruleset breached-passwords.txt`) to satisfy the spec-lint check `ruleset-unnamed`. |
| concreteness-security#23 | SEC-066 | fixed | security.md:155 | |
| concreteness-security#24 | SEC-036 | fixed | security.md:120 | |
| concreteness-security#25 | SEC-053 | fixed | security.md:163 | |
| concreteness-security#26 | SEC-073 | adapted | security.md:178 | Unscored entries go to a static W part `unrated` (as SEC-051), not "level unrated (W)", which would be an input-dependent severity (consistency#84). |
| consistency#68 | `remote` metadata | xfile | xfile X9 | The fix lies wholly in 04 § 15 / 03 § 5 (its primary Location). security.md already marks every mutating SEC rule or part with the stage phrase the proposed 04 text keys on. No security.md edit needed. |
| consistency#69 | SEC-029 / SEC-067 | fixed | security.md:110, :156 | |
| consistency#70 | SEC-067 `gate`/`email` | adapted | security.md:156 | Cut point adopted. Rejected the proposed "neither `openEmailLink` nor `expectEmail` → `notConfigured`": it would weaken `email`, which is judged from the SMTP sink whatever the steps. A link-verification flow with no `openEmailLink` step → builder-owned `missing-element` on `single-use`. |
| consistency#71 | `smtp.enabled` | rejected (already fixed) | 03-formats.md `smtp` row | Already applied by the 03 fixer: "`true` when any flow has an `expectEmail` or `openEmailLink` step, or SEC-025, SEC-038, SEC-039, SEC-054 or SEC-067 applies". |
| consistency#72 | SEC-054 / SEC-025 | fixed | security.md:131 | The burst set includes `mailEndpoints`. For `authEndpoints`, SEC-054 `mail` counts mail during SEC-025's burst and sends no burst of its own. |
| consistency#73 | SEC-028 | adapted + xfile | security.md:109; X1 | See concreteness#1: a builder-owned blocking finding instead of `notConfigured` (stronger). |
| consistency#74 | SEC-021 `override-headers` | fixed | security.md:102 | The 04 § 4.2 side is already applied by the 04 fixer ("SEC-021 `override-headers` (repetitions of non-GET/H…"). |
| consistency#76 | API-003 vs SEC-023 | rejected (already fixed) | data-api.md:51 | Already applied: "other-tenant requests answer 403 or 404 (whether access is refused at all: SEC-021/SEC-023)"; "Kinds (a) and (e) on SEC-030 fuzz requests are reported by SEC-030 `behaviour` only". No security.md change needed. |
| consistency#79 | API-007 | rejected (already fixed) | data-api.md:55 | Already applied: "Operations whose request media type is not `application/…` are excluded". SEC-032 `size` remains the upload limit. |
| consistency#82 | `db` gate | rejected (already fixed) | 04-algorithms.md:28 | Already applied: "one that reads the migrated database before the first probe (DB-001, DB-004, DB-009, DB-011 `emulator`, SEC-044 `policies`) …". |
| consistency#83 | SEC-043/044 external | rejected (already fixed) | 04-algorithms.md:211-212 | Already applied: "SEC-043/SEC-044 behaviour parts run only with `platform.supabase.mode: \"external\"` …". |
| consistency#84 | static part severities | adapted + xfile | security.md:106, :110, :115, :131, :142, :162, :163, :178; X5 | New W parts: SEC-025 `rate-limit-edge`, SEC-054 `requests-edge` (SEC-054 parts now named `requests`/`requests-edge`/`mail`; SEC-055 and SEC-062 updated), SEC-052 `licence-unknown` and `deprecated-unknown`, SEC-053 `age-unknown`, SEC-073 `version-unknown` and `unrated`. The token-lifetime parts (SEC-029 `expiry`, SEC-037 `expired`, SEC-044 `signed-url-expiry`) without `auth.tokenTtlVar` are now `notConfigured(auth.tokenTtlVar)` (a warning for these non-† rules, as before), not a W part that would test nothing. |
| consistency#85 | lifetime units | fixed (03 side already applied) + xfile | security.md:47, :63; X3 | See concreteness#5. |
| consistency#86 | request-derived data flow | fixed + xfile | security.md:75, :108, :123; X6 | SEC-003, SEC-027 and SEC-045 now cite "04 § 13 *Request-derived data flow*". 03 `requestSources` is already applied. The 04 § 13 definition, including SEC-062's model-output source, → X6. |
| consistency#87 | SEC-062 / SEC-001 | fixed | security.md:169 | |
| consistency#88 | SEC-054/055 channels | adapted | security.md:132 | SEC-055 → `http, html, browser`. SEC-054 stays `http`: it reads only HTTP responses and the SMTP sink. |
| consistency#89 | SEC-055 hidden | adapted + xfile | security.md:132; X10 | Uses 04 § 15 items 1–6, applied to the field itself whatever its text (the 04 definition covers elements with text). Its own off-screen definition is removed. X10 adds SEC-055 to 04's consumer list. |
| consistency#90 | SEC-059 edge budget | rejected (already fixed) | 04-algorithms.md:141 | Already applied: "SEC-059: DNS lookups and two GETs (https and http root) per listed host". |
| consistency#91 | SEC-058 `edge` | fixed | security.md:90 | |
| consistency#92 | SEC-015 wall clock | xfile | X7 | 04-only edit; security.md already says "non-deterministic, as SEC-056". |
| consistency#93 | Validation paragraph | fixed | security.md:55 | Covers `testModeReason`, `adminMfaReason`, `unsafeEvalReason` (SEC-075) and the `session` value types. |
| consistency#94 | SEC-004 `egress` | fixed | security.md:76 | |
| consistency#95 | SEC-043 | fixed | security.md:141 | |
| coverage-real-use#4 | SEC-074 (new) | adapted | security.md:134 | Added as a P0 rule. Changes from the proposal: the name list has no bare `hash` (too generic: content and commit hashes); entries carry `ownerExemptable`, and password, salt and secret material is never exemptable; hydration JSON (`<script type="application/json">`) is judged too; the `phone` and account-id string matches are dropped (no seeded phone exists, and short ids give false hits); the JWT `sub` of ≥ 8 characters is used instead; the B pairing follows the shared definition; `undeclared` is `skipped(no-contract)` without a contract. |
| coverage-real-use#15 | SEC-075 (new) | adapted | security.md:86 | Added. `'strict-dynamic'` with a nonce or hash makes host and scheme sources irrelevant (CSP3), so they are not flagged then. Without `'strict-dynamic'`, a nonce does not neutralise bypass hosts: they are findings. `'wasm-unsafe-eval'` is allowed. With multiple enforced policies a condition is met when any one policy meets it. Report-Only is ignored. On payment pages the `*`/scheme/wildcard checks are left to SEC-063 `csp` (single owner). |

## Ownership rows
```
SEC-074	*	WP-607	R07 new: property-level exposure (coverage-real-use#4); judges recorded responses, needs flows + accounts
SEC-075	*	WP-413	R07 new: CSP strength (coverage-real-use#15)
SEC-075	channel:edge	WP-414	R07 new: edge half on edge-pass responses (as SEC-010)
SEC-010	part:hsts	WP-413	R07 new part (G4 half; edge half follows existing SEC-010 channel:edge → WP-414)
SEC-025	part:rate-limit-edge	WP-607	R07 split (consistency#84)
SEC-054	part:requests	WP-607	R07 named part (consistency#84)
SEC-054	part:requests-edge	WP-607	R07 split (consistency#84)
SEC-054	part:mail	WP-607	R07 named part (consistency#72/84)
SEC-052	part:licence-unknown	WP-705	R07 split (consistency#84)
SEC-052	part:deprecated-unknown	WP-705	R07 split (consistency#84)
SEC-053	part:age-unknown	WP-705	R07 split (consistency#84)
SEC-073	part:unrated	WP-413	R07 new part (concreteness#26)
SEC-073	part:version-unknown	WP-413	R07 split (consistency#84)
```
(The part rows only restate the rule's `*` WP. Add them only if the orchestrator wants every part listed; the `*` rows already cover them.)

## Ruleset data
- `sensitive-properties.json` — `[{ name, ownerExemptable: bool }]` (SEC-074) → WP-104 "Security probes" bullet.
- `csp-bypass-hosts.json` — `[{ host, reason }]` (SEC-075) → WP-104 "Security probes" bullet.
- Shapes defined this round for files already listed in WP-104 (no BUILD_MAP change needed): `webhook-schemes.json`, `payment-id-shapes.json`, `payment-test-markers.json`, `takeover-fingerprints.json`, `cache-hit-headers.json`, `wp-lockout-signatures.json`, `registries.json`, `password-reset-paths`, `breached-passwords.txt` (build-time minimum of 100 entries of length 15–64).

## Policy keys added (key · type · default · file)
- `security.csp.allowUnsafeEval` · bool · `false` · spec/packs/security.md (SEC-075)
- `security.csp.unsafeEvalReason` · string | null · `null` · spec/packs/security.md (SEC-075; required non-empty when `allowUnsafeEval: true`)

## Cross-file requests
`audit/rounds/07/xfile/from-security.md`: X1 (03 journey `logout`), X2 (TST-010 logout flow), X3 (03 `tokenTtlVar` comment), X4 (04 § 1.2 required facts: SEC-064 `maxima`), X5 (04 § 1.8 static part severities), X6 (04 § 13 request-derived data flow), X7 (04 wall-clock list: SEC-015), X8 (04 § 13 SEC-050 `env-value`), X9 (consistency#68 pointer), X10 (04 § 15 hidden-content consumers: SEC-055).

## spec-lint
```
spec-lint: {"requirements":546,"rules":527,"toolRequirements":19,"rulesWithParts":170,"errors":23,"warnings":64}
  errors by check: dangling=1 ownership=20 channel-infra=2
  warnings by check: ruleset-unsourced=61 ruleset-unnamed=3
```
Errors from security.md: only `ownership` for SEC-074 and SEC-075. Both are expected, because the orchestrator has not yet added their rows above. Warnings from security.md: only `ruleset-unsourced` for `csp-bypass-hosts.json` and `sensitive-properties.json`, also expected until WP-104 lists them. The other 21 errors and 60 warnings come from other packs edited in parallel (privacy, programmatic, ux, web-delivery, accessibility, DAT-006 channel-infra, I18-010 dangling) and are not from security.md.
