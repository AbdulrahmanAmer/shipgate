# Resolution — algorithms — pass B — round 08
| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-core-adapters-ux#7 | § 1.2 required-facts: UX-025/UX-027 `declared`, form identity, examples | fixed | 04:35 | Verified ux.md UX-025/UX-027 part `declared` are operator-owned `missing-element`; "form identity" is UX-001's term (ux.md:35). Inserted after "UX-001 part `mobile`;"; examples extended verbatim. |
| xfile-core-adapters-ux#8 | § 1.2 facts-oracle: UX-025 `static` | adapted | 04:33 | Added to the rule list as requested; also added "tracking or pixel IDs in tags" to the parenthesised content-kind list so the list stays exhaustive. |
| xfile-core-adapters-ux#9 | § 4.2 step 8 RES-008 stage order (consistency#43) | rejected (already applied) | 04:219 | Applied in pass A: "→ delivery faults (RES-008, one stage per form key of this run's G6 UX-001 form inventory × fault …) → load (PRF-011)". |
| xfile-core-adapters-ux#10 | § 4.3 seed contract (consistency#62) | rejected (already applied) | 04:224 | Applied in pass A: "only when the diff (§ 5) changes no seed input, no migration and no file under the failing service's `path`". |
| xfile-core-adapters-ux#11 | § 1.5 early stop (consistency#70) | rejected (already applied) | 04:67–69 | Applied in pass A: "invalid lock signature"; "Before stopping, shipgate still runs the diff parts of AGT-001 and AGT-006 …". |
| xfile-core-adapters-ux#12 | § 4.2 step 4 `data-api.db.service` (consistency#66) | rejected (already applied) | 04:203 | Applied in pass A: "otherwise the `migrate` command of the service named by `data-api.db.service`". |
| xfile-core-adapters-ux#13 | § 11 live-mode snapshot (consistency#21) | rejected (already applied) | 04:428 | Applied in pass A: "`family.snapshot { db, sql }` → JSONL (ownership and the no-source outcome: programmatic § 6 *live*)". |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#7 | § 1.2 required-facts: OPS-005 `postal`, API-003 kind (c) harvest | fixed | 04:35 | Verified ops.md:34 and data-api.md:56 name these operator-owned outcomes and cite 04 § 1.2. |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#8 | § 4.2 step 8: REF-004 non-GET replays after load | fixed | 04:219 | Matches refactor.md:54 ("mutating stage … placed after the load stage"). |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#9 | § 2 item 5: OPS-016 RDAP requests | adapted | 04:154 | Appended to the AEO-002/OPS-006/SEC-015 bullet; "(with `edge.production`)" moved next to the rule id. TR-106 bullet is 01's (requested by that fixer to 01 directly). |
| xfile-privacy-a11y-perf#X1 | § 1.2 "The same holds for …" sentence | fixed | 04:35 | Proposed full text applied verbatim; each named outcome checked against privacy.md (PRV-016, 021, 022 `jp-sct`, 023/027, identification page § 1 line 83, 037, 038 `registry`/`representative`, 039, 040, 041, 042). |
| xfile-privacy-a11y-perf#X2 | § 15 *Disclosure exemption* item 5: phrase match | adapted | 04:539 | Phrase-match wording applied; per the owner's note, the carousel region now also includes A11-021's shipgate-detected auto-advancing region (markers kept: the exemption is verified by activation, so markers cannot fake it). Residual (not in any input row): `carousel-controls.json` holds pause/stop/play labels only, so the "next-slide control" the *Verified, not trusted* paragraph clicks is still undefined — needs a `next` label list in the accessibility ruleset; for the round-09 audit. |
| xfile-privacy-a11y-perf#X7 | § 4.2 step 8: A11-033 in SEC-064 `lifetime`; PRV-041/042 flows | adapted | 04:212, 04:219 | A11-033 clause applied. The G6 enumeration did not list PRV-037 `notice`, so "PRV-037 `notice`, PRV-041 `confirm` and PRV-042 `uk-osa` flows" was added together after PRV-018 (all three are `mutates: true` Operator flows per privacy.md:151, :168, :173). |
| xfile-programmatic-search#X2 | § 15 *robots.txt evaluation* users list | adapted | 04:484 | Requested ids added; list completed with every other citer found by grep (AEO-002, IDX-004, IDX-009, MET-014, SCH-004 `Organization` `logo`, SCH-009, § 10 crawl). |
| xfile-programmatic-search#X3 | § 10 *Extraction*: first discovery page (SE-129) | fixed | 04:394 | Matches SE-129 *origin page* (search-engines.md:84). |
| xfile-programmatic-search#X9 | § 11 *Relations*: candidate-set pointer | adapted | 04:411 | Pointer applied; "Ties → slug ascending" now says "(not for `declared`, which keeps listed order)" so 04 no longer contradicts PCF-005. |
| xfile-security#X1 | § 4.2 step 8: short-lifetime stages, SEC-077 | adapted | 04:210, :211, :215, :217 | SEC-029 written as "SEC-029 `single-use`, SEC-029 `expiry`" (a parenthesis in that list means "one stage", 04:209, so "(part `single-use`)" would misread); SEC-077, SEC-044 `signed-url-expiry` and the replay entry applied; short-lifetime paragraph inserted after the replay paragraph. |
| xfile-security#X2 | § 1.2 required-facts: payments without checkout flow | adapted | 04:35 | Applied; SEC-041 clause worded "when checkout flows exist but none has a `markAmount` step" to match security.md:55. |
| xfile-security#X3 | § 2 item 5: SEC-079 edge requests | fixed | 04:145 | Matches security.md:142; ruleset named as `object-storage-hosts.json`. |
| xfile-security#X4 | § 15 *Lock-digest PRNG* nonce length | fixed + xfile | 04:480; xfile/from-algorithms.md "Pass B additions" | 01-core.md:253 restates the old nonce text; exact edit appended for the orchestrator (pass B has no later fixer pass). |
| xfile-security#X5 | § 13 request-derived data flow users | fixed | 04:448 | SEC-031 cites "04 § 13 *Request-derived data flow*" (security.md:118). |
| xfile-web-delivery#3 | § 1.2 required-facts: TRS-001 | fixed | 04:35 | URL-011 entry kept. Matches web-delivery.md:302. |
| xfile-web-delivery#5 | § 2 item 2: proxy forwards I18-011 geo headers | fixed | 04:133 | Also added "I18-011 geo serving" to the parenthesised purpose list. Matches web-delivery.md:283. |
| xfile-web-delivery#6 | § 2 item 5: MET-005 `fetchers-edge`, MET-014, URL-015 | fixed | 04:137, :149, :150 | Matches web-delivery.md:178, :197, :170. |

Counts: 24 rows — fixed 11 (1 of them also with an xfile row to 01), adapted 8, rejected (already applied) 5, xfile-only 0.

## Ownership rows
None (no new rule IDs or parts).

## Ruleset data
None new. (Observation for the accessibility owner, not added: `carousel-controls.json` would need a `next` list for the § 15 *Disclosure exemption* activation; see xfile-privacy-a11y-perf#X2 note.)

## Policy keys added (key · type · default · file)
None.

## spec-lint
```
spec-lint: {"requirements":575,"rules":556,"toolRequirements":19,"rulesWithParts":201,"errors":0,"warnings":0}
  errors by check: none
  warnings by check: none
```
(First run warned `ruleset-unsourced` on "probepaths" at 04:145 — lint read `probePaths` as a ruleset name; reworded to "`probePaths` entry of ruleset `object-storage-hosts.json`" and re-ran: clean.)
