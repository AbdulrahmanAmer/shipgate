# Resolution — algorithms — pass A — round 07

Input: `audit/rounds/07/concreteness-algorithms.md` rows 1–42; the 48 rows of `audit/rounds/07/consistency.md` whose Location names 04; the orchestrator's three instructions (Indexable page and Page locale in 04 § 15; one PRNG definition). Line numbers refer to `spec/04-algorithms.md` after this pass. "Already fixed" means the row's fix lies wholly in another file and that file's owner applied it in this round's pass A (checked by grep against the current text, quoted); 04 needed no change for those rows.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| orchestrator#indexable | Indexable page | adapted + xfile | 04:456–463; xfile X1 | Defined once in § 15. Text = the web-delivery fixer's richer § 2 draft (items 1–5: crawled/inventory, 200 `text/html` no redirect, Operator config incl. `indexation`, DAT-017 `onLow`, `indexRules` with `staticPaths`/`legalPages` as exact entries, `retired`/`syndicated`/`docs.versions`/site-search/alias hosts, allowed query params), with key paths qualified. Nothing on the page removes a URL. § 10 sampling and fixed-size samples cite it (04:374–375). X1 asks web-delivery to replace its copy with a pointer. |
| orchestrator#page-locale | Page locale | fixed + xfile | 04:464–466; xfile X2 | From `web-delivery.localePrefix`/`locales`/`defaultLocale` (locale segment per web-delivery § 1; inventory locale for family pages); `<html lang>` never used. **Fallback choice: blocking, Operator-owned.** A page locale with no ruleset entry (full tag, then primary subtag, policy list for the same data counts) is never skipped: the check runs with `en` and the rule emits one blocking `missing-element` finding per (rule, locale), owned by `operator`, so only an Operator action (ruleset with the locale, a policy list, or removing the locale) clears it; with only Operator findings left the run ends in an `operator-owned` handoff, never PASS. Chosen over PARTIAL because it reuses the § 1.2 required-facts pattern and the existing handoff row 1, needs no new partial cause, and can't be reached by the agent picking `lang`. Operator-written locale maps (e.g. `consent.banner` labels, privacy.md:75 "falls back to `en`") are excluded and keep their pack rule. |
| orchestrator#prng | PRNG | fixed | 04:451 | § 15 is the single definition: draws (hash ranking over the 32 raw digest bytes) and value streams (SEC-030 fuzz values, nonces); stream ids listed incl. `sample:<service>:<surface>:<stratum>`, `audit-targets`, `host-unsupported`; "no ChaCha stream or shuffle". 01 TR-103 already points here (01:252 "selections are defined once, in 04 § 15 (hash-ranked draw; no ChaCha or shuffle)"), so no xfile needed. |
| concreteness-algorithms#1 | Handoffs | fixed | 04:113, 04:121, 04:67 | "Builder work first" covers builder-owned `BLOCKED(budget)` gates; row 1 needs ≥ 1 blocking finding and base FAIL from step 3. § 1.5 cross-reference renamed. |
| concreteness-algorithms#2 | Indexable | adapted | 04:456–463, 04:374–375 | Placed in § 15 per the orchestrator (not § 10); see orchestrator#indexable. |
| concreteness-algorithms#3 | Complete crawl | fixed | 04:370–371 | Depth defined; complete-crawl bullet after Traps; G5 prerequisite = crawl ran to its end. |
| concreteness-algorithms#4 | Reduced mode | fixed | 04:94 | Probe: Chromium `about:blank` within 30 s; port binds with 3 attempts 1 s apart. |
| concreteness-algorithms#5 | Handoffs | fixed | 04:123 | Precedence `tool-error` > `budget` > `exhausted` > `operator-owned`. |
| concreteness-algorithms#6 | Egress proxy | fixed | 04:224 | Forwards only `server: true` hosts no stub answers; others recorded + `502` `X-Shipgate-Egress: blocked`. Sentence now a capitalised bullet. |
| concreteness-algorithms#7 | Host emulation | fixed | 04:170 | **Order** paragraph as proposed. |
| concreteness-algorithms#8 | Host emulation | fixed | 04:172, 04:133 | ≤ 20 matched URLs per source pattern, PRNG stream `host-unsupported`, § 2 step 5 limits; unchecked URLs listed. |
| concreteness-algorithms#9 | Comparison pass | fixed | 04:155 | Judged per (rule, part, URL) of `comparison-10` checked in the main pass. |
| concreteness-algorithms#10 | Control click probe | fixed | 04:201 | Reload when the click changed the page; restart on a freshly restored DB after each page. |
| concreteness-algorithms#11 | Stage assignment | fixed | 04:201 | "G6 flows with `mutates: true` (03 § 10)"; `mutates: false` flows run in the read-only stage. |
| concreteness-algorithms#12 | Fingerprints | fixed | 04:356 | `targets`/`actual` defined from 03 § 17 example fields; rounding per unit; wall-clock outcomes excluded (01 § 5.4). |
| concreteness-algorithms#13 | `owns` merge | fixed + xfile | 04:357; xfile X4 | Merge key, surviving fields, no-owner case. `absorbed` is not yet a report field → X4 (03 § 17). |
| concreteness-algorithms#14 | groupKey | fixed | 04:322–323 | Two browser rows: PRF-\* budget parts; every other rule (axe id / flow id + step / detector check name / part name). |
| concreteness-algorithms#15 | Attempts | fixed | 04:361 | Attempt only if the rule was evaluated; unreported finding clears its counters. |
| concreteness-algorithms#16 | MinHash | fixed | 04:400 | Permutation i = SHA-256(be32(i) ‖ shingle) first 8 bytes; signature = minimum; bands rows 4k…4k+3. |
| concreteness-algorithms#17 | PRNG | fixed | 04:451 | Raw 32 digest bytes; see orchestrator#prng. |
| concreteness-algorithms#18 | treeHash | fixed | 04:450 | Proposed text minus `.shipgate/` (no such path anywhere in the spec). |
| concreteness-algorithms#19 | Owners | adapted | 04:521–522 | Catch-all bullet added, but not blanket `operator`: a `†` `blocked(<reason>)` caused by a file inside the Builder's `writeScope` (e.g. an unsupported host directive the agent wrote) is `builder`, otherwise an agent could write such a file to get a handoff. Baseline, licence, CFG-004, `minCoverage` → `operator`. `BLOCKED(root-container)` listed. |
| concreteness-algorithms#20 | Coverage | fixed | 04:48 | `noAdapterSupport` changes neither gate status nor coverage level; level = earned tier (02 § 1). |
| concreteness-algorithms#21 | Cache | fixed | 04:527 | G8, LNK-006/007 and every remote-service check never served from cache. |
| concreteness-algorithms#22 | `brief` | fixed | 04:263 | Union/intersection semantics of every flag. |
| concreteness-algorithms#23 | `brief` | fixed | 04:264–265 | Content of policy excerpts and repo summary. |
| concreteness-algorithms#24 | Recipes | fixed | 04:270 | `recipes/<adapter id>.json` shape; adapter with none: the brief says so. Ruleset data row below. |
| concreteness-algorithms#25 | AGT-004 | fixed + xfile | 04:421; xfile X5 | Pairs come from adapter `matcherWidening` (X5 adds it to 03 § 6); removed-test exemption when the imported modules are deleted too. |
| concreteness-algorithms#26 | SEC-050 | adapted | 04:423 | Entropy threshold as proposed. File shape adapted to `{ formatVersion, patterns: [{ id, provider, regex }] }` (Rust `regex` syntax, `id` = the § 9.3 pattern id); the proposed `liveOnly` flag had no consumer anywhere in the spec. Notes SEC-042 and ARC-009 reuse. |
| concreteness-algorithms#27 | Budgets | fixed | 04:287 | `skipped(deferred)`, never passed, run in next `verify`; `pre` denies when protected-path/command checks can't finish in 300 ms. |
| concreteness-algorithms#28 | Crawl seeds | adapted | 04:367 | The adapter manifest's `routes` has no param type, so the value is chosen from the pattern's own regex (03 § 2.1 `{name:regex}`): `1` when the regex matches `1` but not `sg-1`, else `sg-1`; 404 drops the seed. |
| concreteness-algorithms#29 | Route groups | fixed | 04:373 | `<main>` = depth 0, depth ≤ 3 kept; group id `pattern#<8 hex>` on split. |
| concreteness-algorithms#30 | Embedded DB | adapted | 04:184, 04:521 | Drop to `nobody` when running as root (Unix); failure → `BLOCKED(root-container)`, owner `operator`, report says use `external`. Owner listed in § 15. |
| concreteness-algorithms#31 | Edge sample | fixed | 04:142 | REF-010 uses "the production edge sample". |
| concreteness-algorithms#32 | Canary | fixed | 04:218 | One free port per run on all three addresses. |
| concreteness-algorithms#33 | Rulesets | fixed | 04:442 | Hotfix can set `experimental` or lower to `W`; never `†` changes or raises. |
| concreteness-algorithms#34 | Review channel | fixed | 04:99 | `skipped(no-review)` (W) / automated channels only; G9 status. |
| concreteness-algorithms#35 | Handoffs | fixed | 04:117 | Merged with consistency #104 and #24: `planned` allows reduced/slow-host causes only when the signed policy allows reduced runs. |
| concreteness-algorithms#36 | Normalisation | fixed | 04:485 | Dates, UUIDs, ≥ 16-char digit-bearing runs removed. |
| concreteness-algorithms#37 | CQ-008 | fixed | 04:470 | Counted in the longer text. |
| concreteness-algorithms#38 | repo-id | fixed | 04:452 | `canonicalize`, `\\?\` stripped, drive upper-case, `/` separators. |
| concreteness-algorithms#39 | Soft-404 | fixed | 04:411 | "no `data-fact` element"; words = UAX #29. |
| concreteness-algorithms#40 | API-002 | fixed | 04:492 | 400/422 via SEC-030 "required field removed"; 409/429/5xx `skipped(not-generatable)`; non-GET requests in a mutating stage. |
| concreteness-algorithms#41 | Faults | fixed | 04:215 | Refused = proxy resets the TCP connection. |
| concreteness-algorithms#42 | Loop guard | fixed | 04:298 | Same agent session. |
| consistency#11 | UX-022 G6 | fixed | 04:60, 04:63 | G8 row: UX-022 and SEC-065 checks also need G6; `blocked(prerequisite: G6)` (owner of G6's block) or `skipped(scope)`; never pass on a list G6 didn't produce. ux.md half already applied ("`blocked(prerequisite: G6)` and never passes on an empty form list"). ownership.tsv/BUILD_MAP halves: orchestrator. |
| consistency#13 | UX-020 sources | rejected (already fixed) | ux.md | Fix is ux.md only; applied there ("…lies under `quality/data/`…"). 04 § 4.3 needs no change. |
| consistency#14 | UX-020 channels | rejected (already fixed) | ux.md:54 | "UX-020** · P0 · browser, html, db". |
| consistency#17 | WP deps | skipped (orchestrator) | — | BUILD_MAP row. |
| consistency#22 | stub scan | skipped (orchestrator) | — | BUILD_MAP row. |
| consistency#24 | slow-host handoff | fixed | 04:116 | `reduced-environment` needs the signed `verifyEnv.reduced` allowance; otherwise PARTIAL, no handoff. 01 half already applied (01: "only when the signed policy allows reduced runs (`verifyEnv.reduced`, 03 § 3…"). |
| consistency#27 | parts model | rejected (already fixed) | answer-engines.md:45 | "…a text difference is reported by part `text-diff`". 04 § 1.8 also now requires static part severities (#84). |
| consistency#31 | PRV-025 | rejected (already fixed) | privacy.md:115 | "A field for which the matched entry ha[s no value is not evaluated]…". |
| consistency#32 | required-facts list | fixed | 04:35 | `phones` added; "`name` and `legalName` both absent"; PRV-002/014, PRV-026 `total`, PRV-028 operator-owned outcomes named (verified in privacy.md). |
| consistency#33 | model-host stubs | fixed | 04:222, 04:249 | Stubbed in every stage, server-side and browser; `ux.egressStubs` entry else `200 {}`. |
| consistency#38 | PRV-003 stage | fixed | 04:201 | Exclusive stage before the G6 mutating flows. |
| consistency#39 | A11-026 | rejected (already fixed) | accessibility.md:61 | "A response over 20 MB is not downloaded and is a `budget-exceeded` finding of this rule". |
| consistency#46 | MET-005 fetchers | fixed | 04:134 | GET for social preview fetcher UAs. |
| consistency#47 | IDX-011 | rejected (already fixed) | web-delivery.md IDX-011 | "(with `project.stage: "live"` and `edge.production: true`". |
| consistency#48 | host-unsupported in G8 | fixed | 04:133 | G8 also runs the `http` checks skipped as host-unsupported, without an `edge` channel. |
| consistency#49 | feed owner | rejected (already fixed) | search-engines.md; 03:457 | Applied (adapted) by owners: "owned by `operator` when the path lies under `quality/data/` and by `builder` otherwise". 04 § 14 consistent. |
| consistency#58 | IDX-005 | rejected (already fixed) | web-delivery.md IDX-005 | `preview-edge` rewritten by its owner; 04:136 already says homepage and `robots.txt`. |
| consistency#59 | RTE-004 preview row | fixed | 04:132 | 04 now says "RTE-004 `status` (each sampled URL must answer the Status column…)"; web-delivery RTE-004 already has the preview sentence. |
| consistency#66 | soft-404 merge | fixed | 04:411, 04:465 | Effective list = ruleset ∪ `soft404Phrases[locale]`; general rule in § 15 Page locale. |
| consistency#68 | `remote` defaults | fixed | 04:487, 04:102 | Proposed list; adapted for `contract` (counts as GET/HEAD-capable, not `none`, so live contract checks still run remotely); parts may set `remote`. 03:174 already has `remote?`. |
| consistency#74 | SEC-021 stage | fixed | 04:194 | `override-headers` non-GET repetitions in the first stage group; security.md already says so. |
| consistency#75 | API stage | fixed | 04:197, 04:492 | Non-GET generated requests are mutating; data-api.md already says so. |
| consistency#82 | `db` gate | fixed | 04:28, 04:65, 04:73, 04:518 | Pre-probe `db` detectors in G4 after § 4.2 step 4; DB-001 `apply` prerequisite, builder-owned, also in step 1 and § 15 owners. |
| consistency#83 | SEC-043/044 | adapted | 04:211–212 | Run only with `platform.supabase.mode: "external"` in their mutating stage (exception to `skipped(external-platform)`). With `managed`: kept `notConfigured(platform.supabase.mode)` instead of the proposed `noAdapterSupport`: the missing thing is an Operator input, and `noAdapterSupport` would hide that. |
| consistency#84 | part severities | fixed | 04:102 | "A part's severity is static…two parts". Splitting the security parts is the security fixer's (Location names security.md). |
| consistency#86 | request data flow | fixed | 04:420 | § 13 *Request-derived data flow*; 03 `requestSources` already exists (03:254). |
| consistency#89 | SEC-055 hidden | rejected (already fixed) | security.md SEC-055 | "hidden per 04 § 15 *Hidden content* items 1–6". |
| consistency#90 | SEC-059 budget | fixed | 04:141 | Two GETs per host. |
| consistency#91 | SEC-058 groups | rejected (already fixed) | security.md SEC-058 | "first 5 `auth: required` route groups". |
| consistency#92 | SEC-015 wall clock | fixed | 04:453 | Added to the wall-clock list. |
| consistency#94 | stubbed egress | fixed | 04:223 | Stub-answered requests aren't SEC-004 `egress` findings; security.md already says so. |
| consistency#99 | RES-003 vs RTE-007 | rejected (already fixed) | web-delivery.md RTE-007 | "…judged by RES-003"; 04 § 4.5 unaffected. |
| consistency#100 | RES-004 | fixed | 04:201, 04:249 | Browser host block stage per script-serving `browser: true` host; connection refusal via `route.abort('connectionrefused')`. |
| consistency#101 | handoff row 1 | fixed | 04:113, 04:121 | Same as concreteness #1. |
| consistency#102 | command timeout | fixed | 04:289 | Over `timeoutSec` = builder `command-failed`, never `BLOCKED(budget)`; 03 default 900 already applied. |
| consistency#104 | handoff rows | fixed | 04:117 | Same as concreteness #35. |
| consistency#107 | PRNG | fixed | 04:451 | See orchestrator#prng; 01 TR-103 already points here. |
| consistency#108 | `brief` TR-112 | fixed + xfile | 04:263–268; xfile X6 | Required-pages list and `business.json` excerpts (scope and keys copied from TR-112). WP-307: orchestrator (X6). |
| consistency#114 | TST-004 proxy | fixed | 04:225 | Proxy starts before G1 when TST-004 applies. |
| consistency#115 | ARC-008 scope | fixed | 04:433 | `ARC-008 repo-deps` added to `repo` list. |
| consistency#119 | decision kinds | rejected (already fixed) | 03:469 | `…\|"environment"\|"lock"` present. |
| consistency#121 | G8 summary | rejected (already fixed) | 01:182 | "with `edge.production: true`, `production.origins` (otherwise `SKIPPED`…". |
| consistency#122 | health | fixed | 04:179, 04:181 | Readiness matches 03 § 3.4 (doubling interval, 200–399, `endpoint` → 200); OPS-010 probe in G4 after BLD-005, per-service timeout. |
| consistency#124 | telemetry | rejected (already fixed) | 05:241 | "external link checks (LNK-006/007, TR-106), browser loads of `hosts[]` entries with `browser: true` (04 § 6.1)". |
| consistency#125 | review entries | rejected (already fixed) | 01:241, 03:531 | "one `review.json` entry per (applicable `review`-channel rule, target) pair". 04 § 1.7 now keys on (`rule`, `target`). |
| consistency#129 | `--resume` | fixed | 04:90, 04:523 | Partial cause; reuses finished gates even under `--no-cache`, except never-cached results. |
| consistency#130 | caching | fixed | 04:527 | Same as concreteness #21. |
| consistency#132 | calibration | fixed + xfile | 04:255; xfile X3 | Calibration at the first of G4/G6 that runs; X3 aligns TR-111. CRW-001 half already applied in programmatic.md ("defaults to 1000 even when the perfo[rmance pack…]"). |

