# Resolution — security — pass A — round 06

File: `spec/packs/security.md`. Inputs: `concreteness-security.md` rows 1–50; `coverage-r05-carryover.md` row 5 (SEC-067); `lint.json` warnings for `spec/packs/security.md` (5); DECISIONS D-003, D-004 (D-001 budget exhaustion and D-002 cache keys touch only 04 and have no text in this file). Cross-file edits go to `xfile/from-security.md` (X1–X6). The `spec/CHANGES.md` entries STANDARD.md asks for are the orchestrator's; this pass doesn't own that file.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-security#1 | SEC-021, SEC-022 | adapted + xfile | security.md:96, :97; xfile X1 | Method set and stages adopted. The non-GET probes are a named part `write-methods` (P0†) so the stage list and ownership can name them. The API/page definition moved to the first sentence of SEC-021. "Adapter route-method exports" became `routes.discover` output (the adapter field that exists, 03 § 6). Stage list edit: X1. |
| concreteness-security#2 | SEC-027 | adapted + xfile | security.md:102; xfile X4 | Parts `unhashed` and `weak-hash` adopted. Name regex anchored (`^(pass(word)?\|passwd\|pwd)$` or `*_password`/`*Password`) so `passport`/`bypass` don't match. "No custom crypto" became part `custom-crypto` (W, review) instead of an unnamed sentence. Uses existing ruleset `password-columns`. `passwordHashApis` adapter field: X4. |
| concreteness-security#3 | SEC-043 | adapted | security.md:134; xfile X1 | Text adopted. Added: channels are joined over each `realtime.channels` endpoint; the `sg-rt-{n}` publish is a write, so marked mutating stage (X1). |
| concreteness-security#4 | SEC-044 | adapted | security.md:135; xfile X1 | Text adopted. `cross-tenant-read` limited to `private: true` buckets (public buckets are readable by design). `signed-url-expiry` got a decision procedure (5 s lifetime, refused at 7 s, as SEC-029). Reads added to stage list: X1. |
| concreteness-security#5 | SEC-060 | adapted + xfile | security.md:160; xfile X6 | Parts `introspection`/`depth` adopted. Endpoints also include flow-recorded POSTs with a JSON `query` string, so a GraphQL API with no contract entry is still probed for introspection. No endpoint → `notApplicable`. Depth probe sent as account A. `skipped(no-contract)` listed in `optionalInputs` (03 § 5). Contract `endpoint` field: X6. |
| concreteness-security#6 | SEC-002 | fixed | security.md:69 | `data` on `object` only. The `data:image` exception is on `img[src]`, `img[srcset]`, `source[srcset]` and `video[poster]`. The finding shows URL, selector and attribute (C6). |
| concreteness-security#7 | SEC-003 | adapted + xfile | security.md:70; xfile X1 | Text adopted. The login-flow replay is a named part `login-replay`, so it can run in the mutating stage (X1). Added `browser` channel and `<meta refresh>` targets and post-login navigations to the fail condition (SPA redirects after login are the usual open redirect). Ownership row for the browser slice below. |
| concreteness-security#8 | SEC-004 | adapted | security.md:71 | Source-host rule adopted as part `source`. The behaviour check became part `egress` so the sentence "judged only by the egress part" refers to a named part. |
| concreteness-security#9 | SEC-010 | fixed | security.md:80 | Uses `csp.required` and `csp.allowUnsafeInlineScripts`, scope = sampled 2xx `text/html` (04 § 10), Referrer-Policy value set, RFC 8941 Permissions-Policy. Evidence added (URL, header, actual value). HSTS, `isolation` and `trusted-types` kept unchanged. |
| concreteness-security#10 | SEC-011 | fixed | security.md:81 | Parts `attributes` (P0, http) and `local-storage` (W, browser). `browser` added to the channels. |
| concreteness-security#11 | SEC-012 | adapted | security.md:82, :53 | Probe set, origin and fail conditions adopted. Kept the original check that any crawled `Access-Control-Allow-Origin` stays within the allowed origins (dropping it would weaken the rule). "Absent `cors.allowedOrigins` = `[]`" added to the policy defaults line. |
| concreteness-security#12 | SEC-013 | fixed | security.md:83 | |
| concreteness-security#13 | SEC-014 | fixed | security.md:85 | Ruleset `sri-hosts.json` (`[{ host, versionedPathPattern }]`), hosts written as hostnames. |
| concreteness-security#14 | SEC-019 | fixed | security.md:30, :94 | `oauth.clients: [{ clientId, redirectUris[] }]` (no default) and the `notConfigured(security.oauth.clients)` outcome. The probe `redirect_uri` is fixed to `https://evil.shipgate.test/cb` so "unregistered" can be decided. Fixed `code` value. |
| concreteness-security#15 | SEC-022 | fixed | security.md:97 | Probed accounts and `notConfigured(...)` owned by `operator`. Also takes SEC-021's method set (row 1). |
| concreteness-security#16 | SEC-024 | adapted (D-003) | security.md:99 | Replay, token-name ruleset `csrf-token-names.json` and the `headerTemplate` exclusion adopted. D-003 applied as cookie withholding: the replay carries exactly the recorded cookies a browser would send on a cross-site non-GET request (RFC 6265bis: `Strict`/`Lax` withheld; `None`/unset sent), using the attribute **as observed in `Set-Cookie`**. This replaces the proposed blanket "all-Strict passes" exemption. A request protected only by SameSite therefore passes, and one with a `None` session cookie is judged on Origin/token. No agent-declared switch. |
| concreteness-security#17 | SEC-025 | adapted | security.md:100, :23 | Parts `rate-limit`/`enumeration` and endpoint roles adopted (existing ruleset `password-reset-paths`). Added: outcome for an `authEndpoints` entry no flow requested (`notConfigured`, which TST-010 also makes a finding); HTML body fallback to `<body>` when there is no `<main>`. |
| concreteness-security#18 | SEC-026 | fixed | security.md:101 | Parts `unsigned` and `wrong-signature`. |
| concreteness-security#19 | SEC-026, SEC-049 | xfile + fixed | security.md:18; xfile X5; Ruleset data | 03 § 14 path text: X5. The pack policy comment now says what `fixture` names. `webhook-schemes.json` content shape listed under Ruleset data. |
| concreteness-security#20 | SEC-029 | adapted | security.md:104 | Source flows and part `single-use` adopted. Part `expiry` got a decision procedure (5 s lifetime, link requested at 7 s meets none of the `single-use` failure conditions). |
| concreteness-security#21 | SEC-030 | adapted + xfile | security.md:105; xfile X4 | Parts `source`/`behaviour` adopted. `SKIPPED` became `skipped(no-contract)` in `optionalInputs`. Dropped the proposed claim that `api` services "always have" a contract (no spec line says so). "Never 500" became "never 5xx" (stricter). The 03 annotation for `validatorApis` is in X4. |
| concreteness-security#22 | SEC-032 | adapted | security.md:31, :107 | `uploads.maxBytes` (10485760) and parts `size`/`type`/`served-type` adopted. Added a definition of "rejected" (non-2xx, or not stored), a second `type` variant under the fixture's own name and type, and the missing-input outcome: `notConfigured(flow upload step)` when any page has `input[type=file]`, else `notApplicable`. |
| concreteness-security#23 | SEC-035 | fixed | security.md:124; Ruleset data | Shape `[{ path, signature }]` and the example signatures written into the rule. Ruleset shape listed below. |
| concreteness-security#24 | SEC-040 | adapted | security.md:131 | Card-input detector and the `hostedFields: false` meaning adopted. The browser and ast checks are named parts `dom` and `source`. `pan\b` anchored as `\bpan\b`. |
| concreteness-security#25 | SEC-042 | adapted | security.md:133, :72 | Text adopted, citing CFG-004's live-key list plus the 04 § 13 provider patterns. The part `client-secret` is now defined in SEC-042 so `SEC-005 owns: ["SEC-042#client-secret"]` refers to a real part. SEC-005's owner note mentions it. |
| concreteness-security#26 | SEC-050 | fixed + xfile | security.md:153; xfile X3 | Parts listed in the pack, with the new `env-file` P0†. 04 § 1.8 edit: X3. |
| concreteness-security#27 | SEC-051 | adapted | security.md:154 | Level mapping and `blockAt` enum adopted. "No severity → W" and "dev-only → W" are named parts `unrated` and `dev-only`. All four `database_specific.severity` labels are mapped. |
| concreteness-security#28 | SEC-052 | adapted | security.md:155 | SPDX logic and diff reference adopted, as named parts `licence` and `deprecated`. "Archived" dropped with the stated reason (the snapshot has no repository state). |
| concreteness-security#29 | SEC-054 | fixed | security.md:125 | |
| concreteness-security#30 | SEC-056 | fixed | security.md:88 | |
| concreteness-security#31 | SEC-064 | adapted (D-004) | security.md:142, :145, :47 | Absolute timings fixed (t = 2/4/6/8 s). The lifetime maxima are a new cfg part `maxima` reading ruleset `session-lifetimes.json` (`null` = no maximum). Defaults per D-004 / NIST SP 800-63B-4. The Operator may only tighten them (policy comment). Same edit clears lint `ruleset-unnamed` at old line 142. |
| concreteness-security#32 | SEC-065 | fixed | security.md:41, :147 | Added `testModeReason`. The CFG-006 rejection is stated in the rule. |
| concreteness-security#33 | SEC-071 | fixed + xfile | security.md:169; xfile X2 | |
| concreteness-security#34 | policy `rateLimit` | fixed | security.md:23 | |
| concreteness-security#35 | SEC-008 | fixed | security.md:75 | |
| concreteness-security#36 | SEC-009 | fixed | security.md:76 | `video\|audio[src\|poster]` split, since `audio` has no `poster`. |
| concreteness-security#37 | SEC-015 | fixed | security.md:86 | |
| concreteness-security#38 | SEC-017 | fixed | security.md:92 | |
| concreteness-security#39 | SEC-018 | fixed | security.md:93 | PRNG is TR-103's lock digest. Charset `[a-z0-9]` for (a) and (c), `[a-z]` for (d). |
| concreteness-security#40 | SEC-020 | fixed | security.md:95 | Scope covers declared and discovered `api` routes. |
| concreteness-security#41 | SEC-023 | fixed | security.md:98 | Parts `read`/`write`, DELETE without body. `notConfigured(writeBody)` applies per method. The write part also requires "no side effect". |
| concreteness-security#42 | SEC-034 | adapted | security.md:123 | PRNG draw adopted, with "all of them when fewer" and "sorted lexicographically" spelled out. |
| concreteness-security#43 | SEC-036 | fixed | security.md:114, :26; Ruleset data | `mass-assignment-fields.json` becomes `[{ name, type }]`. `massAssignment.extraFields` takes the same shape (policy comment). |
| concreteness-security#44 | SEC-037 | fixed | security.md:109 | |
| concreteness-security#45 | SEC-041 | fixed | security.md:132 | Uses `business.json` `prices[].amount` (03 § 14). |
| concreteness-security#46 | SEC-053 | fixed | security.md:156 | Ruleset `install-script-flags.json`. Same edit clears lint `ruleset-unnamed` at old line 152. |
| concreteness-security#47 | SEC-055 | fixed | security.md:126 | |
| concreteness-security#48 | SEC-058 | fixed | security.md:84 | |
| concreteness-security#49 | SEC-064 `admin-mfa` | fixed | security.md:146 | Also requires a non-empty `adminMfaReason`, the key the old "with a reason" referred to. |
| concreteness-security#50 | SEC-066 | fixed | security.md:148 | Ruleset `ci-hardening.json`. |
| coverage-r05-carryover#5 | SEC-067 (new) | adapted | security.md:149, :32; xfile X1 | Added as SEC-067 (next free ID). Policy `security.signup` added. Changes from the proposal: the gate probe URL is fixed (first sampled URL of each matching route group), and its fail condition reuses "protected body match" in place of the undefined "verification page". "No email at all → finding" is a named part `email` (30 s window). `verification: "none"` makes the whole rule `notApplicable`, listed in the report (Operator-signed, as SEC-040 `hostedFields: false`). `single-use` is `notApplicable` with `code`. Stage list: X1. |
| lint.json ruleset-unnamed security.md:18 | policy `routes.*.scheme` | fixed | security.md:18 | Now ``ruleset `webhook-schemes.json` ``. |
| lint.json ruleset-unnamed security.md:26 | policy `massAssignment` | fixed | security.md:26 | Now ``ruleset `mass-assignment-fields.json` ``. |
| lint.json ruleset-unnamed security.md:38 | policy `dependencies.registries` | fixed | security.md:40 | Now ``ruleset `registries.json` ``. |
| lint.json ruleset-unnamed security.md:142 | SEC-064 | fixed | security.md:145 | Same edit as concreteness#31 (`session-lifetimes.json`). |
| lint.json ruleset-unnamed security.md:152 | SEC-053 | fixed | security.md:156 | Same edit as concreteness#46 (`install-script-flags.json`). |
| DECISIONS D-003 | SEC-024 | applied | security.md:99 | See concreteness#16. |
| DECISIONS D-004 | SEC-064 | applied | security.md:145, :47 | See concreteness#31. |

