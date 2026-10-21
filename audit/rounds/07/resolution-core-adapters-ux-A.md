# Resolution — core-adapters-ux — pass A — round 07

Files: spec/01-core.md, spec/02-adapters.md, spec/packs/ux.md. Cross-file requests: `audit/rounds/07/xfile/from-core-adapters-ux.md` (X1–X18). "Page locale" and "indexable" are cited as 04 § 15 (being written by the algorithms fixer); neither 01 nor ux.md defines its own. `spec/CHANGES.md` is outside this fixer's files: the orchestrator writes its entries from this table.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-core-adapters-ux#1 | CFG-009 | fixed | 01-core.md:139 | UAX #29 words of `<body>` text outside script/style/template/noscript. |
| concreteness-core-adapters-ux#2 | CFG-004 | fixed | 01-core.md:134 | `AKIA` + 16 × `[0-9A-Z]`. |
| concreteness-core-adapters-ux#3 | CFG-005 | fixed | 01-core.md:135 | Literal-path overlap procedure; protected set = § 5.2 Operator/Verifier rows, policy `protected` (03 § 3), built-ins (05 § 3.1); class `schema-violation`. |
| concreteness-core-adapters-ux#4 | TR-103 | fixed + xfile | 01-core.md:252, :241; xfile X1, X12 | ChaCha8/Fisher–Yates removed; selections = 04 § 15 hash ranking; value-stream formula kept in TR-103 (04 § 15 asked to point to it); `audit-targets` stream. |
| concreteness-core-adapters-ux#5 | TR-112 | fixed + xfile | 01-core.md:265; xfile X6 | "every key present (03 § 14)", capped at 40 lines (matches consistency#108's 04 § 7 text). |
| concreteness-core-adapters-ux#6 | 02 § 3 Detection | fixed | 02-adapters.md:55 | Manifest list per ecosystem as proposed, plus the TOML/go.mod sections read. |
| concreteness-core-adapters-ux#7 | UX-003, UX-004 | adapted | ux.md:34, :35 | Candidate procedures for phone/e-mail/price adopted; default region and page locale cite 04 § 15. UX-004 *visible occurrence* defined. |
| concreteness-core-adapters-ux#8 | UX-003 `phones` / LOC-001 | fixed + xfile | ux.md:34; xfile X17 | Part `phones` skipped only on indexable pages (04 § 15 indexable); LOC-001 `owns` mirror requested. |
| concreteness-core-adapters-ux#9 | per-locale rulesets (Blocker) | adapted + xfile | ux.md:73; xfile X2, X3, X11 | Page locale = 04 § 15 page locale (no own definition, never `<html lang>`). Lookup full tag → primary subtag → `en`. Operator decision taken at the auditor's default: `en` fallback by a facts-oracle rule or UX-021 → run partial, base PASS → PARTIAL with `reduced-environment` handoff; locale listed in `coverage.unsupportedLocales`. Needs 04 § 1.6/§ 1.9 and 03 § 17 edits (xfile). |
| concreteness-core-adapters-ux#10 | phrase matching | fixed | ux.md:75 (+ cited at :43, :58) | Literal-list matching with UAX #29 word boundaries, CJK/SEA substring; regex lists on NFKC visible text; *Visible text* defined at ux.md:74. |
| concreteness-core-adapters-ux#11 | failure classes | fixed | ux.md:76; inline at :33, :34, :35, :37, :40, :46, :58 | List as proposed; also stated in the rule texts. |
| concreteness-core-adapters-ux#12 | UX-006 remote | fixed | ux.md:37 | `remote: write`; read-only remote → `skipped(remote-read-only)`, controls listed; probe clicks only MET-011 `<a>` targets. |
| concreteness-core-adapters-ux#13 | UX-007 | fixed | ux.md:38 | `accessibility.viewports` default `[320, 768, 1280]` even with the pack off. |
| concreteness-core-adapters-ux#14 | UX-010 shapes | fixed | ux.md:77, :20, :25 | Shapes in § 3; `analyticsMatchers` replaces the entry; CFG-006 check in the new ux `Validation:` paragraph. |
| concreteness-core-adapters-ux#15 | UX-010 no accept control | fixed | ux.md:41 | `missing-element` once per page, hits not counted (privacy *Label match*). |
| concreteness-core-adapters-ux#16 | UX-012 | fixed | ux.md:42 | As proposed. |
| concreteness-core-adapters-ux#17 | UX-014 `people` | fixed | ux.md:44 | `team.name` selectors + h3–h6 not matching `team.headings`. |
| concreteness-core-adapters-ux#18 | `testimonial-markers.json` | fixed | ux.md:78 | Shape as proposed. |
| concreteness-core-adapters-ux#19 | `payment-amounts.json` | fixed + xfile | ux.md:79, :45; xfile X18 | Shape as proposed; PRV-026 asked to point here. |
| concreteness-core-adapters-ux#20 | `ratingPatterns`, `claimPatterns` | fixed | ux.md:80 | Shapes as proposed. |
| concreteness-core-adapters-ux#21 | UX-020 `stock` feed | fixed | ux.md:56, :25 | Feed item by requested URL after redirects (04 § 10 normalisation), never `rel=canonical`; `feed` without `merchantFeed` = CFG-006 `schema-violation`. |
| concreteness-core-adapters-ux#22 | UX-021 | fixed | ux.md:58 | Links outside `<main>` not read; first link inside `<main>` in document order. |
| concreteness-core-adapters-ux#23 | UX-022 form key | fixed | ux.md:59 | 0-based step, `<outer>.<inner>` for frame/popup, one key per outcome step up to next `goto`. |
| consistency#11 | UX-022 ↔ G6 | fixed + xfile (ownership/BUILD_MAP skipped) | ux.md:59; xfile X5 | `blocked(prerequisite: G6)` when G6 didn't run or is BLOCKED. ownership.tsv already moves UX-022 to WP-609 (row 560); BUILD_MAP/ownership parts are the orchestrator's. |
| consistency#13 | UX-020 Operator-owned sources | adapted + xfile | ux.md:54, :56, :57; xfile X8 | Instead of a second definition, UX-020 cites the single 03 § 8 *Operator-owned sources* (already in 03: seed files that are lock inputs, no other writer); invalid source = unmapped (blocking `forbidden-value`); feed only under `quality/data/`. 04 § 4.2 asked to keep statement logging on through steps 5–6 so 03 § 8 is decidable. |
| consistency#14 | UX-020 `db` channel | fixed | ux.md:54 | Channels `browser, html, db`; metadata `gates: [G4]`. |
| consistency#22 | BUILD_MAP stub-scan vs `egressStubs` | skipped (orchestrator) | — | Fix targets BUILD_MAP.md § 4.1 item 7; no ux.md change needed. |
| consistency#24 | TR-111 slow-host | fixed + xfile | 01-core.md:269; xfile X3 | Handoff only with signed `verifyEnv.reduced`; 04:113 condition requested. |
| consistency#30 | UX-003 vs PRV-025 | adapted | ux.md:34 | E-mail: `manufacturers[].contact` and `euResponsible.contact` accepted (Operator-owned). Product codes: the proposed JSON-LD `gtin`/`mpn`/`sku` exemption is agent-written (STANDARD C10), so replaced by an observable rule: an unbroken 8/12/13/14-digit run with a valid GS1 check digit is not a phone candidate unless it is a `tel:` href. |
| consistency#35 | PRV-026 vs UX-015 | n/a — privacy fixer | — | Fix is in privacy.md (that row's primary Location); UX-015 text unchanged and consistent with the proposed PRV-026 wording. |
| consistency#57 | UX-005 probe paths | fixed | ux.md:36 | RTE-004 Unknown-URL probes `/sg-{n}`, `/{p}/sg-{n}`; RTE-006 `sg-probe-404`. |
| consistency#78 | 02 § 6 API-004 gate | fixed | 02-adapters.md:94 | API-004 in G2. |
| consistency#103 | cache dir protected | adapted + xfile | 01-core.md:142; xfile X15 | TR-001 now names the cache dir (`cache.dir`, 03 § 7.3) as a protected path (05 § 3.1); the 05/03 edits are those fixers' rows, requested again as X15. |
| consistency#107 | TR-103 vs 04 § 15 | fixed | 01-core.md:252 | Same fix as concreteness#4. |
| consistency#108 | TR-112 vs 04 § 7 / WP-307 | xfile (BUILD_MAP skipped) | xfile X6 | 04 § 7 edit requested; WP-307 is the orchestrator's. |
| consistency#109 | ARC-010 vs AGT-001/003 | n/a — architecture fixer | — | Fix is in architecture.md; AGT-001/003 need no change (they stay the owners per the proposed ARC-010 text). |
| consistency#110 | conformance result format | fixed + xfile | 02-adapters.md:19, :103; xfile X13 | 02 cites the 03 § 6 conformance file, valid while adapter and fixture hashes match (not tied to the lock). Proposed location adapted to `quality/generated/conformance/<id>.json` so CI sees it. |
| consistency#111 | UX-009 vs REF-009 | fixed + xfile | ux.md:40; xfile X16 | UX-009 `notApplicable` with signed `refactor.json` or `--against`; REF-009 mirror requested. |
| consistency#112 | `inventory` actor | fixed | 01-core.md:26 | |
| consistency#113 | testing.md no-coverage outcome | n/a — testing fixer | — | Fix is in testing.md; 01:132 already says `notApplicable`. |
| consistency#114 | TST-004 proxy timing | adapted + xfile | 01-core.md:175; xfile X7 | G1 row says the proxy starts before G1 for TST-004 (04 § 4.6); 04 edit requested. |
| consistency#120 | † debt expiry | adapted + xfile | 01-core.md:123; xfile X14 | 01 § 5.5 states the `debt record`/`debt add` behaviour, citing 03 § 9. |
| consistency#121 | G8 summary | fixed | 01-core.md:182 | |
| consistency#124 | 05 telemetry statement | n/a — integrations fixer | — | Fix is in 05; TR-106 (01:255–259) already lists external link checks and declared hosts, so no 01 change. |
| consistency#125 | review entries per (rule, target) | fixed + xfile | 01-core.md:241; xfile X12 | |
| consistency#131 | CRW-001 owner | skipped (orchestrator) | — | ownership.tsv / BUILD_MAP only; TR-111 text unchanged. |
| coverage-real-use#3 | UX-023 (Must) | added + xfile | ux.md:60–63, :81; xfile X4, X9 | New rule UX-023 (P0): part `claims` (html, facts-oracle), part `minimum` (P1 cfg, required-facts). Owns UX-003 price/claim candidates and UX-013 phrases inside a term match. |
| coverage-real-use#17 | UX-001 part `mobile` (Should) | added + xfile | ux.md:33; xfile X4 | "Mobile counterpart" made decidable (same `journey`, `viewport: "mobile"`); operator-owned `missing-element`. |
| coverage-real-use#18 | UX-024 (Should) | adapted + xfile | ux.md:64–68, :82, :21; xfile X4, X10 | Added. Adaptations: unregistered image is builder-owned `forbidden-value` (facts-oracle), not operator-owned, so adding an image can't earn a handoff; "build manifest" matching dropped (host+path glob or SHA-256 only); checked images = rasters ≥ 128 px inside `<main>`, any host, not in iframes; credits page via new `ux.creditsPath` instead of a non-existent `legalPages.credits`. |
| coverage-visibility (ux) | — | none | — | coverage-visibility.md has no gap whose pack is ux (packs: web-delivery, programmatic, search-engines only). |

