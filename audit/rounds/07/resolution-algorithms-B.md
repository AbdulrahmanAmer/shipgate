# Resolution — algorithms — pass B — round 07
| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-core-adapters-ux#X1 | 04 § 15 PRNG: "value streams defined in 01 TR-103; ChaCha8/Fisher–Yates gone" | adapted + xfile | spec/04-algorithms.md:457 (unchanged) | Conflicts with the single-definition rule: 04 § 15 already defines *Values* precisely (32 raw lock-digest bytes, UTF-8 s, decimal-ASCII k), and 01 TR-103 itself says "selections are defined once, in 04 § 15". Kept 04 as the only definition; ChaCha part already present ("no ChaCha stream or shuffle is used"). Filed from-algorithms.md X7: 01 TR-103 value-stream formula → pointer to 04 § 15. |
| xfile-core-adapters-ux#X2 | § 1.6 step 2: `en` fallback of per-locale data = partial cause | rejected | — | passB-notes #1: a page locale with no ruleset entry is a blocking `missing-element` owned by `operator` (04 § 15 *Page locale* → *No entry*: "the check is not skipped and not `notApplicable` … one blocking finding per (rule, locale)"), never a skip/partial/`reduced-environment`. ux.md:73 still says otherwise; that is the ux fixer's edit under the same note. |
| xfile-core-adapters-ux#X3 | § 1.9 `reduced-environment` row: slow-host only with `verifyEnv.reduced`; + unsupported page locale | rejected (slow-host part already fixed; locale part per passB-notes #1) | spec/04-algorithms.md:117 | Row already reads "only when the signed policy allows reduced runs (`verifyEnv.reduced.allowed: true` … without it a slow host gives `PARTIAL` and no handoff)". Locale part: see X2. |
| xfile-core-adapters-ux#X4 | § 1.2: facts-oracle + UX-023 `claims`, UX-024 `register`; required-facts + UX-023 `minimum`, UX-001 `mobile` | fixed | spec/04-algorithms.md:33, :35 | Verified parts in ux.md (UX-023 `claims`/`minimum`, UX-024 `register` builder-owned, UX-001 `mobile` operator-owned). Content kinds "commercial terms, unregistered images" added; missing-input examples add `terms.returns.windowDays` and the mobile-flow gap. |
| xfile-core-adapters-ux#X5 | § 1.5 G8 row "G0 (UX-022: also G6)" | rejected (already fixed) | spec/04-algorithms.md:60 | Row reads "G0; the UX-022 and SEC-065 checks also need G6 (they read its UX-001 form inventory and `journey: "checkout"` flows)". |
| xfile-core-adapters-ux#X6 | § 7 brief: required pages at stage start; `business.json` excerpts = every key, ≤ 40 lines, arrays cut | fixed (stage-start part already present) | spec/04-algorithms.md:267 | Output now "every key present in the file, 03 § 14; keys sorted; ≤ 40 lines, arrays cut in file order with the count of omitted entries" (matches 01 TR-112). Stage-start list already had "the **required pages** of TR-112 … each with its rule ids" (:271). |
| xfile-core-adapters-ux#X7 | § 4.6 G1 proxy for TST-004 | rejected (already fixed) | spec/04-algorithms.md:228 | "**G1 tests:** when TST-004 applies, the egress proxy starts before G1 and G1 test commands get the same proxy variables … in reduced runs TST-004 `egress` is `skipped(reduced)`." |
| xfile-core-adapters-ux#X8 | § 4.2 step 5: statement logging stays on (03 § 8 Operator-owned sources) | fixed (merged with formats#1) | spec/04-algorithms.md:190 | One sentence serves both requests. |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#X1 | § 4.2 step 8 chain: RES-008 delivery faults, OPS-012 graceful shutdown | fixed | spec/04-algorithms.md:203 | Matches resilience RES-008 and ops OPS-012 ("in its own mutating stage"). |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#X2 | § 4.5: OPS-003 `event`; RES-003 probe URLs in degradable stages | adapted | spec/04-algorithms.md:217 | Probe-URL wording aligned with resilience.md RES-003 ("for each route group matching the entry's `routes`, its lowest-ranked crawled 200 URL, stream id `fault-20`"). |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#X3 | § 4.6 delivery-fault bullet | fixed | spec/04-algorithms.md:226 | |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#X4 | § 13 DB-008 bullet | fixed | spec/04-algorithms.md:424 | Identical to data-api.md DB-008 text. |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#X5 | § 13 ARC-006 API family names incl. `dbClientApis` | fixed | spec/04-algorithms.md:431 | Matches architecture.md ARC-006. `dbClientApis` is not yet in 03 § 6 (their Y1 request to the formats fixer); spec-lint reports no error for it. |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#X6 | § 4.2 step 4: MySQL DB-003 `rewrite` probe | fixed | spec/04-algorithms.md:189 | Matches data-api.md DB-003 `rewrite`. |
| xfile-formats-integrations#1 | § 4.2 step 5 statement log for seeded rows | fixed | spec/04-algorithms.md:190 | Text as proposed ("as in step 4"). |
| xfile-formats-integrations#2 | § 4.3 seed-contract clarification | adapted | spec/04-algorithms.md:208 | Cites 03 § 8 *Operator-owned sources* instead of restating it (passB-notes #4). |
| xfile-formats-integrations#9 | § 1.8 "A part's severity is static …" | rejected (already fixed) | spec/04-algorithms.md:102 | "A part's severity is static: a severity that depends on an input … is two parts, each with its own static severity." |
| xfile-formats-integrations#11 | § 13 request-derived data flow | rejected (already fixed) | spec/04-algorithms.md:425 | "**Request-derived data flow** (SEC-003 `source`, SEC-027, SEC-045, SEC-062 …): a value is request-derived when it comes from a call matching the adapter's `requestSources` (03 § 6) …". |
| xfile-formats-integrations#13 | § 15 default `remote`: mutating-stage text, fault rules, TST, OPS; channels `cfg/lock/hook/baseline/contract/review` → `none` | rejected (already fixed; `contract` sub-part rejected as wrong) | spec/04-algorithms.md:493 | Present: "every rule or part whose text says "(mutating stage, 04 § 4.2 step 8)", every fault rule (RTE-007, RES-\*) and TST-001…TST-010 are `write`; OPS-001…OPS-005 and OPS-007…OPS-014 are `none`". Kept "`contract` counts as GET/HEAD-capable": G4 contract checks of live responses are reads against a remote service; `none` would silently drop them for remote services (weakening). |
| xfile-formats-integrations#20 | § 4.1 health polling; OPS-010 timeout "in G4 after BLD-005" | rejected (already fixed) | spec/04-algorithms.md:181, :183 | "starting at `intervalMs` and doubling … up to 5,000 ms, until a 200–399 response (… with `endpoint: true` only 200) or `timeoutSec`"; OPS-010 "in G4, after BLD-005 passed for the service … within `verifyEnv.health.<service>.timeoutSec`". |
| xfile-formats-integrations#21 | `--resume` partial cause | rejected (already fixed) | spec/04-algorithms.md:90, :529 | § 1.6 step 2: "a run with `--resume` (§ 15 …)"; § 15: "the run is partial (§ 1.6 step 2), so it never is the definition-of-done run". |
| xfile-privacy-a11y-perf#X1 | § 4.2 step 8: PRV-035 `regret`, PRV-018 messages | fixed | spec/04-algorithms.md:203 | |
| xfile-privacy-a11y-perf#X2 | § 1.2 required-facts: PRV-029/030/031/033/034/035, PRV-002/014, PRV-018, PRV-026 `total`, PRV-028 `terms`; missing-value list | fixed (missing-value list already fixed) | spec/04-algorithms.md:35 | Each operator-owned clause verified in privacy.md. PRV-002/014, PRV-018, PRV-026, PRV-028 kept in the "same holds for … that their pack text says are owned by `operator`" sentence with the requested qualifiers. "`phones` … `name` and `legalName` both absent" was already present. |
| xfile-privacy-a11y-perf#X3 | § 1.2 facts-oracle: PRV-029 builder-written signals | fixed | spec/04-algorithms.md:33 | |
| xfile-programmatic-search#X1 | § 14 per-locale ruleset lookup `ll-CC` → `ll` → `en` | adapted | spec/04-algorithms.md:450 | A second lookup with a silent `en` fallback would contradict 04 § 15 *Page locale* (passB-notes #1, #2). § 14 bullet now names the files and points to § 15 for lookup and the no-entry outcome; kept the "other key, no fallback" exception (`postal-patterns.json`). No pack still cites "04 § 14" for locale lookup (grep). |
| xfile-programmatic-search#X2 | § 13 TPL-001 hub route files | fixed | spec/04-algorithms.md:434 | |
| xfile-programmatic-search#X3 | § 11 skeleton per hub; CNT-006 pointer | fixed | spec/04-algorithms.md:397, :400, :404 | |
| xfile-programmatic-search#X7 | § 1.2 required-facts: DAT-006 `fixtures`, DAT-018 `rights` | fixed | spec/04-algorithms.md:35 | |
| xfile-programmatic-search#X8 | § 2 item 7 fixture pass; CRW-001 edge sample | adapted | spec/04-algorithms.md:146, :157, :203 | "before the first G4 write probe" (not "first mutating stage") so it sits with the preview pass; § 4.2 step 8 stage-order sentence now lists the fixture pass after the preview pass. CRW-001: "none → `notApplicable` in the edge pass" (matches programmatic CRW-001). |
| xfile-programmatic-search#X9 | § 10 trap drops recorded; `loop` limit | fixed | spec/04-algorithms.md:373 | `loop` added to the recorded limit names; a `loop` drop also makes the crawl incomplete (existing *Complete crawl* text). |
| xfile-security#X4 | § 1.2 required-facts: SEC-064 `maxima` | fixed | spec/04-algorithms.md:35 | |
| xfile-security#X5 | § 1.8 static part severities with SEC examples; `notConfigured` for missing TTL var | adapted | spec/04-algorithms.md:102, :107 | Static-severity sentence already present; added the `notConfigured(<input>)` clause and an *Input-dependent security parts* example bullet (part names verified in security.md). |
| xfile-security#X6 | § 13 request-derived data flow + SEC-062 `output-sinks` | adapted | spec/04-algorithms.md:425 | Base bullet already present (formats#11); appended the `modelApis` source sentence. |
| xfile-security#X7 | § 15 reference time: SEC-015 wall clock | rejected (already fixed) | spec/04-algorithms.md:459 | "(SEC-015 `Expires`, SEC-056 certificate validity, SEC-059, IDX-011) use the wall clock." |
| xfile-security#X8 | § 13 SEC-050 `env-value` = SEC-005 secrets | fixed | spec/04-algorithms.md:428 | Criteria copied from security.md SEC-005. |
| xfile-security#X9 | § 15 default `remote` metadata (consistency#68) | rejected (already fixed) | spec/04-algorithms.md:493 | See formats#13. |
| xfile-security#X10 | § 15 Hidden content: SEC-055 honeypot consumer | fixed | spec/04-algorithms.md:501 | |
| xfile-web-delivery#1 | § 10 HTTP sample / browser-sampled definition | fixed | spec/04-algorithms.md:378 | "kept by the HTTP stratum of the Sampling rule" (disambiguates from the browser stratum). web-delivery.md:72 already points here. |
| xfile-web-delivery#2 | § 15 fallback body `{n}` | adapted | spec/04-algorithms.md:491 | `{n}` hashes "the 32 raw lock-digest bytes" (same encoding as *Lock-digest PRNG*); RTE-004 already cites "the 04 § 15 fallback-body path". |
| xfile-web-delivery#3 | § 12 leak-scan exemption via `web-delivery.leakIgnore` | fixed + xfile | spec/04-algorithms.md:416 | Key exists in web-delivery.md:27; not in 03 § 3.5 — filed from-algorithms.md X8. |
| xfile-web-delivery#6 | § 2 item 5 URL-014 edge probes | fixed | spec/04-algorithms.md:135 | |
| passB-notes#1 | page locale with no entry → blocking operator finding | fixed | spec/04-algorithms.md:470–472, :450 | § 15 *No entry* already normative; § 14 bullet points to it; CAU X2/X3 locale parts rejected. |
| passB-notes#2 | indexable page and page locale defined once in 04 § 15 | fixed | spec/04-algorithms.md:462, :470, :450 | No second definition in 04 (§ 10 and § 12 cite § 15). |
| passB-notes#3 | SEC-028 no logout flow → operator `missing-element` | fixed | spec/04-algorithms.md:35 | Added to required-facts list (security.md SEC-028 already operator-owned). |
| passB-notes#4 | cite 03 § 8 *Operator-owned sources*, don't restate | fixed | spec/04-algorithms.md:190, :208 | |
| passB-notes#5 | orchestrator-owned targets skipped | n/a | — | No request in my inputs targets those files. |

## Ownership rows
(none — no new rule IDs or parts)

## Ruleset data
(none new; `secret-patterns.json` and `recipes/<adapter id>.json` already requested in from-algorithms.md X6)

## Policy keys added (key · type · default · file)
(none — `web-delivery.leakIgnore` · CSS selector[] · `[]` · already defined in spec/packs/web-delivery.md:27; 03 § 3.5 listing requested in from-algorithms.md X8)

## spec-lint (last three lines)
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":0,"warnings":65}
  errors by check: none
  warnings by check: ruleset-unsourced=64 ruleset-unnamed=1
```
No warning points at spec/04-algorithms.md; all 65 are ruleset-sourcing rows for the orchestrator (BUILD_MAP WP-102/WP-104), in pack files.