## Ownership rows
```
SEC-067	*	WP-607	new (coverage-r05-carryover #5): email ownership before trust
SEC-003	part:login-replay	WP-607	login-flow replay needs flows/browser (WP-601/602); clears lint channel-infra SEC-003 browser → WP-413
SEC-003	channel:browser	WP-607	same slice as part:login-replay
```
No other new IDs. The new parts on SEC-021/022/023/024/025/026/027/029/030/032/040/042/043/044/064 stay with their rule's current `*` owner (WP-607). SEC-002/004 stay with WP-413, SEC-050 with WP-304, SEC-051/052 with WP-705, SEC-060 with WP-413.

## Ruleset data
New files (WP-104 **Round-6 data** bullet, except where noted):
- `sri-hosts.json` — `[{ host, versionedPathPattern }]`: cdnjs.cloudflare.com, cdn.jsdelivr.net, unpkg.com, code.jquery.com, … (SEC-014).
- `weak-hash-apis.json` — `[{ ecosystem, call }]`: MD5/SHA-1/unsalted SHA-2 digest calls per ecosystem (SEC-027).
- `csrf-token-names.json` — `csrf`, `_csrf`, `csrfToken`, `csrf_token`, `authenticity_token`, `_token`, `X-CSRF-Token`, `X-XSRF-TOKEN`, `__RequestVerificationToken` (SEC-024).
- `session-lifetimes.json` — `{ <kind>: { idleSec, absoluteSec } }`, NIST SP 800-63B-4 defaults: `ymyl` 3600/86400; other kinds `null`/2592000 (SEC-064, D-004).
- `install-script-flags.json` — `[{ ecosystem, lockfile, jsonPath }]` (SEC-053).
- `ci-hardening.json` — `[{ provider, fileGlob, check, pattern }]` (SEC-066). Belongs to the **Round-4 data** bullet's existing "CI hard…" entry, which should name this file.