## Ownership rows
None. No new rule IDs or parts. New outcome reasons (`skipped(deferred)`, `skipped(no-review)`, `skipped(not-generatable)`, `blocked(prerequisite: G6)`, `blocked(prerequisite: DB-001)`, `BLOCKED(root-container)`) and the page-locale `missing-element` finding belong to the WPs that already own those 04 sections.

## Ruleset data
- `secret-patterns.json` — `{ formatVersion, patterns: [{ id, provider, regex }] }` — WP-104 main row, item "provider secret-key patterns (SEC-050)" (name the file there).
- `recipes/<adapter id>.json` — `{ formatVersion, recipes: [{ id, title, files, snippet }] }` — WP-104 bullet "Foundation recipes per adapter (04 § 7 `brief --stage start`)" (name the files there).

## Policy keys added (key · type · default · file)
None in policy. Adapter-manifest key requested via xfile X5: `matcherWidening` · `[{ from, to }]` · `[]` · `spec/03-formats.md` § 6. Report field requested via X4: `findings[].absorbed` · string[] · `[]` · `spec/03-formats.md` § 17.

## spec-lint (last three lines)
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":30,"warnings":64}
  errors by check: ownership=23 channel-infra=7
  warnings by check: ruleset-unsourced=64
```
None of the 30 errors is in `spec/04-algorithms.md`. They are 23 `ownership` errors ("has no owning work package": A11-030, PRV-029…PRV-037, DAT-018, CRW-004, RES-008, SE-128, LOC-004, SEC-074, SEC-075, UX-023, UX-024, RTE-016, RTE-017, URL-014, I18-010), which are new IDs from other fixers waiting for orchestrator ownership rows, and 7 `channel-infra` errors (DAT-006 → WP-502 not depending on WP-407; SE-002, SE-501 → WP-411 and SCH-006, SCH-010, TRS-002 → WP-410 not depending on WP-601), which are BUILD_MAP dependencies (orchestrator). The one warning this pass caused is expected: `ruleset data "secret-patterns" (spec/04-algorithms.md:423) is not listed in BUILD_MAP WP-102/WP-104`. It clears when the orchestrator adds the Ruleset data row above.