## Ownership rows
```
UX-023	*	WP-609	R07 new: commercial terms oracle (coverage-real-use#3), WP-609(a)
UX-024	*	WP-609	R07 new: image rights register (coverage-real-use#18), WP-609(c)
UX-001	part:mobile	WP-609	R07 new part (coverage-real-use#17); same WP as UX-001 *, listed for completeness
```

## Ruleset data
- `term-patterns.json` (per locale; UX-023) — WP-104 bullet "UX and analytics" (or a new "Round-7 data" bullet).
- `stock-preview-hosts.json` (UX-024 `stock-preview`) — WP-104 "UX and analytics" / "Round-7 data".
- `quality/data/image-sources.json` is an Operator data file, not ruleset data: register it with spec-lint as a known project file (it currently raises `ruleset-unsourced`) and with WP-203's Operator data files.

## Policy keys added (key · type · default · file)
- `ux.creditsPath` · route pattern without wildcards | null · `null` · spec/packs/ux.md
- (business.json, not policy) `terms` · object (shape in UX-023) · absent · 03 § 14 via xfile X9

## spec-lint (last three lines)
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":30,"warnings":64}
  errors by check: ownership=23 channel-infra=7
  warnings by check: ruleset-unsourced=64
```
(Re-run after the other fixers' parallel edits landed; exit code 1.) Errors in my files: `ownership` UX-023 and UX-024 (expected; rows above). Warnings in my files: `ruleset-unsourced` for `term-patterns.json`, `stock-preview-hosts.json` (expected; Ruleset data above) and `image-sources.json` (project data file; see above). All other errors and warnings are in other fixers' files (new-ID ownership rows and channel-infra rows of other packs).
