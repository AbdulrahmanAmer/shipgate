# Resolution — security — pass B — round 08

Inputs: every request in `audit/rounds/08/xfile/from-*.md` whose target is `spec/packs/security.md`. Only `from-algorithms.md` has any: six Mirror rows (consistency #28, #32 with the 04 half applied; #29, #71, #72, #76 where 04 is only cited). No other `from-*.md` file targets security.md. Its SEC mentions (from-core-adapters-ux #4/#14, from-data-refactor-… #9, from-privacy-a11y-perf X7, from-web-delivery) all target 03/04/05. `from-security.md` is this group's own outgoing file. All six rows were also in this group's pass-A input, and each was checked against current text (line numbers = current `spec/packs/security.md`). Settled decisions: `audit/rounds/07/passB-notes.md`.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| from-algorithms#28 (consistency#28) | SEC-037 `expired` mutating stage; short-lifetime restart | already applied (adapted in pass A) | security.md:66, :121 | :66 *Short-lifetime stage* covers SEC-029 `expiry`, SEC-037 `expired`, SEC-044 `signed-url-expiry`: "each of these parts is its own mutating stage (04 § 4.2 step 8) … restarts the service with `auth.tokenTtlVar` set to `5` and logs the account under probe in afresh (as SEC-064 `lifetime` does)". :121 reads "part `expired` (shared definitions *Short-lifetime stage*, mutating stage, 04 § 4.2 step 8)". Adapted, not verbatim: other stages run "with the variable as configured (unset by shipgate)", so the Operator's own setting isn't overridden. |
| from-algorithms#32 (consistency#32) | SEC-032 no upload flow → operator-owned blocking | already applied | security.md:119 | "No flow has an `upload` step: when any crawled or flow-visited page contains an `input[type=file]`, a blocking finding `missing-element` owned by `operator` (flows are Operator-owned, 01 § 5.2; …), else `notApplicable`." Matches passB-notes #3. |
| from-algorithms#29 (consistency#29) | SEC-060 `remote: none` | already applied | security.md:176 | "`remote: none`: its probes are POSTs, and 04 § 10 allows only SEC-071's POST against remote services". |
| from-algorithms#71 (consistency#71) | SEC-074 channels `http, browser` | already applied (security half) | security.md:141 | "- **SEC-074** · P0 · http, browser —". The OPS-001 half is in ops.md, which this group doesn't own. |
| from-algorithms#72 (consistency#72) | SEC-045 `ssti` mutating-stage marker | already applied | security.md:130 | "part `ssti` — the same query parameters and flow fields as SEC-047 (flow-field replays: mutating stage, 04 § 4.2 step 8)". |
| from-algorithms#76 (consistency#76) | SEC-012 OPTIONS local only | already applied | security.md:94 | "and (local services only) an `OPTIONS` preflight with that origin". |

## Ownership rows
None (no new IDs or parts in pass B).

## Ruleset data
None.

## Policy keys added (key · type · default · file)
None.

## spec-lint
```
spec-lint: {"requirements":575,"rules":556,"toolRequirements":19,"rulesWithParts":201,"errors":0,"warnings":0}
  errors by check: none
  warnings by check: none
```
