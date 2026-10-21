# Resolution — algorithms — pass B — round 06

File: `spec/04-algorithms.md`. Inputs: every request in `audit/rounds/06/xfile/from-*.md` (8 files) targeting 04, numbered below in file order (core-adapters-ux, data-refactor-…, privacy-a11y-perf, programmatic-search, security, web-delivery); `from-algorithms.md` and `from-formats-integrations.md` contain no request targeting 04. Plus the orchestrator instructions: settle RES-002 vs 04 § 4.5 (`pageMs` + 5,000 ms, per data-refactor X3) and make the 04 § 16 definition-of-done line agree with DECISIONS D-002. Requests targeting `spec/CHANGES.md`, `BUILD_MAP.md`, `trace/ownership.tsv` or `tools/` (algorithms X8, data-refactor X12) are the orchestrator's and are not listed here. Line numbers refer to `spec/04-algorithms.md` after this pass.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-algorithms#X1 | core-adapters-ux C1 — § 1.2 facts-oracle list: UX-020 `timer`, "countdown timers" | fixed | 04:33 | Merged with X11 (LOC-001) in the same sentence. ux.md UX-020 `timer` already cites 04 § 1.2 for `offers` absent. |
| xfile-algorithms#X2 | core-adapters-ux C2 — § 1.2 required-facts list: UX-015 missing `providerId`, UX-022 launch-form confirmations | adapted | 04:35 | Merged with X9 and X11 into one list. Because UX-015/UX-022 are not legal requirements, "the law requires the content" became "the law, the payment provider or the launch check requires the content"; "a page" became "a page, flow or form"; "that `business.json` doesn't hold" became "that the Operator's files don't hold" (launch-forms.json is not business.json). |
| xfile-algorithms#X3 | core-adapters-ux C3 — § 15 Reference time: expiry clock and UX-020 `timer` | fixed | 04:441 | Matches 01 § 5.4 "Expiry clock" and TR-103 (01:251). |
| xfile-algorithms#X4 | core-adapters-ux C4 — § 16 Caching: wall-clock outcomes never cached | fixed | 04:503 | Appended to the key paragraph. |
| xfile-algorithms#X5 | data-refactor X1 — § 4.2 step 8: API-006, API-007 stages | fixed | 04:192 | Both rules say "mutating stage, 04 § 4.2 step 8" in data-api.md. |
| xfile-algorithms#X6 | data-refactor X2 — § 4.2 step 4: statement logging, one invocation per migration file | adapted | 04:182 | Added the concrete logging switches (PostgreSQL `log_statement = all`, MySQL general log) so step 4 is decidable; matches DB-006 text and 03 adapter `migrations.applyCommand`. |
| xfile-algorithms#X7 | data-refactor X3 — § 4.5: dependency source and delay `pageMs` + 5,000 ms | adapted | 04:210 | **Delay: fixed as requested** (`resilience.timeouts.pageMs` + 5,000 ms, with the reason: longer than the page budget, so a service with no upstream timeout can't answer within `pageMs`); now equal to RES-002 (resilience.md:21). **Dependency source: adapted** — X3 asked for `dependency: true`, but 03 § 3.3 (formats-integrations pass A) removed that boolean ("iff `purposes` contains `dependency` (there is no `dependency` boolean)") and resilience.md:10 says the same; 04 now reads "entries whose `purposes` contain `dependency`, 03 § 3.3" and names `verifyEnv.databases`. Conflict notice for data-refactor X9 appended to `xfile/from-algorithms.md` (X9 pass B). |
| xfile-algorithms#X8 | data-refactor X4 — § 13 ARC-008: `architecture.<service>.entryPoints` | fixed | 04:415 | Matches architecture.md ARC-008. |
| xfile-algorithms#X9 | privacy-a11y-perf X5 — § 1.2 required-facts: PRV-022 `imprint`, `controller` | fixed | 04:35 | Missing-value list extended with `legalName`, `postalAddress`, `emails` (privacy.md:83 names these parts as required-facts). |
| xfile-algorithms#X10 | programmatic-search X1 — § 15 single *Hidden content* definition | adapted | 04:472–481 | The pass-A definition (stronger in places) is kept and the request's additions merged in: SE-109 added to the users; "the only definition"; evaluated 2 s after `load` at both viewports; `content-visibility: hidden`; opacity as the product over ancestors < 0.05 (instead of `opacity: 0`); sr-only/`clip: rect(0 0 0 0)` named; off-screen uses the text-node rects for `text-indent`; "a rule that applies the definition without the exemption says so (AEO-014 `ai-addressed`)"; no ΔE test. Not taken: (a) the request's viewport sizes (412 × 823 / 1350 × 940) — the spec already defines viewports in 03 § 10 (`mobile` 390×844, `desktop` 1366×768), so 04 uses those names; (b) "text over a `background-image` or media is never same-colour" — that would weaken the pass-A screenshot test, which measures the real background; (c) the request's unverified exemption list — the pass-A *Disclosure exemption* (04:482–490) covers the same cases (closed `<details>`, `aria-expanded="false"`, tabpanels, dialogs/popovers, carousels, `<template>`/`<noscript>`) and verifies each by activating the control. |
| xfile-algorithms#X11 | programmatic-search X4 — § 1.2: LOC-001 facts-oracle, LOC-003 required-facts | fixed | 04:33, 04:35 | Matches search-engines.md:122–123. |
| xfile-algorithms#X12 | programmatic-search X8 — § 15 *Facet probes*: probe bases | fixed | 04:471 | Matches search-engines.md § 3.3 (line 74). |
| xfile-algorithms#X13 | programmatic-search X10 — § 11 steps 6a and 8: TPL-005 / TPL-006 reporting | fixed | 04:383, 04:385 | Matches programmatic.md TPL-005/TPL-006. |
| xfile-algorithms#X14 | security X1 — § 4.2 step 8: SEC-003, SEC-021/022, SEC-043, SEC-044, SEC-067 stages; replay list | fixed | 04:189–194 | Each rule says "mutating stage, 04 § 4.2 step 8" in security.md (verified by grep). Composed with X5 on the last bullet. |
| xfile-algorithms#X15 | security X2 — § 10 Order: SEC-071 POST exception | fixed | 04:361 | Matches security.md SEC-071 ("04 § 10 exception"). |
| xfile-algorithms#X16 | security X3 — § 1.8 SEC-050 `env-file` P0† | fixed | 04:103 | Part exists in security.md. |
| xfile-algorithms#X17 | web-delivery X2 — § 12 one token-overlap definition | adapted | 04:398–399 | Merged into the pass-A "Overlap" bullet (renamed **Token overlap**, "the only definition") rather than adding a second bullet: NFKC, full case folding, UAX #29, punctuation-only tokens dropped, multisets; references for RTE-001, RTE-014 (desktop), IDX-013, RES-003; link overlap over multisets of canonicalised `a[href]` in `<main>`; empty reference → 1.0. RTE-014 bullet now says "token overlap (reference: desktop)". |
| xfile-algorithms#X18 | web-delivery X3 — § 1.4 SKIPPED for G5 | adapted | 04:44 | "every rule with a `content` channel outside the programmatic pack (CQ-002, CQ-008, CQ-010) is `notApplicable`" — the qualifier stops TPL/CNT content rules (which are `notApplicable` without families anyway) from making the condition circular. |
| xfile-algorithms#X19 | web-delivery X4 — § 1.8 RTE-010 `empty-ua` W | fixed | 04:100 | Part exists in web-delivery.md. |
| xfile-algorithms#X20 | web-delivery X5 — § 15 Visible dates: SCH-005 | fixed | 04:460 | SCH-005 cites "04 § 15 visible dates". |
| xfile-algorithms#X21 | orchestrator — § 16 definition-of-done line must agree with DECISIONS D-002 | fixed | 04:503, 04:506 | D-002: "a sealed PASS is never built from cached gate results of a different environment hash"; 01:232 and 03:488 already say cached results count only for an equal environment hash. 04 said the DoD run "implies `--no-cache`", contradicting both. Now: the DoD run reuses a cached gate result only when its full cache key (environment hash included) equals this run's (`gates[].cache: hit`, 03 § 17); it still ignores `--resume` and is the only run that can seal a PASS. The key line keeps `--no-cache` for base-branch CI (05 § 5). |

Outcome counts: fixed 15 · adapted 6 · rejected 0 · xfile 0 (plus one conflict notice appended to `xfile/from-algorithms.md`, X9 pass B, for the 03 fixer: do not apply data-refactor X9).

## Ownership rows
None (no new rule IDs or parts).

## Ruleset data
None new. (`carousel-markers.json`, `carousel-controls.json` were already referenced by the pass-A *Disclosure exemption*.)

## Policy keys added (key · type · default · file)
None. (`resilience.timeouts.pageMs` and `architecture.<service>.entryPoints` already exist in their packs.)

## spec-lint
`node tools/trace/spec-lint.mjs` → exit 0. Last three lines:
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":142,"errors":0,"warnings":0}
  errors by check: none
  warnings by check: none
```
(Run while the other pass-B fixers were editing in parallel; it reflects the tree at that moment.)
