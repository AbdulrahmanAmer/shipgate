# Resolution — security — pass A — round 08

Inputs: all 17 rows of `concreteness-security.md`; the rows ≥ 20 of `consistency.md` whose Location names `spec/packs/security.md` (26–32, 71, 72, 76); coverage-real-use #15–#18 (pack security). `coverage-visibility.md` has no security rows (its Pack column names search-engines, web-delivery, answer-engines and ux only). Settled decisions applied: `audit/rounds/07/passB-notes.md` items 3 (operator-owned `missing-element` for missing Operator flows), 4 (03 § 8 single definition), 5 (BUILD_MAP/ownership/CHANGES requests are the orchestrator's). Line numbers are for `spec/packs/security.md` after this pass.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-security#1 | SEC-043 | adapted | security.md:44, :53, :149 | *Wire formats* added. One key per direction (`realtime.join`, `realtime.publish`, `string \| null`, default `null`) whose meaning depends on the protocol (socket.io: event name, default `join`/`message`; raw-ws: frame template, default as proposed). The proposed `realtime.join.event` was dropped because a key can't be both a string and an object. Supabase frames completed so they work: `vsn=1.0.0`, `apikey={supabase.anonKey}` (03 § 3.2), `access_token` = the account JWT (anon key for no session), `join_ref`. "No session" defined. |
| concreteness-security#2 | SEC-031 | adapted + xfile | security.md:118; xfile X5 | Detector as proposed. Added: a tagged-template call whose tag is the `queryApis` entry itself passes (it binds parameters), class `pattern-match`. X5 adds SEC-031 to the 04 § 13 users list. |
| concreteness-security#3 | SEC-029/037/044 | adapted + xfile | security.md:66, :116, :121, :151; xfile X1 | Merged with consistency#28. A per-part **Short-lifetime stage** replaces the proposed second shared instance: 04 § 4.2 step 8 already gives each mutating stage a fresh database copy, and a second parallel instance isn't in 04's environment model. Each of the three parts is its own stage that restarts the service with `auth.tokenTtlVar` = `5` and logs in afresh (as SEC-064 `lifetime`). Every other stage runs with the variable as configured, so the `single-use` and other parts are not affected. X1 splits SEC-029 `expiry` and SEC-044 `signed-url-expiry` into their own stages in 04. |
| concreteness-security#4 | SEC-040/041/048/063 | adapted + xfile | security.md:55, :146, :147, :152, :154; xfile X2 | *Payments applicability* added as proposed. Made precise per part: SEC-040 `dom`, SEC-041, SEC-048 `foreign-session` and SEC-063 give the operator-owned `missing-element`, and their other parts still run (SEC-040 `source`, SEC-048 `fabricated`). SEC-041 without a `markAmount` step gets the same finding. X2 adds them to 04 § 1.2 required facts. |
| concreteness-security#5 | SEC-048 | adapted | security.md:152 | Text as proposed, with two changes. (1) `{account.id}` dropped: 03 § 10 *Account tokens* defines only `{account.email}`/`password`/`token`, and a config account id isn't a DB key. (2) `db` = `verifyEnv.databases[].id`, which is 03 § 3.4 (not § 3.2). No value at `jsonPath` → the same `value-mismatch`. |
| concreteness-security#6 | SEC-005 | fixed | security.md:83 | *Match* added as proposed; failure class `leak` stated. |
| concreteness-security#7 | SEC-075 | fixed | security.md:92; back-pointer :91 (SEC-010) | Edge half = the SEC-010 `hsts` HEAD responses. A missing CSP gives no SEC-075 finding, and SEC-010 says it reports the absence. |
| concreteness-security#8 | SEC-034 | adapted | security.md:136 | As proposed, except that a path ending in `/` is treated as path + `index` (the proposal's `<dir>` = `/` rule left `<path>.bak` = `/.bak`). `<ext>` includes the dot. Cites 04 § 15 *Fallback body*. |
| concreteness-security#9 | SEC-007 | adapted | security.md:85 | Session rule as proposed. The probed URL = the route's sample URL, else *Parameter filling* (API routes often have no sample URL). (a) varies one segment at a time. |
| concreteness-security#10 | SEC-021 | adapted | security.md:70, :108, :109, :110 | Made a shared definition *Parameter filling*, used by SEC-007, SEC-021, SEC-022, and SEC-023 (non-resource segments). The proposed `skipped(no-resource)` became a probe-level "not judged (`no-resource`)" listed in the report: 04 § 1.2 `skipped(reason)` is a per-rule outcome, and the rule's other probes still run. |
| concreteness-security#11 | SEC-019 | fixed | security.md:106 | As proposed; separate finding lines for (a) and (b). |
| concreteness-security#12 | SEC-039 | fixed | security.md:129 | As proposed. |
| concreteness-security#13 | SEC-005/014/024/034/045/046/047/053/055 | fixed | security.md:71 | As proposed. Bullet titled "Ruleset files and their shapes" (the proposed "Ruleset shapes." trips spec-lint `ruleset-unnamed`). Added: every other regex in the pack's rulesets is Rust `regex` syntax. |
| concreteness-security#14 | SEC-062 | fixed | security.md:178 | As proposed (pointer to SEC-055 dropping option (a) under `edge`). |
| concreteness-security#15 | shared | adapted + xfile | security.md:69; xfile X4 | 04 § 15 *Values* defines the nonce as the lowercase hex of the u64 (16 digits), so `{n}` = its first 8 characters (zero-padded). Services are ordered by id byte order. The 04 *Fallback body* `{n}` is a stated exception. X4 notes the truncation in 04. |
| concreteness-security#16 | SEC-050 | fixed | security.md:169 | As proposed. |
| concreteness-security#17 | SEC-064 | fixed | security.md:160 | As proposed. |
| consistency#26 | TST-007 / `security.ownership` | xfile | xfile X6 | The fix is in testing.md, which another fixer owns. security.md:21 needs no change (the default is already `quality/fixtures/ownership.json`). |
| consistency#27 | 03 § 3.5 ↔ pack defaults | fixed (pack side) | security.md:53 | 03 side already applied, as `03-formats.md:129` shows: "`routes` (else surface defaults), `authEndpoints`, `payments` (incl. `successPath`, `entitlement`), `oauth.clients`, `realtime`, `storage`, webhook-route `scheme`/`secretVar`/`fixture`; absent `cors.allowedOrigins` = `[]`". Pack "No default" line now lists the same keys, plus `realtime.join`/`publish` default `null`. |
| consistency#28 | SEC-037 `expired`, SEC-029/044 | adapted + xfile | security.md:66, :116, :121, :151; xfile X1 | Merged with concreteness#3 (above). The 04 side for SEC-037 `expired` is already applied: `04-algorithms.md:209` "- SEC-037 \`expired\`, SEC-054, …". X1 covers the SEC-029 `expiry` and SEC-044 `signed-url-expiry` stages. |
| consistency#29 | SEC-060 | fixed | security.md:176 | `remote: none` as proposed. |
| consistency#30 | SEC-075 ↔ SEC-063 | fixed | security.md:92, :154 | Hand-off narrowed to `*`, `https:`/`http:` and wildcard host. `data:`/`blob:` stay SEC-075. SEC-063 mirrors the ownership. |
| consistency#31 | SEC-018 | fixed | security.md:105 | As proposed. |
| consistency#32 | SEC-032 | fixed | security.md:119 | As proposed. The 04 side is already applied (`04-algorithms.md:35` "SEC-032 without an upload flow;"). |
| consistency#71 | SEC-074 channels | fixed (security half) | security.md:141 | `http, browser`. The OPS-001 half is in ops.md, which the ops fixer owns. |
| consistency#72 | SEC-045 `ssti` | fixed | security.md:130 | Marker added as proposed. |
| consistency#76 | SEC-012 | fixed | security.md:94 | "(local services only)" added to the `OPTIONS` preflight. |
| coverage-real-use#15 | SEC-076 (new) | adapted | security.md:150 | Added to § 7 next to SEC-043, with cross-pointers. Class changed to `access-allowed` (the finding is an accepted handshake, not a header value). Positive control `Origin` = the recorded handshake's `Origin`, else the service origin. socket.io uses its Engine.IO WebSocket URL. A failed positive control skips probe (2). |
| coverage-real-use#16 | SEC-077 (new) | adapted + xfile | security.md:127; xfile X1 | "Valid persisted value" is now decidable. `count`: an integer ≥ 0, ≤ the contract `maximum` when declared. `money`: ≥ 0, with no more decimals than the largest ISO 4217 minor unit of the `business.json` `prices[]` currencies (03 § 14 has no top-level `currency`). Money variant `0` dropped: a zero tip or donation is legitimate, and its abuse case is covered by (c). (c) is defined as running the rest of the flow after the replay, with the amount read from the egress proxy as in SEC-041. X1 adds it to the 04 stage and replay lists. |
| coverage-real-use#17 | SEC-078 (new) | adapted | security.md:79 | The adapter key `clientEventApis` was dropped: it isn't defined in 03 § 6, and `addEventListener`/`onmessage` are DOM APIs anyway. The proposed P1 ast `target` check (non-literal payload with `"*"`) became W part `target-source`: a dynamic payload to `"*"` is common and not a leak by itself. The leak is proven by the P1 browser part `target`. "PRV-010 account identifier" replaced by the defined `SHIPGATE_ACCT_<ID>_EMAIL`, session-cookie and `headerTemplate` values. |
| coverage-real-use#18 | SEC-079 (new) | adapted + xfile | security.md:142; xfile X3 | Only probes candidate hosts covered by a `hosts[]` entry: TR-106 limits network access to declared hosts, so no new TR-106 allowance is needed. Undeclared ones go to PRV-005/SEC-004 `egress`. Path-style buckets handled. No edge pass → `skipped(no-edge)`. X3 adds the request limit to the 04 § 2 item 5 edge list. |

