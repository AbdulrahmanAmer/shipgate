# Resolution — programmatic-search — pass B — round 07

Inputs: every request in `audit/rounds/07/xfile/from-*.md` targeting `spec/packs/programmatic.md` or `spec/packs/search-engines.md` (from-algorithms, from-security and from-web-delivery have none), plus `audit/rounds/07/passB-notes.md` items 1–5.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-core-adapters-ux#X17 | LOC-001 Ownership: `owns` `UX-003#phones` only on indexable pages | fixed | spec/packs/search-engines.md:130 | Cites "04 § 15 *Indexable page*". Matches ux.md:34 (UX-003 `phones` "not evaluated on indexable pages and is evaluated on every other public page"). |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#S1 | SE-109: `owns` `AEO-014#hidden-text` only with `paywalled-content` in signed `features` | adapted | spec/packs/search-engines.md:57 | Merged into the existing **Ownership** sentence instead of adding a second one. Added "and SE-109 still applies" so the gate narrows only the exemption, not SE-109. Mirrors answer-engines.md:43 and the RTE-010 paywall condition at :45. |
| xfile-formats-integrations#3 | programmatic `dataset`/`retired` must be under `quality/data/` (→ CFG-001) | adapted | spec/packs/programmatic.md:145 | New first bullet in § 1.3 *Family keys*, not in PCF-001: CFG-001 is the policy-schema rule, and 03 § 8 already names "programmatic: CFG-001". Covers per-locale datasets too (PCF-006 "one dataset per locale"). Cites 03 § 8 *Operator-owned sources* and does not repeat it (passB-notes #4). |
| xfile-formats-integrations#6 | LOC-001 `address`: accept `postalAddress`, `manufacturers[].address`, `euResponsible.address`; empty-`locations` rule | rejected (already fixed) | spec/packs/search-engines.md:130 | Fixed in pass A. Current text: "each candidate contains the `street`, `locality` and `postalCode` of one `locations[].address`, of `business.json` `postalAddress`, … of a `manufacturers[].address` … With an empty `locations`, the facts-oracle `forbidden-value` finding is raised only for a candidate matching none of these." The superset request (privacy X9) is applied below. |
| xfile-privacy-a11y-perf#X9 | LOC-001 `address`: also `legal.registeredOffice`, `legal.host.address`, `manufacturers[].euResponsible.address` | fixed | spec/packs/search-engines.md:125, :130 | Added the two `legal` addresses and corrected the EU path to `manufacturers[].euResponsible.address`, which is the 03 § 14 shape. Applied to both the part `address` text (:130) and the § 10 fallback bullet (:125). Parenthesis now reads "PRV-022, PRV-025 and PRV-030". Depends on 03 § 14 gaining `legal.registeredOffice`/`legal.host` (privacy X4 → 03 fixer); see xfile X12. |
| xfile-formats-integrations#19 | ROL-003 `rollout release --family <id>` → positional `<family>` | rejected (already fixed) | spec/packs/programmatic.md:231 | Current text: "`shipgate rollout release <family>` (Operator, 05 § 1)". No `--family` anywhere in programmatic.md (grep). |
| xfile-formats-integrations#25 | SE-113/SE-114 owner cite "04 § 14" → "04 § 15 *Owners of BLOCKED gates*" | rejected (cite is correct) + xfile | spec/packs/search-engines.md:61, :62 | The rule for reassigning a finding is in 04 § 14: "A finding whose fix lies outside the Builder's owned paths (`fixLocation`) is reassigned to owner `operator`." 04 § 15 *Owners of BLOCKED gates* covers gate owners, and the `parse-error` here is a finding, not a gate. The owner change itself (consistency#49) was done in pass A. An xfile request (X11) asks 03 § 14 *Merchant feed* to cite 04 § 14 as well. |
| passB-notes#1 | Page locale with no ruleset entry: cite 04 § 15, never a skip or fallback | fixed | spec/packs/programmatic.md:132, :170; spec/packs/search-engines.md:51, :66 | Removed the `ll-CC` → `ll` → `en` "04 § 14" lookup from § 1.1 *Per-locale word lists* (`stop-words.json`), DAT-012 `advice-patterns.json`, SE-103 `clickbait-patterns.json` and SE-121 `stop-words.json`/`verbs.json`. Each now cites "04 § 15 *Page locale*" for lookup and the no-entry outcome. DAT-012 is a cfg check, so it now runs per locale in the family's `locales`, with that locale as the page locale. Neither pack had a `reduced-environment` or PARTIAL outcome for missing locales (grep). The pass-A request X1 to 04 § 14 is withdrawn in the xfile. |
| passB-notes#2 | Indexable page and page locale defined once (04 § 15); packs only point to it | fixed | spec/packs/search-engines.md:77 | No second definition exists in either pack (grep for definitional "indexable … when/=" and "page locale"). search-engines § 3.3 `facets.indexable` explains when a facet combination counts as indexable. It now points to 04 § 15 *Indexable page* item 5 as the definition of the set. |
| passB-notes#3 | SEC-028 no logout flow → operator | rejected (not applicable) | — | Neither file mentions SEC-028 or logout flows. |
| passB-notes#4 | Operator-owned sources: cite 03 § 8, don't restate | fixed | spec/packs/programmatic.md:145 | The only new text on source ownership (`dataset`/`retired`) cites 03 § 8. The existing mentions (TPL-006 "Operator-owned pipeline", § 7 "Fixtures (Operator-owned)", ROL-003/DAT-017 "Operator-provided") name ownership without defining what counts as a source. They are left unchanged. |
| passB-notes#5 | Orchestrator-only targets: skip | rejected (not applicable) | — | No request targeting CHANGES.md, BUILD_MAP.md, trace/ownership.tsv or tools/ came to this group. |

## Ownership rows
None (no new rule IDs or parts).

## Ruleset data
None new.

## Policy keys added (key · type · default · file)
None. The `programmatic.families[].dataset` and `.retired` keys gain a schema constraint: the path prefix must be `quality/data/` (CFG-001).

## Cross-file requests filed this pass (audit/rounds/07/xfile/from-programmatic-search.md, "Pass B additions")
- X1 withdrawn: superseded by 04 § 15 *Page locale*.
- X11: 03 § 14 *Merchant feed* should cite "04 § 14" for the finding reassignment.
- X12: 03 § 14 must define `legal.registeredOffice` / `legal.host` and list them, and `manufacturers[].euResponsible.address`, in the LOC-001 comparison sentence (03:454).

## spec-lint (node tools/trace/spec-lint.mjs, exit 0) — last three lines
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":0,"warnings":65}
  errors by check: none
  warnings by check: ruleset-unsourced=64 ruleset-unnamed=1
```
Warnings in these files are ruleset sourcing that pass A expected and the orchestrator owns: `attribution-licences.json` (programmatic.md:220–221) and `local-listing-sources.json` (search-engines.md:133) are not yet in BUILD_MAP WP-102/WP-104. No errors.