Shape specifications for files already listed (WP-104 **Security probes** bullet):
- `webhook-schemes.json` — `[{ scheme, signatureHeader, format (template, e.g. t={ts},v1={sig}), signedPayload (template over {ts}, {id}, {body}), algorithm: hmac-sha256|hmac-sha1, encoding: hex|base64, secretDecoding: raw|base64|base64-after-prefix, timestamp: header|format-param|none, idSource: { header } | { jsonPath } }]` (concreteness#19).
- `debug-paths.json` — `[{ path, signature }]`, `signature` a regex over the body (concreteness#23).
- `mass-assignment-fields.json` — `[{ name, type: string|bool|id|role|number }]` (concreteness#43).

Bundled probe fixtures (WP-607, with the existing SVG fixture): `sg.html` (`text/html`, body `<sgx{n}>`) and `sg.exe` (starts with `MZ`) for SEC-032 `type`.

## Policy keys added (key · type · default · file)
- `security.oauth.clients` · `[{ clientId: string, redirectUris: string[] }]` · no default (part `authorization-server` is `notConfigured` without it) · spec/packs/security.md
- `security.uploads.maxBytes` · integer (bytes) · `10485760` · spec/packs/security.md
- `security.signup.verification` · `"link" | "code" | "none"` · `"link"` · spec/packs/security.md
- `security.signup.verifiedOnly` · route patterns `string[]` · `[]` (= every `app` surface pattern) · spec/packs/security.md
- `security.payments.testModeReason` · string \| null · `null` (required non-empty when `testModeInProduction: true`) · spec/packs/security.md
- (requested, xfile X6) `data-api.contracts[].endpoint` · string path · `"/graphql"` for `type: "graphql"` · spec/packs/data-api.md
- (requested, xfile X4) adapter manifest `passwordHashApis[]` · call list · `[]` · spec/03-formats.md

## spec-lint
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":137,"errors":6,"warnings":63}
  errors by check: dangling=1 ownership=5
  warnings by check: ruleset-unsourced=57 ruleset-unnamed=1 channel-infra=5
```
Mine, expected until the orchestrator adds rows:
- `ERROR [ownership] SEC-067 (spec/packs/security.md:149) has no owning work package`: ownership row above.
- `WARN [ruleset-unsourced]` × 12 for `session-lifetimes`, `sri-hosts`, `csrf-token-names`, `weak-hash-apis`, `ci-hardening`, `install-script-flags` (named and `.json` forms): Ruleset data above.
- `WARN [channel-infra] SEC-003 channel browser → WP-413, which doesn't depend on WP-601`: ownership rows above.

No `ruleset-unnamed` warnings are left in security.md. The other 5 errors (TCL-004 dangling, AGT-006 channel row, REF-014, UX-022, CQ-010 ownership) are in other fixers' files.
