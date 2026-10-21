# Resolution — core-adapters-ux — pass B — round 07

Files: spec/01-core.md, spec/02-adapters.md, spec/packs/ux.md. Inputs: every `audit/rounds/07/xfile/from-*.md` request whose target is in these files, plus `audit/rounds/07/passB-notes.md`. No request targets 02-adapters.md (formats #16 says "02:19/:103 already match 03 § 6; no 02 edit needed" — confirmed: 02:103 cites "the conformance file of 03 § 6").

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| passB-notes#1 | page locale with no ruleset entry | fixed (overrides pass-A concreteness-core-adapters-ux#9) | ux.md:73; xfile from-core-adapters-ux.md "Pass B — withdrawals" | The PARTIAL / `reduced-environment` / `coverage.unsupportedLocales` outcome is removed. ux § 3 *Page locale and per-locale data* now only points to 04 § 15 page locale (lookup and no-entry outcome) and says a locale with no entry is never a skip, `notApplicable` or a `reduced-environment` handoff. My own pass-A requests X2 (04 § 1.6 partial cause), X3's unsupported-locale clause (04 § 1.9) and X11 (03 § 17 `coverage.unsupportedLocales`) are withdrawn in my xfile so the algorithms/formats fixers don't apply them. |
| passB-notes#2 | one definition of indexable page / page locale | fixed | ux.md:73; 01-core.md:196 | ux.md:73 no longer restates the lookup order (full tag → primary subtag → `en`); ux uses of "indexable" (:34, :58) already point to 04 § 15; AGT-005 "indexable pages" now points to 04 § 15 *Indexable page*. 01 and 02 have no second definition of either. |
| passB-notes#3 | SEC-028 logout owner | n/a — not in my files | — | security.md only. |
| passB-notes#4 | Operator-owned sources cited, not restated | fixed | ux.md:54, :56 | UX-020 *Valid db source*: the parenthetical restating 03 § 8 ("inserted by a seed file that is a lock input, written by no other statement before the read; a `run` seed is never valid") replaced by a citation of 03 § 8 *Operator-owned sources*. Part `stock` `feed`: "valid only when `merchantFeed` lies under `quality/data/`" → "valid only when that file is an Operator-owned source (03 § 8)". The `Offer.inventoryLevel` sentence stays (it names the rule-specific source the agent writes; 03 § 8 lists "anything the page, JSON-LD … states" consistently). |
| passB-notes#5 | orchestrator-owned targets | n/a | — | No request in my inputs targets CHANGES/BUILD_MAP/ownership/tools for my files. |
| xfile-algorithms#X3 | 01 TR-111 calibration point | fixed | 01-core.md:269 | "measured at the start of the first of G4 and G6 that runs (04 § 6.3)"; 04:255 already reads "At the start of the first of G4 and G6 that runs". |
| xfile-formats-integrations#16 | 01 § 5.2 `quality/conformance/**` row | fixed | 01-core.md:102 | Row added after the `quality/refactor.json, …` row: Operator (signed, 03 § 6; not a lock input), Builder read, Auditor read. Matches 03:259 and 05:45 (`quality/conformance/<id>.json`). |
| xfile-formats-integrations#17 | 01:26 `inventory` actor | rejected (already fixed) | 01-core.md:26 | Already reads: "`codegen` only on Operator or CI command; `inventory` is licence-free and may be run by anyone, 03 § 13" (pass A, consistency#112). |
| xfile-formats-integrations#18 | 01:241 review entries per (rule, target) | rejected (already fixed) | 01-core.md:242 | Already reads: "the Auditor writes one `review.json` entry per (applicable `review`-channel rule, target) pair, with `rule` set to that rule id and `target` set to that id" (pass A, consistency#125). |
| xfile-privacy-a11y-perf#X10 | UX-003 e-mails and non-phone digit strings | adapted | ux.md:34 | E-mails: `legal.dpo.email` and `legal.grievanceOfficer.email` added beside the pass-A `manufacturers[]` contacts (PRV-033, PRV-035 cited). Register numbers: a span inside a fact-containment occurrence (privacy § 1) of `legal.registerNumber`, `vatId`, `mailOrderNumber`, `icpNumber`, `psbNumber`, `cnpj` or `abn` is not a phone candidate unless a `tel:` href (`icpNumber`, `psbNumber` added: both shown on pages by PRV-022 `cn-icp`). Product codes: the proposed JSON-LD `gtin*`/`mpn`/`sku` exemption is **not** adopted — the agent writes JSON-LD, so it would let an agent exempt an invented phone number (03 § 8: "anything the page, JSON-LD or app code states" is never an oracle; STANDARD C10). Kept the pass-A GS1 check-digit rule and added the Operator-owned equivalent: digits equal to a `merchantFeed` item `id` or `gtin` when the feed is an Operator-owned source (03 § 8; both fields are in 03 § 14 *Merchant feed* "Fields read"). Keys `legal.dpo`, `legal.grievanceOfficer`, `legal.cnpj`, `legal.abn` depend on xfile-privacy-a11y-perf#X4 landing in 03 § 14 (formats fixer). |

## Ownership rows
None (no new rule IDs or parts in pass B).

## Ruleset data
None new. (`term-patterns.json`, `stock-preview-hosts.json` from pass A still pending in BUILD_MAP WP-104; `quality/data/image-sources.json` still to be registered as a known project file.)

## Policy keys added (key · type · default · file)
None.

## spec-lint (last three lines)
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":0,"warnings":65}
  errors by check: none
  warnings by check: ruleset-unsourced=64 ruleset-unnamed=1
```
(Run while the other 7 fixers were editing in parallel; an earlier run in the same minute showed `errors: 6` (ownership=5, channel-infra=1), none naming my files.) Warnings in my files: `ruleset-unsourced` for `term-patterns.json`, `stock-preview-hosts.json`, `image-sources.json` (expected, pass-A Ruleset data). The `ruleset-unnamed` warning is privacy.md:57 (privacy fixer's file).