## Ownership rows
```
SEC-076	*	WP-607	R08 new: CSWSH handshake Origin probe with session cookies (coverage-real-use#15)
SEC-077	*	WP-607	R08 new: numeric boundaries on commerce fields, flow replays (coverage-real-use#16)
SEC-078	*	WP-413	R08 new: postMessage handler/target-source ast parts (coverage-real-use#17)
SEC-078	part:target	WP-608	R08 new: browser postMessage init-script hook
SEC-079	*	WP-414	R08 new: anonymous object-storage listing, edge pass (coverage-real-use#18)
```

## Ruleset data
- `quantity-fields.json` — `[{ name, kind: "count"|"money" }]` (SEC-077) → WP-104 "Security probes" bullet.
- `object-storage-hosts.json` — `[{ id, hostPattern, probePaths, listingSignatures }]` (SEC-079) → WP-104 "Security probes" bullet.
- Shapes defined this round for files already referenced (no new file): `publishable-keys.json`, `exposed-paths.json`, `csrf-token-names.json`, `ssrf-params.json`, `file-params.json`, `challenge-fields.json`, `xss-payloads.json`, `traversal-payloads.json`, `sri-hosts.json`, `popular-packages/<ecosystem>.txt`.

## Policy keys added (key · type · default · file)
- `security.realtime.join` · string \| null · `null` · spec/packs/security.md (SEC-043 *Wire formats*; socket.io event name / raw-ws frame template)
- `security.realtime.publish` · string \| null · `null` · spec/packs/security.md (SEC-043 *Wire formats*)

## Cross-file requests
`audit/rounds/08/xfile/from-security.md`: X1 (04 § 4.2 step 8: SEC-029 `expiry` / SEC-044 `signed-url-expiry` stages, SEC-077), X2 (04 § 1.2 required facts: payments without a checkout flow), X3 (04 § 2 item 5 edge limit: SEC-079), X4 (04 § 15 nonce length), X5 (04 § 13 users: SEC-031), X6 (testing.md TST-007, consistency#26).

## spec-lint
```
spec-lint: {"requirements":570,"rules":551,"toolRequirements":19,"rulesWithParts":197,"errors":24,"warnings":62}
  errors by check: dangling=2 ownership=22
  warnings by check: ruleset-unsourced=59 ruleset-unnamed=3
```
(Last run at the end of this pass. Totals move while the 7 parallel fixers edit; an earlier run gave errors 22 and warnings 43. The security lines were the same in both runs: 4 errors and 3 warnings, listed below.)
Security-caused errors, all expected (they wait on the orchestrator's rows): `ownership` for SEC-076, SEC-077, SEC-078, SEC-079 (rows above). Security-caused warnings, also expected: `ruleset-unsourced` for `quantity-fields.json` (two lines) and `object-storage-hosts.json` (WP-104 listing above). All other errors and warnings name files outside spec/packs/security.md, so they belong to other fixers or are waiting on the orchestrator's rows. Before this pass the baseline was `errors: 1` (dangling UX-026, ux.md).
